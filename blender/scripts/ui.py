import bpy
import utils
import actions
import env
import store
from bpy_extras.io_utils import ExportHelper


class TLS_OT_exec_last_action(bpy.types.Operator):
    """Re-execute last action"""
    bl_idname = 'tls.exec_last_action'
    bl_label = 'Choose folder'
    directory: bpy.props.StringProperty(subtype='DIR_PATH', default='NONE')

    def execute(self, context):
        try:
            actions.execLastAction()
            return {'FINISHED'}
        except BaseException as err:
            msg = ''
            errType = type(err)
            if hasattr(errType, '__name__'):
                msg += errType.__name__ + ' - '
            if hasattr(err, '__str__'):
                msg += err.__str__()
            self.report({'ERROR'}, msg)
            return {'CANCELLED'}


class TLS_OT_export_collection_texture(bpy.types.Operator):
    """Export on your disk textures from the selected collection"""
    bl_idname = 'tls.export_collection_texture'
    bl_label = 'Choose folder'
    directory: bpy.props.StringProperty(subtype='DIR_PATH', default='NONE')

    def invoke(self, context, _event):
        self.directory = env.paths.output
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def execute(self, context):
        try:
            env.registerOutputPath(self.directory)
            actions.exportCollectionTextures(self.directory)
            return {'FINISHED'}
        except BaseException as err:
            msg = ''
            errType = type(err)
            if hasattr(errType, '__name__'):
                msg += errType.__name__ + ' - '
            if hasattr(err, '__str__'):
                msg += err.__str__()
            self.report({'ERROR'}, msg)
            return {'CANCELLED'}


class TLS_OT_export_collection(bpy.types.Operator):
    """Export on your disk all resources from the selected collection"""
    bl_idname = 'tls.export_collection'
    bl_label = 'Choose folder'
    directory: bpy.props.StringProperty(subtype='DIR_PATH', default='NONE')

    def invoke(self, context, _event):
        self.directory = env.paths.output
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def execute(self, context):
        try:
            env.registerOutputPath(self.directory)
            actions.exportCollection(self.directory)
            return {'FINISHED'}
        except BaseException as err:
            msg = ''
            errType = type(err)
            if hasattr(errType, '__name__'):
                msg += errType.__name__ + ' - '
            if hasattr(err, '__str__'):
                msg += err.__str__()
            self.report({'ERROR'}, msg)
            return {'CANCELLED'}


class TLS_OT_export_scene_texture(bpy.types.Operator):
    """Export on your disk textures from the current scene"""
    bl_idname = 'tls.export_scene_texture'
    bl_label = 'Choose folder'
    directory: bpy.props.StringProperty(subtype='DIR_PATH', default='NONE')

    def invoke(self, context, _event):
        self.directory = env.paths.output
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def execute(self, context):
        try:
            env.registerOutputPath(self.directory)
            actions.exportSceneTextures(self.directory)
            return {'FINISHED'}
        except BaseException as err:
            msg = ''
            errType = type(err)
            if hasattr(errType, '__name__'):
                msg += errType.__name__ + ' - '
            if hasattr(err, '__str__'):
                msg += err.__str__()
            self.report({'ERROR'}, msg)
            return {'CANCELLED'}


class TLS_OT_export_scene(bpy.types.Operator):
    """Export on your disk resources from the current scene"""
    bl_idname = 'tls.export_scene'
    bl_label = 'Choose folder'
    directory: bpy.props.StringProperty(subtype='DIR_PATH', default='NONE')

    def invoke(self, context, _event):
        self.directory = env.paths.output
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def execute(self, context):
        try:
            env.registerOutputPath(self.directory)
            actions.exportScene(self.directory)
            return {'FINISHED'}
        except BaseException as err:
            msg = ''
            errType = type(err)
            if hasattr(errType, '__name__'):
                msg += errType.__name__ + ' - '
            if hasattr(err, '__str__'):
                msg += err.__str__()
            self.report({'ERROR'}, msg)
            return {'CANCELLED'}


