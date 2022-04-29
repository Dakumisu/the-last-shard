import bpy
import os
from os import path
import json
import struct
import re
import shutil
from collections import defaultdict


###############
#### Paths ####
###############

def resolvePath(fp='.', dirname='root'):
    from env import resolvePath
    return resolvePath(fp, dirname)


####################
#### Filesystem ####
####################

# Remove an existing folder
def removeFolder(fp):
    if not path.exists(fp):
        return
    if not path.isdir(fp):
        return
    shutil.rmtree(fp)


# Empty a folder
def cleanFolder(fp):
    removeFolder(fp)
    os.makedirs(fp)


# Write an array buffer of float 32 numbers
def writeFloat32Binary(fp, data):
    buf = bytes()
    buf = struct.pack('%sf' % len(data), *data)
    saveFile = open(fp, 'wb')
    saveFile.write(buf)
    saveFile.close()


# Write a dict in a json
def writeJSON(fp, data, pretty=True):
    indent = 2 if pretty else 0
    with open(fp, 'w') as file:
        json.dump(data, file, indent=indent)


# Read a json gracefuly, with a default fallback
def readJSON(fp, default=None):
    if not path.exists(fp):
        return default
    with open(fp, 'r') as file:
        try:
            return json.load(file)
        except ValueError:
            return default


def copyFile(src, dst):
    if (not path.exists(src)):
        return
    shutil.copy2(src, dst)


##############
#### Data ####
##############

# Vec/Qt/Scale to number list
def toNumberList(el, precision=-1):
    arr = el[0:len(el)]
    if precision > -1:
        arr = list(map(lambda v: round(v, precision), arr))
    return arr


def toThreePos(el):
    y = -el[1]
    el[1] = el[2]
    el[2] = y
    return el


def toThreeScale(el):
    y = el[1]
    el[1] = el[2]
    el[2] = y
    return el


def toThreeQuaternion(el):
    x = el[0]
    el[0] = el[1]
    el[1] = el[3]
    el[2] = -el[2]
    el[3] = x
    return el


def getThreeBox3Bounds(obj, precision=6):
    bbox = obj.bound_box
    bbmin = toNumberList(bbox[0], precision)
    bbmax = toNumberList(bbox[6], precision)
    return [
        [bbmin[0], bbmin[2], -bbmax[1]],
        [bbmax[0], bbmax[2], -bbmin[1]]
    ]


# Ensure variable is a list
def ensureList(v=None, allowTuple=True):
    if type(v).__name__ == 'bpy_prop_collection':
        v = v.values()
    isList = isinstance(v, list)
    isTuple = isinstance(v, tuple)
    if isList or (isTuple and allowTuple):
        return v
    elif isTuple and not allowTuple:
        return list(v)
    else:
        return [v]


##############
#### Misc ####
##############

# Transform dict to object-literal syntax
class dotobject(dict):
    __getattr__ = dict.get
    __setattr__ = dict.__setitem__
    __delattr__ = dict.__delitem__


#################
#### Blender ####
#################

# Create a bounding box
def createBoundingBox(obj):
    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
    bpy.ops.mesh.primitive_cube_add()
    bound_box = bpy.context.active_object
    bound_box.dimensions = obj.dimensions
    bound_box.location = obj.location
    bound_box.rotation_euler = obj.rotation_euler

    return bound_box


# Set blender context to object mode
def forceObjectMode():
    if not bpy.context.mode == 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')


# Select an object and its descendings
def deepSelect(objs, deselect=True):
    if deselect:
        deselectAll()
    objs = getAllObjects(objs)
    for obj in objs:
        obj.select_set(True)


# Deselect all objects
def deselectAll():
    bpy.ops.object.select_all(action='DESELECT')
    # bpy.context.view_layer.objects.active = None
    # for ob in bpy.context.selected_objects:
    #     if hasattr(ob, 'select'): ob.select = False


# Select all objects
def selectAll():
    bpy.ops.object.select_all(action='SELECT')


# Remove blender "incremental" suffix in object names
def removeIncrement(s):
    return re.sub('\.[0-9]+$', '', s.strip())


# Get all objects and descendants into a list
def getAllObjects(objs, items=None):
    if items == None:
        items = []
    for obj in ensureList(objs):
        items.append(obj)
        if hasattr(obj, 'children'):
            getAllObjects(obj.children, items)
    return items


# Get all meshes from objects
def getAllMeshes(objs, items=None):
    if items == None:
        items = []
    for obj in ensureList(objs):
        if obj.type == 'MESH':
            items.append(obj)
        if hasattr(obj, 'children'):
            getAllMeshes(obj.children, items)
    return items


# Create a blender context with selected objects from a list of objects
def createSelectionContext(objs, activeObj=None):
    objs = ensureList(objs)
    if activeObj == None:
        activeObj = objs[0]
    ctx = {}
    if len(objs) < 1:
        return ctx
    ctx['object'] = ctx['active_object'] = objs[0]
    ctx['selected_objects'] = ctx['selected_editable_objects'] = objs
    return ctx


