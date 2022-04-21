import os
import actionCommon
import utils


def compress(fp):
    stream = os.popen('basisu -ktx2 %s' % (fp))
    output = stream.read()

    print(output)
    # exportTexture(output)


# def exportTexture(fp):
#     actionCommon.exportFile(
#         utils.resolvePath('Assets_Gradients.png', 'materials'),
#         fp,
#         'Assets_Gradients.png'
#     )
