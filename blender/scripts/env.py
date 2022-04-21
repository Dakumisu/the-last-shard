import bpy
import json
import utils
from os import path


# Resolve a path from a project path
def resolvePath(fp='.', dirname='root'):
    if not dirname in paths:
        dirname = 'root'
    return path.normpath(path.join(paths[dirname], fp))


# Get all project paths
root = path.normpath(path.join(path.dirname(__file__), '..'))
project = path.normpath(path.join(root, 'project'))
paths = utils.dotobject({
    'root': root,
    'project': project,
    'assets': path.join(project, 'assets'),
    'scenes': path.join(project, 'scenes'),
    # 'materials': path.join(project, 'Materials'),
    'scripts': path.join(root, 'scripts'),
    'temp': path.join(root, '.temp'),
    'output': path.join(root, 'exports'),
    'resolve': resolvePath,
    'relFilepath': path.relpath(bpy.data.filepath, root),
    'currentFolder': path.dirname(bpy.data.filepath)
})

# Set and cache output folder
if hasattr(bpy.types.TOPBAR_MT_editor_menus, 'mm_OutputPath'):
    paths.output = bpy.types.TOPBAR_MT_editor_menus.mm_OutputPath
    utils.info('Use registered output path' + paths.output)


def registerOutputPath(fp):
    utils.info('Register output path' + fp)
    bpy.types.TOPBAR_MT_editor_menus.mm_OutputPath = fp
    paths.output = fp


# Parse settings from settings.json
settingsPath = path.join(paths.project, 'settings.json')
settings = utils.dotobject(utils.readJSON(settingsPath, {}))

# Clear temp folder
utils.cleanFolder(paths.temp)
