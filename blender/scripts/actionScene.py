import utils
import bpy
import env
from os import path
import actionCommon

# Set to true to debug steps to help debugging task
debugSteps = False
debugStepIndex = 0


def debugStep():
    if not debugSteps:
        return
    debugStepIndex += 1
    print(debugStepIndex)


def _exportSceneTextures(fp, sceneName):
    # Terrain Splatting Patterns
    actionCommon.exportFile(
        path.join(env.paths.currentFolder, 'TerrainSplatting.png'),
        fp,
        'Scene_' + sceneName + '_TerrainSplatting.png'
    )
    # Terrain Splatting Patterns
    actionCommon.exportFile(
        utils.resolvePath('SplattingPatterns.png', 'materials'),
        fp,
        'SplattingPatterns.png'
    )


def mergeCollider(objs, colliderType='SceneCollider'):
    useBase = False
    toMerge = []
    for obj in objs:
        if obj.type == 'CURVE':
            toMerge.append(utils.curveToMesh(obj))
        elif obj.name.startswith('__USE_BASE__'):
            useBase = True
        elif obj.type == 'MESH':
            toMerge.append(obj)
    mergedCollider = utils.mergeApply(toMerge)
    if mergedCollider != None:
        mergedCollider['type'] = colliderType
    return (mergedCollider, useBase)


def export(fp, origCol, textureOnly=False):
    debugStep()
    # Unselect all and force object mode
    # In case we need to use selection for operators
    utils.forceObjectMode()
    utils.deselectAll()

    # Extract asset name from collection
    debugStep()
    splitted = origCol.name.split(' - ')
    sceneName = utils.removeIncrement(splitted[1])

    # Log
    logMsg = 'Export Scene - ' + sceneName
    utils.info('--------------------------------')
    utils.log(utils.magenta(logMsg + '...'))

    # Create data dict
    # Will be exported as a json file next to the glb one
    data = {'name': sceneName}

    if textureOnly:
        _exportSceneTextures(fp, sceneName)
        return

    # Create a copy of the collection in a sandbox
    debugStep()
    scn, col = utils.sandboxCollection(origCol)
    if col == None:
        return
    bpy.context.window.scene = scn

    mergedBase = None
    entities = []
    traversableEntities = []
    toExport = []

    # Grab all subcollections
    # Parse them to extract mesh, meshStates, colliders
    for subcol in col.children:
        # print(col)
        seg = subcol.name
        kind = utils.removeIncrement(seg).lower()
        # print(kind)

        # Base items will be merged
        # Used to define scene bounds
        if kind.startswith('base'):
            mergedBase = utils.mergeApply(list(subcol.all_objects))
            data['bounds'] = [[0, 0, 0], [0, 0, 0]]
            if mergedBase == None:
                continue
            mergedBase['type'] = 'SceneBase'
            data['bounds'] = utils.getThreeBox3Bounds(mergedBase)
            toExport.append(mergedBase)

        # Scene colliders
        elif kind.startswith('colliders'):
            (mergedCollider, useBase) = mergeCollider(
                list(subcol.all_objects), 'SceneCollider')
            if mergedCollider == None:
                continue
            toExport.append(mergedCollider)

        # Props
        elif (
            kind.startswith('curves')
            or kind.startswith('props')
            or kind.startswith('datas')
            or kind.startswith('interactables')
        ):
            entities += list(subcol.all_objects)
        # Object without colliders
        elif kind.startswith('traversables'):
            entities += list(subcol.all_objects)
            traversableEntities += list(subcol.all_objects)

    # Exports items
    # Normalize name for exportable meshes
    debugStep()
    for obj in toExport:
        if obj == None:
            continue
        objName = obj['type']
        obj.name = objName

    # Export props, commons, datas, interactables, ...
    debugStep()
    (props, traversables) = actionCommon.exportEntities(
        entities,
        traversableEntities,
        data,
        True
    )

    # Export static props directly into the glb
    debugStep()
    empty = bpy.data.objects.new('empty', None)
    empty.name = 'Props'
    col.objects.link(empty)
    toExport.append(empty)
    for prop in props:
        col.objects.link(prop)
        prop.parent = empty

    # Export static traversables props directly into the glb
    debugStep()
    empty = bpy.data.objects.new('empty', None)
    empty.name = 'TraversableProps'
    col.objects.link(empty)
    toExport.append(empty)
    for prop in traversables:
        col.objects.link(prop)
        prop.parent = empty

    # Export textures
    # debugStep()
    _exportSceneTextures(fp, sceneName)

    # Append data to a json file
    debugStep()
    fname = 'Scene_' + sceneName
    print('------- EXPORT FINAL -------')
    print(data)
    utils.writeJSON(path.join(fp, fname + '.json'), data, True)

    # Export glb
    debugStep()
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
        export_apply=True,
        export_materials='NONE',
        export_normals=True,
        export_colors=True,
        export_skins=False,
        export_texcoords=True,
        export_extras=True,
        export_cameras=False,
        export_animations=False,
        export_lights=False,
        # export_image_format = 'NONE'
    )

    bpy.context.window.scene = scn
    bpy.ops.scene.delete()
    utils.success(logMsg + ' done')
