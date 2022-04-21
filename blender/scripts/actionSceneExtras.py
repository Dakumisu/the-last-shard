import utils
import bpy
import store
import env
from os import path
import actionCommon


def export(fp, origCol, textureOnly=False):
    if textureOnly:
        return

    # Unselect all and force object mode
    # In case we need to use selection for operators
    utils.forceObjectMode()
    utils.deselectAll()

    # Extract asset name from collection
    splitted = origCol.name.split(' - ')
    sceneName = utils.removeIncrement(splitted[1])

    # Log
    logMsg = 'Export Scene ' + sceneName + ' Extras'

    utils.info('--------------------------------')
    utils.log(utils.magenta(logMsg + '...'))

    # Create data dict
    # Will be exported as a json file next to the glb one
    data = {'name': sceneName}

    # Create a copy of the collection in a sandbox
    scn, col = utils.sandboxCollection(origCol)
    if col == None:
        return
    bpy.context.window.scene = scn

    # Export entities
    entities = list(col.all_objects)
    print('HERE')
    print(entities)
    actionCommon.exportEntities(entities, [], data)

    # Append data to a json file
    fname = 'SceneExtras_' + sceneName
    utils.writeJSON(path.join(fp, fname + '.json'), data, False)

    bpy.context.window.scene = scn
    bpy.ops.scene.delete()
    utils.success(logMsg + ' done')
