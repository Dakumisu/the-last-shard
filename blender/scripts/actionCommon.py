from multiprocessing.dummy import Array
import store
import env
import utils
import bpy
import bmesh
from os import path


def dedupeName(name, counts):
    if name not in counts:
        counts[name] = -1
    counts[name] += 1
    if counts[name] > 0:
        name += '_' + str(counts[name])
    return name


def addToProps(obj, name, props, data):
    props.append(obj)
    data['assets'].append(name)


def exportFile(source, dist, name):
    sourcePath = path.join(source)
    distPath = path.join(dist, name)
    cache = store.getValue('texturesCache')
    if (distPath not in cache):
        if not path.exists(sourcePath):
            return
        utils.info('Export file ' + name)
        utils.copyFile(sourcePath, distPath)
        cache.append(distPath)


def exportBezier(curves, obj, type, name, spline):
    data = {}
    data['name'] = name
    data['type'] = type
    data['curve'] = 'bezier'
    data['closed'] = spline.use_cyclic_u
    data['points'] = []
    utils.applyTransforms(obj)
    if len(spline.bezier_points) > 0:
        for point in spline.bezier_points.values():
            handle_left = utils.toThreePos(
                utils.toNumberList(point.handle_left, 4))
            control = utils.toThreePos(utils.toNumberList(point.co, 4))
            handle_right = utils.toThreePos(
                utils.toNumberList(point.handle_right, 4))
            data['points'].append([] + control + handle_left + handle_right)

    params = {}
    for key in obj.keys():
        if key.startswith('_'):
            continue
        # if key != 'effect':
        #     continue
        v = obj[key]
        if (
            not isinstance(v, str)
            and not isinstance(v, float)
            and not isinstance(v, int)
            and not isinstance(v, bool)
        ):
            continue
        # Do not exports hard ops properties
        params[key] = v

    data['params'] = params
    print(data)
    curves.append(data)


# From Emilien for Kode - will be converted as a catmull3 curve
def exportNurbs(curves, obj, type, name, spline):
    data = {}
    data['name'] = name
    data['type'] = type
    data['curve'] = 'nurbs'
    data['closed'] = spline.use_cyclic_u
    data['points'] = []
    utils.applyTransforms(obj)
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.transform_apply(rotation=True, scale=True)
    if obj.mode == 'EDIT':
        bm = bmesh.from_edit_mesh(obj.data)
        vertices = bm.verts
    else:
        vertices = obj.data.vertices
    for i in range(len(vertices)):
        vertex = vertices[i]
        co = obj.matrix_world @ vertex.co
        pos = utils.toThreePos(utils.toNumberList(co, 4))
        data['points'].append(pos)

    params = {}
    for key in obj.keys():
        if key.startswith('_'):
            continue
        # if key != 'effect':
        #     continue
        v = obj[key]
        if (
            not isinstance(v, str)
            and not isinstance(v, float)
            and not isinstance(v, int)
            and not isinstance(v, bool)
        ):
            continue
        # Do not exports hard ops properties
        params[key] = v

    data['params'] = params
    print(data)
    curves.append(data)


def exportPolyline(curves, obj, type, name, spline):
    data = {}
    data['name'] = name
    data['type'] = type
    data['curve'] = 'poly'
    data['closed'] = spline.use_cyclic_u
    data['points'] = []
    utils.applyTransforms(obj)
    if len(spline.points) > 0:
        for point in spline.points.values():
            pos = utils.toThreePos(utils.toNumberList(point.co, 4))
            data['points'].append(pos)

    params = {}
    for key in obj.keys():
        if key.startswith('_'):
            continue
        # if key != 'effect':
        #     continue
        v = obj[key]
        if (
            not isinstance(v, str)
            and not isinstance(v, float)
            and not isinstance(v, int)
            and not isinstance(v, bool)
        ):
            continue
        # Do not exports hard ops properties
        params[key] = v

    data['params'] = params

    print(data)
    curves.append(data)


