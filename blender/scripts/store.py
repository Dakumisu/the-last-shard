import bpy

pkey = 'mm_persistentStore'
store = {}
persistent = {}

if not hasattr(bpy.types.TOPBAR_MT_editor_menus, pkey):
   setattr(bpy.types.TOPBAR_MT_editor_menus, pkey, persistent)
else:
   persistent = getattr(bpy.types.TOPBAR_MT_editor_menus, pkey)

def getValue(key, default = None):
    if key not in store: setValue(key, default)
    return store[key]

def setValue(key, value):
    store[key] = value

def getPersistent(key, default = None):
    if key not in persistent: setPersistent(key, default)
    return persistent[key]

def setPersistent(key, value):
    persistent[key] = value
