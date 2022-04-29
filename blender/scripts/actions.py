import bpy
import env
import utils
import importlib
import store
from datetime import datetime
from os import path
import math
import traceback
import gc
import time

import actionAsset as asset
import actionScene as scene
import actionSceneExtras as sceneExtras

import actionCommon as common

importlib.reload(asset)
importlib.reload(scene)
importlib.reload(sceneExtras)

importlib.reload(common)


# Export selected collection
def exportCollection(fp=None, textureOnly=False):
    utils.log('Export Selected Collection')
    scn = bpy.context.scene
    cols = []

    selected = bpy.context.view_layer.active_layer_collection.collection
    col = bpy.data.collections.get(selected.name)

    # Try to append collection from instance collection
    selected = bpy.context.selected_objects
    for obj in selected:
        objcol = obj.instance_collection
        if objcol is not None:
            cols.append(objcol)

    # If there is no collection added, use main active collection
    if len(cols) < 1:
        cols.append(col)
        for child in col.children:
            cols.append(child)

    if len(cols) < 1:
        return
    if fp == None:
        fp = env.paths.temp
    if not scn:
        return
    if textureOnly == False:
        store.setPersistent('mmLastAction', 'Export selected')
    exportCollections(fp, cols, textureOnly)
    bpy.context.window.scene = scn


# Export collections in the current scene
def exportScene(fp=None, textureOnly=False):
    utils.log('Export Current Scene')
    scn = bpy.context.scene
    if fp == None:
        fp = env.paths.temp
    if not scn:
        return
    if textureOnly == False:
        store.setPersistent('mmLastAction', 'Export scene')
    exportCollections(fp, scn.collection.children, textureOnly)


# Export all collections in the file
def exportAll(fp=None):
    scn = bpy.context.scene
    utils.log('Export all')
    if fp == None:
        fp = env.paths.temp
    store.setPersistent('mmLastAction', 'Export all')
    exportCollections(fp, bpy.data.collections)
    bpy.context.window.scene = scn


def exportCollectionTextures(fp=None):
    store.setPersistent('mmLastAction', 'Export selected textures')
    exportCollection(fp, True)


def exportSceneTextures(fp=None):
    store.setPersistent('mmLastAction', 'Export scene textures')
    exportScene(fp, True)


def exportCol(fp, col, textureOnly=False):
    # Parse name & info to deduce collection type
    seg = col.name.split(' - ')
    count = len(seg)
    kind = seg[0].lower().strip()

    # Cache to only export same collection once
    cacheName = utils.removeIncrement(col.name)
    cache = store.getValue('collectionCache')
    if cacheName in cache:
        utils.info('Skip ' + col.name + ' (already exported)')
        return
    else:
        cache.append(cacheName)

    # Handle different collection types
    if kind == 'asset' and count == 2:
        asset.export(fp, col, textureOnly)
    elif kind == 'scene' and count == 2:
        scene.export(fp, col, textureOnly)
    elif kind == 'sceneextras' and count == 2:
        sceneExtras.export(fp, col, textureOnly)
    time.sleep(0.1)
    gc.collect()
    time.sleep(0.1)


def exportCollections(fp, cols, textureOnly=False):
    try:
        bpy.context.window.cursor_set("WAIT")
        bpy.ops.ed.undo_push(message="Collections Export")
        store.setValue('collectionCache', [])
        store.setValue('texturesCache', [])
        for col in cols:
            exportCol(fp, col, textureOnly)
        now = datetime.now()
        timestamp = math.floor(datetime.timestamp(now))
        utils.writeJSON(path.join(fp, 'timestamp.json'), timestamp, False)
    except Exception as e:
        utils.error(str(e))
        traceback.print_exc()
    finally:
        if not store.getValue('debug', False):
            utils.deselectAll()
            bpy.ops.ed.undo()
        bpy.context.window.cursor_set("DEFAULT")


def execLastAction():
    lastAction = store.getPersistent('mmLastAction', None)
    if lastAction == None or lastAction not in actionTypes:
        return
    action = actionTypes[lastAction]
    action(env.paths.output)


actionTypes = {
    'Export selected': exportCollection,
    'Export selected textures': exportCollectionTextures,
    'Export scene': exportScene,
    'Export scene textures': exportSceneTextures,
    'Export all': exportAll,
}