# Apply all modifiers to the passed objects
def applyModifiers(objs=None):
    objs = ensureList(objs)
    failed = []
    for obj in objs:
        ctx = bpy.context.copy()
        ctx['object'] = obj
        for mod in obj.modifiers[:]:
            ctx['modifier'] = mod
            is_mod = True
            try:
                bpy.ops.object.modifier_apply(
                    ctx, modifier=ctx['modifier'].name)
            except:
                objName = getattr(obj, 'name', 'NO NAME')
                failed.append(objName)
    if len(failed) > 0:
        error('Applying failed on' + ', '.join(failed))


# Merge meshes together
# Will use first mesh of the list as active mesh
def mergeMeshes(meshes=[], forceUVMap=False):
    meshes = ensureList(meshes)
    if len(meshes) < 1:
        return None
    # Force UVMap as uv attr name to avoid loosing uv data
    if forceUVMap:
        for obj in meshes:
            for uvmap in obj.data.uv_layers:
                uvmap.name = 'UVMap'
    # Do not merge if there is only one mesh
    if len(meshes) == 1:
        return meshes[0]
    ctx = createSelectionContext(meshes)
    bpy.ops.object.join(ctx)
    return meshes[0]


# Remove parent of an object but keeps transformations
def clearParent(obj):
    if not obj:
        return
    matrixcopy = obj.matrix_world.copy()
    obj.parent = None
    obj.matrix_world = matrixcopy
    return obj


# Apply object transforms
def applyTransforms(obj, loc=True, rot=True, scale=True):
    if not obj:
        return
    ctx = createSelectionContext(obj)
    bpy.ops.object.transform_apply(
        ctx, location=loc, rotation=rot, scale=scale)
    return obj


def mergeApply(obj, transform=True, loc=True, rot=True, scale=True):
    meshes = getAllMeshes(obj)
    if len(meshes) < 1:
        return None
    applyModifiers(meshes)
    merged = mergeMeshes(meshes, True)
    if not merged:
        return None
    clearParent(merged)
    if transform:
        applyTransforms(merged, loc, rot, scale)
    return merged


# Create a copy of a collection into a new scene
# This is mainly used to easily manipulate linked collection
def sandboxCollection(origCollection, scnName="DEV"):
    scn = bpy.data.scenes.new(scnName)
    copyCollection(scn.collection, origCollection)
    colname = removeIncrement(origCollection.name)
    collection = findCollection(scn.collection.children, colname)
    return scn, collection


def copyCollection(parent, collection, linked=False):
    dupe_lut = defaultdict(lambda: None)

    def _copy_objects(from_col, to_col, linked, dupe_lut):
        for o in from_col.objects:
            dupe = o.copy()
            if not linked and o.data:
                dupe.data = dupe.data.copy()
            to_col.objects.link(dupe)
            dupe_lut[o] = dupe

    def _copy(parent, collection, linked=False):
        cc = bpy.data.collections.new(collection.name)
        _copy_objects(collection, cc, linked, dupe_lut)
        for c in collection.children:
            _copy(cc, c, linked)
        parent.children.link(cc)
    _copy(parent, collection, linked)
    for o, dupe in tuple(dupe_lut.items()):
        parent = dupe_lut[o.parent]
        if parent:
            dupe.parent = parent


def findCollection(parent, needle, matchCase=False):
    needle = needle.strip() if matchCase else needle.lower().strip()
    needle = removeIncrement(needle)
    for c in parent:
        cname = c.name.strip() if matchCase else c.name.lower().strip()
        if removeIncrement(cname) == needle:
            return c


def curveToMesh(curve, context=None):
    if context == None:
        context = bpy.context
    deg = context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(
        curve.evaluated_get(deg), depsgraph=deg)
    newObj = bpy.data.objects.new(curve.name + "_mesh", me)
    context.collection.objects.link(newObj)
    deselectAll()
    newObj.matrix_world = curve.matrix_world
    newObj.select_set(True)
    context.view_layer.objects.active = newObj
    return newObj


#################
#### Logging ####
#################

def info(v): print('\033[96m' + 'MM  ' + '\033[0m\033[2m' + v + '\033[0m')
def log(v): print('\033[96m' + 'MM  ' + '\033[0m' + v)
def warn(v): print('\033[93m' + 'MM  ' + '\033[0m\033[93m' + v + '\033[0m')
def error(v): print('\033[91m' + 'MM  ' + '\033[0m\033[91m' + v + '\033[0m')
def success(v): print('\033[96m' + 'MM  ' +
                      '\033[0m\033[92m✓ ' + v + '\033[0m')


def green(v): return '\033[92m' + v + '\033[0m'
def cyan(v): return '\033[96m' + v + '\033[0m'
def yellow(v): return '\033[93m' + v + '\033[0m'
def magenta(v): return '\033[95m' + v + '\033[0m'
def red(v): return '\033[91m' + v + '\033[0m'
