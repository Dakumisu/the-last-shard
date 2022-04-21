import importlib
import sys
import bpy
from os import path

# Register /scripts folder as a resolvable folder for imports
cdir = path.dirname(bpy.data.filepath)
sdir = path.join(cdir, 'scripts')
if not path.exists(sdir): sdir = path.normpath(path.join(cdir, '../scripts'))
if not path.exists(sdir): sdir = path.normpath(path.join(cdir, '../../scripts'))
if not path.exists(sdir): sdir = path.normpath(path.join(cdir, '../../../scripts'))
if not path.exists(sdir): sdir = path.normpath(path.join(cdir, '../../../../scripts'))
if not sdir in sys.path: sys.path.append(sdir)

# Imports main - Force a reload when the source is edited
import main
import importlib
importlib.reload(main)
