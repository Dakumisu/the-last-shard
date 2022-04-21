# Imports scripts
import store
import utils
import env
import actions
import ui
import basis

# Force a reload when the source is edited
import importlib
importlib.reload(store)
importlib.reload(utils)
importlib.reload(env)
importlib.reload(actions)
importlib.reload(ui)
importlib.reload(basis)

store.setValue('debug', True)

# Initialize UI
ui.init()

# actions.exportAll()

# actions.exportScene()
