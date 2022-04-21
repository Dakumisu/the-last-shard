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


def exportBezier(curves, obj, name, spline):
    data = {}
    data['type'] = 'BEZIER'
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
    curves[name] = data


# From Emilien for Kode - will be converted as a catmull3 curve
def exportNurbs(curves, obj, name, spline):
    data = {}
    data['type'] = 'NURBS'
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
    curves[name] = data


def exportPolyline(curves, obj, name, spline):
    data = {}
    data['type'] = 'POLY'
    data['closed'] = spline.use_cyclic_u
    data['points'] = []
    utils.applyTransforms(obj)
    if len(spline.points) > 0:
        for point in spline.points.values():
            pos = utils.toThreePos(utils.toNumberList(point.co, 4))
            data['points'].append(pos)
    curves[name] = data


# Export entities like npc, assets, helpers, etc

def exportEntities(objs, traversableObjs, data, keepProps=False):
    # Export instanced types (props, etc...)
    props = []
    traversables = []

    for obj in objs:
        if obj.instance_type != 'COLLECTION':
            continue

        rawseg = obj.name.split(' - ')
        seg = utils.removeIncrement(obj.name).split(' - ')
        icol = obj.instance_collection
        colSeg = icol.name.split(' - ')
        if len(colSeg) < 2:
            continue

        category = colSeg[0].lower().strip()
        type = seg[0].lower().strip()
        uid = rawseg[1].strip()
        kind = seg[1].strip()
        asset = seg[1].strip()

        if category == 'asset':
            group = 'props'
        elif category == 'prop':
            group = 'props'

        # elif category == 'actor':
        #     group = 'actors'
        # elif category == 'actors':
        #     group = 'actors'
        # elif category == 'npc':
        #     group = 'actors'
        # else:
        #     continue

        # print('------------------------------------- GROUP')
        # print(group)

        isActor = group == 'actors'

        if group == 'props':
            if 'assets' not in data:
                data['assets'] = []
            if asset not in data['assets']:
                data['assets'].append(asset)

        if group == 'props' and keepProps:
            empty = bpy.data.objects.new('empty', None)
            empty.name = ''
            empty.matrix_world = obj.matrix_world
            empty['asset'] = asset
            props.append(empty)
            # if obj in traversableObjs:
            #     traversables.append(empty)
            # else:
            #   props.append(empty)
            # continue

        if type not in data:
            data[type] = []

        # Gather pos / scale / qt
        pos, qt, scale = obj.matrix_world.decompose()
        pos = utils.toThreePos(utils.toNumberList(pos, 6))
        scale = utils.toThreeScale(utils.toNumberList(scale, 8))
        qt = utils.toThreeQuaternion(utils.toNumberList(qt, 6))

        # Get actors params
        params = None
        # if isActor:
        #     for K in obj.keys():
        #         if K.startswith('_'):
        #             continue
        #         if K == 'hops':
        #             continue
        #         v = obj[K]
        #         if (
        #             not isinstance(v, str)
        #             and not isinstance(v, float)
        #             and not isinstance(v, int)
        #             and not isinstance(v, bool)
        #         ):
        #             continue
        #         # Do not exports hard ops properties
        #         # if K == 'hops': continue
        #         if params == None:
        #             params = {}
        #         params[K] = v

        objData = {}

        if not isActor:
            objData['asset'] = asset
        if not isActor and obj in traversableObjs:
            objData['traversable'] = True

        if isActor:
            objData['uid'] = uid
        if isActor:
            objData['type'] = kind
        if isActor and params != None:
            objData['params'] = params

        # Pack transformations
        objData['transforms'] = {'pos': pos, 'scale': scale, 'qt': qt}

        data[type].append(objData)
        # print('------------------------------------- TYPE')
        # print(type)
        # print(data[type])

    # Export points
    for obj in objs:
        if obj.type != 'EMPTY':
            continue

        seg = obj.name.split(' - ')
        if len(seg) < 2:
            continue
        if seg[0].lower().strip() != 'point':
            continue
        if 'points' not in data:
            data['points'] = {}
        ptName = seg[1]
        pos, qt, scale = obj.matrix_world.decompose()
        pos = utils.toThreePos(utils.toNumberList(pos, 6))
        qt = utils.toThreeQuaternion(utils.toNumberList(qt, 6))
        data['points'][ptName] = {'pos': pos, 'qt': qt}

    # Export areas
    for obj in objs:
        if obj.type != 'EMPTY':
            continue

        seg = obj.name.split(' - ')
        if len(seg) < 2:
            continue
        if seg[0].lower().strip() != 'area':
            continue

        if 'areas' not in data:
            data['areas'] = {}
        ptName = seg[1]
        pos, qt, scale = obj.matrix_world.decompose()
        pos = utils.toThreePos(utils.toNumberList(pos, 6))
        size = round(obj.empty_display_size, 3)

        area = {}
        area['position'] = pos
        area['size'] = size

        data['areas'][ptName] = area

    # Export curves
    for obj in objs:
        if obj.type != 'CURVE':
            continue

        seg = obj.name.split(' - ')
        if len(seg) < 2:
            continue
        if seg[0].lower().strip() != 'curve':
            continue
        if 'curves' not in data:
            data['curves'] = {}
        curves = data['curves']
        curveName = seg[1]
        if len(obj.data.splines) < 1:
            continue
        elif len(obj.data.splines) > 1:
            utils.warn(
                'Curve '
                + curveName
                + ' - Cannot export more than one curve per object'
            )
        spline = obj.data.splines[0]
        if spline.type == 'BEZIER':
            exportBezier(curves, obj, curveName, spline)
        elif spline.type == 'NURBS':
            exportNurbs(curves, obj, curveName, spline)
        elif spline.type == 'POLY':
            exportPolyline(curves, obj, curveName, spline)

    # Export Interactables
    # for obj in objs:
    #     if obj.type != 'MESH':
    #         continue

    #     rawSeg = obj.name.split(' - ')
    #     seg = utils.removeIncrement(obj.name).split(' - ')
    #     if len(rawSeg) < 2:
    #         continue
    #     if rawSeg[0].lower().strip() != 'interactable':
    #         continue
    #     if 'interactables' not in data:
    #         data['interactables'] = {}

    #     name = rawSeg[1]
    #     kind = seg[1]

    #     if 'assets' not in data:
    #         data['assets'] = []
    #     if kind not in data['assets']:
    #         addToProps(obj, kind, props, data)
    #         # data['assets'].append(kind)
    #         # props.append(obj)

    #     pos, qt, scale = obj.matrix_world.decompose()
    #     pos = utils.toThreePos(utils.toNumberList(pos, 6))
    #     qt = utils.toThreeQuaternion(utils.toNumberList(qt, 6))
    #     scale = utils.toThreeScale(utils.toNumberList(scale, 8))
    #     data['interactables'][name] = {'pos': pos, 'qt': qt, 'scale': scale}

    # Export Props
    # for obj in objs:
    #     if obj.type != 'EMPTY':
    #         continue

    #     rawSeg = obj.name.split(' - ')
    #     seg = utils.removeIncrement(obj.name).split(' - ')
    #     if len(rawSeg) < 2:
    #         continue
    #     if rawSeg[0].lower().strip() != 'prop':
    #         continue
    #     if 'props' not in data:
    #         data['props'] = {}

    #     name = rawSeg[1]
    #     kind = seg[1]

    #     if 'assets' not in data:
    #         data['assets'] = []
    #     if kind not in data['assets']:
    #         addToProps(obj, kind, props, data)

    #         # data['assets'].append(kind)
    #         # props.append(obj)

    #     print('---------- PROP ' + name + ' ----------')
    #     pos, qt, scale = obj.matrix_world.decompose()
    #     pos = utils.toThreePos(utils.toNumberList(pos, 6))
    #     qt = utils.toThreeQuaternion(utils.toNumberList(qt, 6))
    #     scale = utils.toThreeScale(utils.toNumberList(scale, 8))
    #     data['props'][name] = {'pos': pos, 'qt': qt, 'scale': scale}

    if keepProps:
        return (props, traversables)
