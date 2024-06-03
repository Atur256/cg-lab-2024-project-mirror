/*
*  Extension of the AdvancedTextureSGNode for the textures - code copied from the lab code
*/
class TextureSGNode extends AdvancedTextureSGNode {

    render(context) {
        // tell shader to use our texture
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 1);

        super.render(context);

        // disable texturing in shader
        gl.uniform1i(gl.getUniformLocation(context.shader, 'u_enableObjectTexture'), 0);
    }
}