class TLS_OT_export_all(bpy.types.Operator):
    """Export on your disk all resources from the current file"""
    bl_idname = 'tls.export_all'
    bl_label = 'Choose folder'
    directory: bpy.props.StringProperty(subtype='DIR_PATH', default='NONE')

    def invoke(self, context, _event):
        self.directory = env.paths.output
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def execute(self, context):
        try:
            env.registerOutputPath(self.directory)
            actions.exportAll(self.directory)
            return {'FINISHED'}
        except BaseException as err:
            msg = ''
            errType = type(err)
            if hasattr(errType, '__name__'):
                msg += errType.__name__ + ' - '
            if hasattr(err, '__str__'):
                msg += err.__str__()
            self.report({'ERROR'}, msg)
            return {'CANCELLED'}


class TLS_MT_menu(bpy.types.Menu):
    ''' Blender tooling suite'''
    bl_label = " TLS "

    def draw(self, context):
        scene = context.scene
        layout = self.layout
        layout.label(text="Project: " + env.settings.project)
        layout.separator()
        lastAction = store.getPersistent('tlsLastAction', None)
        if lastAction:
            layout.operator(
                "tls.exec_last_action",
                text="Last: " + lastAction,
                icon="LOOP_FORWARDS"
            )
            layout.separator()
        layout.operator(
            "tls.export_collection_texture",
            text="Export textures from selected",
            icon="IMAGE_RGB"
        )
        layout.operator(
            "tls.export_collection",
            text="Export selected collection",
            icon="UGLYPACKAGE"
        )
        layout.separator()
        layout.operator(
            "tls.export_scene_texture",
            text="Export textures from scene",
            icon="IMAGE_RGB"
        )
        layout.operator(
            "tls.export_scene",
            text="Export current scene",
            icon="UGLYPACKAGE"
        )
        layout.separator()
        layout.operator(
            "tls.export_all",
            text="Export all resources",
            icon="UGLYPACKAGE"
        )
        layout.separator()
        opPreview = layout.operator(
            'wm.url_open', text='Preview Website', icon='URL')
        opPreview.url = env.settings.previewUrl

    def menu_draw(self, context):
        layout = self.layout
        layout.menu("TLS_MT_menu", icon='SHADERFX')


classes = [
    TLS_OT_exec_last_action,
    TLS_OT_export_collection_texture,
    TLS_OT_export_collection,
    TLS_OT_export_scene_texture,
    TLS_OT_export_scene,
    TLS_OT_export_all,
    TLS_MT_menu
]


def initProperties():
    scene = bpy.types.Scene


def destroyProperties():
    scene = bpy.types.Scene
    if hasattr(scene, 'dirPath'):
        del scene.dirPath


def init():
    destroy()
    for cls in classes:
        bpy.utils.register_class(cls)
    bpy.types.TOPBAR_MT_editor_menus.append(TLS_MT_menu.menu_draw)
    bpy.types.TOPBAR_MT_editor_menus.TLSDestroy = destroy
    bpy.app.handlers.load_pre.append(destroy)
    initProperties()
    utils.log('UI Initialized')


def destroy(a=None, b=None):
    destroyed = False
    # Destroy UI Menu
    if hasattr(bpy.types, 'TLS_MT_menu'):
        destroyed = True
        menu = getattr(bpy.types, 'TLS_MT_menu')
        utils.info('Remove panel menu')
        bpy.types.TOPBAR_MT_editor_menus.remove(menu.menu_draw)
    # Remove load_pre callback
    if hasattr(bpy.types.TOPBAR_MT_editor_menus, 'TLSDestroy'):
        cb = bpy.types.TOPBAR_MT_editor_menus.TLSDestroy
        if (cb in bpy.app.handlers.load_pre):
            destroyed = True
            utils.info('Destroy load_pre listener')
            bpy.app.handlers.load_pre.remove(cb)
    # Unregister classes
    for cls in classes:
        if not hasattr(bpy.types, cls.__name__):
            continue
        destroyed = True
        bpy.utils.unregister_class(getattr(bpy.types, cls.__name__))
        utils.info('Unregister ' + cls.__name__)
    # Only log UI destroyed when there is really some stuff destroyed
    if destroyed:
        destroyProperties()
        utils.log('UI Destroyed')
