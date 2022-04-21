import utils
from os import path
import json
import bpy
import actionCommon


def _exportAssetTextures(fp):
    actionCommon.exportFile(
        utils.resolvePath('Assets_Gradients.png', 'materials'),
        fp,
        'Assets_Gradients.png'
    )
    # Assets Data Map
    actionCommon.exportFile(
        utils.resolvePath('Assets_Data.png', 'materials'),
        fp,
        'Assets_Data.png'
    )
    # Assets Matcaps
    actionCommon.exportFile(
        utils.resolvePath('Matcaps.png', 'materials'),
        fp,
        'Matcaps.png'
    )


# Export asset
def export(fp, col, textureOnly=False):
    # Unselect all and force object mode
    # In case we need to use selection for operators
    utils.forceObjectMode()
    utils.deselectAll()

    # Extract asset name from collection
    splitted = col.name.split(' - ')
    name = utils.removeIncrement(splitted[1])

    # Log
    logMsg = 'Export Asset - ' + name
    utils.info('--------------------------------')
    utils.log(utils.magenta(logMsg + '...'))

    # Create data dict
    # Will be exported as a json file next to the glb one
    data = {
        'name': name
    }

    if textureOnly:
        _exportAssetTextures(fp)
        return

    # Create a copy of the collection in a
    scn, copyCol = utils.sandboxCollection(col)
    if copyCol == None:
        return
    bpy.context.window.scene = scn

    baseMesh = None
    rawMesh = None

    toMerge = []
    toExport = []

    # Grab all first level object
    # Parse them to extract mesh, colliders
    for obj in copyCol.objects[:]:
        # Only check first-level items
        if obj.parent:
            continue
        seg = obj.name.split(' - ')
        if len(seg) < 2:
            continue
        kind = seg[1].lower().strip()
        if kind.startswith('colliders'):
            obj['asset'] = name
            obj['type'] = 'Collider'
            toMerge.append(obj)
        elif kind.startswith('rawmesh'):
            obj['asset'] = name
            obj['type'] = 'RawMesh'
            data['useRawMesh'] = True
            rawMesh = obj
        elif kind.startswith('mesh'):
            obj['type'] = 'Mesh'
            baseMesh = obj

    if rawMesh:
        toExport.append(rawMesh)
    elif baseMesh:
        toMerge.append(baseMesh)

    # Merge items
    bounds = [[0, 0, 0], [0, 0, 0]]
    for obj in toMerge:
        meshes = utils.getAllMeshes(obj)
        utils.applyModifiers(meshes)
        merged = utils.mergeMeshes(meshes, True)
        if not merged:
            continue
        utils.clearParent(merged)
        utils.applyTransforms(merged)
        toExport.append(merged)
        merged['asset'] = name
        merged['type'] = obj['type']
        if obj['type'] == 'Collider':
            continue
        # Compute bounds
        if obj['type'] == 'Mesh':
            nbounds = utils.getThreeBox3Bounds(merged, 3)
            for i in range(0, 3):
                bounds[0][i] = min(bounds[0][i], nbounds[0][i])
                bounds[1][i] = max(bounds[1][i], nbounds[1][i])

    data['bounds'] = bounds

    # Exports items
    # Normalize name for exportable meshes
    for obj in toExport:
        objName = obj['type']
        obj.pop('asset')
        obj.name = objName

    # Add bounds directly to the glb
    if 'bounds' in data:
        b = data['bounds']
        objName = 'Bounds_'
        objName += str(b[0][0]) + '|'
        objName += str(b[0][1]) + '|'
        objName += str(b[0][2]) + '|'
        objName += str(b[1][0]) + '|'
        objName += str(b[1][1]) + '|'
        objName += str(b[1][2])
        objName += '_'
        obj = bpy.data.objects.new(objName, None)
        copyCol.objects.link(obj)
        toExport.append(obj)

    # Also append data to a json file
    fname = 'Asset_' + name

    # Export textures
    # Assets Gradient Map
    _exportAssetTextures(fp)

    # Export glb
    utils.deselectAll()
    utils.deepSelect(toExport)
    gltfPath = path.join(fp, fname)
    bpy.ops.export_scene.gltf(
        filepath=gltfPath,
        use_selection=True,
        export_format="GLB",
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=6,
        export_yup=True,
        export_materials='NONE',
        export_normals=True,
        export_colors=False,
        export_skins=False,
        export_texcoords=True,
        export_extras=False,
        export_cameras=False,
        export_animations=False,
        export_lights=False,
        export_apply=True,
        # export_image_format = 'NONE'
    )

    bpy.context.window.scene = scn
    bpy.ops.scene.delete()
    utils.success(logMsg + ' done')
