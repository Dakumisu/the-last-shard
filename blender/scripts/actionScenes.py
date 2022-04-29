import utils
import bpy
from os import path


def export(fp, origCol, textureOnly=False):
    if textureOnly:
        return

    # Unselect all and force object mode
    # In case we need to use selection for operators
    utils.forceObjectMode()
    utils.deselectAll()

    # Log
    logMsg = 'Export all Scenes'
    utils.info('--------------------------------')
    utils.log(utils.magenta(logMsg + '...'))

    # Create data dict
    # Will be exported as a json file next to the glb one
    data = []

    # Create a copy of the collection in a sandbox
    scn, col = utils.sandboxCollection(origCol)
    if col == None:
        return

    bpy.context.window.scene = scn

    # Grab all first level object
    # Parse them to extract mesh, meshStates, colliders

    print(col)
    for obj in col.all_objects[:]:
        print(obj)
        if obj.instance_type != 'COLLECTION':
            continue

        icol = obj.instance_collection
        if icol == None:
            continue

        seg = icol.name.split(' - ')
        if len(seg) < 2:
            continue

        iname = seg[1]
        utils.clearParent(obj)

        data.append(iname)

    # Append data to a json file
    utils.writeJSON(path.join(fp, 'Scenes.json'), data, True)

    bpy.context.window.scene = scn
    bpy.ops.scene.delete()
    utils.success(logMsg + ' done')
