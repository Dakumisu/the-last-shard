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
    toMerge = []
    for obj in objs:
        if obj.type == 'CURVE':
            toMerge.append(utils.curveToMesh(obj))
        elif obj.type == 'MESH':
            toMerge.append(obj)

    mergedCollider = utils.mergeApply(toMerge, False)
    if mergedCollider != None:
        mergedCollider['type'] = colliderType
    return mergedCollider


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
    mergedCollider = None
    collidersCol = None
    entities = []
    traversableEntities = []
    movableEntities = []
    toExport = []

    # Grab all subcollections
    # Parse them to extract mesh, meshStates, colliders
    for subcol in col.children:
        seg = subcol.name
        kind = utils.removeIncrement(seg).lower()

        # Base items will be merged
        # Used to define scene bounds
        print(kind)
        if kind.startswith('base'):
            mergedBase = utils.mergeApply(
                list(subcol.all_objects), True, False, False, True)
            # default base bounds
            data['bounds'] = [[0, 0, 0], [0, 0, 0]]
            if mergedBase == None:
                continue
            mergedBase['type'] = 'SceneBase'
            data['bounds'] = utils.getThreeBox3Bounds(mergedBase)
            toExport.append(mergedBase)

        # Scene colliders
        elif kind.startswith('collider'):
            collidersCol = subcol
            entities += list(subcol.all_objects)

        # Props
        elif (
            kind.startswith('curves')
            or kind.startswith('datas')
        ):
            entities += list(subcol.all_objects)
        elif kind.startswith('traversable'):
            entities += list(subcol.all_objects)
            traversableEntities += list(subcol.all_objects)
        elif kind.startswith('movable'):
            entities += list(subcol.all_objects)
            movableEntities += list(subcol.all_objects)

    # Export props, commons, datas, interactables, ...
    debugStep()
    # (props, traversables) =
    actionCommon.exportEntities(
        entities,
        traversableEntities,
        movableEntities,
        data,
        True
    )

    if (collidersCol != None):
        # Gathers all colliders, to be merged later
        utils.deepSelect(collidersCol.all_objects)
        bpy.ops.object.duplicates_make_real(
            use_base_parent=False,
            use_hierarchy=False
        )
        utils.deepSelect(collidersCol.all_objects)
        bpy.ops.object.make_local(type='SELECT_OBDATA')
        utils.deselectAll()

        toMerge = []
        for o in collidersCol.all_objects:
            if (o.type == 'MESH'):
                toMerge.append(o)

        mergedCollider = mergeCollider(
            list(toMerge), 'SceneCollider')

        if mergedCollider == None:
            utils.log(utils.red('No collider found'))
        else:
            toExport.append(mergedCollider)

    # Exports items
    # Normalize name for exportable meshes
    debugStep()
    for obj in toExport:
        if obj == None:
            continue
        objName = obj['type']
        obj.name = objName
        # obj.data.name = objName
        # obj.data['type'] = objName

    # Export textures
    debugStep()
    _exportSceneTextures(fp, sceneName)

    # Append data to a json file
    debugStep()
    fname = 'Scene_' + sceneName
    # print('------- EXPORT FINAL -------')
    # print(data)
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

    # setting the scene back to the original scene
    i = 0
    for scene in bpy.data.scenes:
        if scene.name.endswith(sceneName):
            bpy.context.window.scene = bpy.data.scenes[i]
        i += 1

    utils.success(logMsg + ' done')