# Export entities like interactables, assets, helpers, etc...
def exportEntities(objs, traversableObjs, movableEntities, data, keepProps=False):
    # Export instanced types (props, etc...)
    props = []
    traversables = []
    movables = []

    for obj in objs:
        if obj.instance_type != 'COLLECTION':
            continue

        rawseg = obj.name.split(' - ')
        seg = utils.removeIncrement(obj.name).split(' - ')
        icol = obj.instance_collection
        colSeg = icol.name.split(' - ')
        if len(colSeg) < 2:
            continue

        type = seg[0].lower().strip()
        uid = rawseg[1].strip()
        asset = seg[1].strip()

        isInteractable = type == 'interactable'

        category = 'collider'
        if isInteractable:
            category = 'interactable'

        isMovable = False
        if obj in movableEntities:
            isMovable = True

        if 'assets' not in data:
            data['assets'] = []
        if asset not in data['assets']:
            data['assets'].append(asset)

        if keepProps:
            empty = bpy.data.objects.new('empty', None)
            empty.name = ''
            empty.matrix_world = obj.matrix_world
            empty['asset'] = asset
            if obj in traversableObjs:
                traversables.append(empty)
            if obj in movableEntities:
                movables.append(empty)
            else:
                props.append(empty)

        newType = type + 's'
        if newType not in data:
            data[newType] = []

        # Gather pos / scale / qt
        pos, qt, scale = obj.matrix_world.decompose()
        pos = utils.toThreePos(utils.toNumberList(pos, 6))
        scale = utils.toThreeScale(utils.toNumberList(scale, 8))
        qt = utils.toThreeQuaternion(utils.toNumberList(qt, 6))

        # Get interactable effect
        params = {}
        # print(category, type, asset)
        # print('-------------', isMovable, isInteractable)
        # if isInteractable or isMovable:

        for key in obj.keys():
            print(key)
            if key.startswith('_'):
                continue
            # if key != 'effect':
            #     continue
            v = obj[key]
            if (
                not isinstance(v, str)
                and not isinstance(v, float)
                and not isinstance(v, int)
                and not isinstance(v, bool)
            ):
                continue
            # Do not exports hard ops properties
            params[key] = v

        print('------------', obj.name)
        print(params)
        objData = {}

        objData['asset'] = asset
        objData['uid'] = uid
        objData['type'] = category

        if obj in traversableObjs:
            objData['traversable'] = True
        else:
            objData['traversable'] = False

        objData['movable'] = isMovable

        if (params != None):
            objData['params'] = params

        # Pack transformations
        objData['transforms'] = {
            'pos': pos,
            'scale': scale,
            'qt': qt,
        }

        if isMovable:
            objData['anim'] = []

        data[newType].append(objData)

    # Export points
    for obj in objs:
        if obj.type != 'EMPTY':
            continue

        seg = utils.removeIncrement(obj.name).split(' - ')
        rawSeg = obj.name.split(' - ')

        if len(rawSeg) < 2:
            continue
        type = rawSeg[0].lower().strip()

        if type.lower().strip() == 'point':
            if 'points' not in data:
                data['points'] = []

            ptName = seg[1]
            uid = rawSeg[1]
            pos, qt, scale = obj.matrix_world.decompose()
            pos = utils.toThreePos(utils.toNumberList(pos, 6))
            qt = utils.toThreeQuaternion(utils.toNumberList(qt, 6))
            ptData = {'type': ptName, 'uid': uid, 'pos': pos, 'qt': qt}
            data['points'].append(ptData)

        if type.lower().strip() == 'transform':
            ptName = seg[1]
            uid = rawSeg[1]
            rawTarget = ptName.split('_')
            target = rawTarget[0]
            id = rawTarget[1]

            pos, qt, scale = obj.matrix_world.decompose()
            pos = utils.toThreePos(utils.toNumberList(pos, 6))
            qt = utils.toThreeQuaternion(utils.toNumberList(qt, 6))
            scale = utils.toThreeScale(utils.toNumberList(scale, 8))

            transformData = {
                'pos': pos,
                'qt': qt,
                'scale': scale
            }

            for prop in data['props']:
                if (prop['asset'] == target and prop['movable']):
                    for param in prop['params']:
                        if (prop['params'][param] != ptName):
                            continue
                        prop['anim'].append(transformData)
        else:
            continue

    # Export areas
    for obj in objs:
        if obj.type != 'EMPTY':
            continue

        rawseg = obj.name.split(' - ')
        seg = utils.removeIncrement(obj.name).split(' - ')

        if len(rawseg) < 2:
            continue

        type = rawseg[0].lower().strip()
        if type.lower().strip() != 'area':
            continue

        if 'areas' not in data:
            data['areas'] = []

        zone = seg[1]
        pos, qt, scale = obj.matrix_world.decompose()
        pos = utils.toThreePos(utils.toNumberList(pos, 6))
        scale = utils.toThreeScale(utils.toNumberList(scale, 6))

        areaData = {'zone': zone, 'pos': pos, 'size': scale[0]}

        data['areas'].append(areaData)

    # Export curves
    for obj in objs:
        if obj.type != 'CURVE':
            continue

        seg = utils.removeIncrement(obj.name).split(' - ')
        if len(seg) < 2:
            continue

        type = seg[0].lower().strip()
        name = seg[1].strip()
        if type.lower().strip() != 'cam' and type.lower().strip() != 'helper':
            continue

        if 'curves' not in data:
            data['curves'] = []

        curves = data['curves']

        if len(obj.data.splines) < 1:
            continue

        elif len(obj.data.splines) > 1:
            utils.warn(
                'Curve '
                + name
                + ' - Cannot export more than one curve per object'
            )
        spline = obj.data.splines[0]
        if spline.type == 'BEZIER':
            exportBezier(curves, obj, type, name, spline)
        elif spline.type == 'NURBS':
            exportNurbs(curves, obj, type, name, spline)
        elif spline.type == 'POLY':
            exportPolyline(curves, obj, type, name, spline)

    if keepProps:
        return (props, traversables, movables)
