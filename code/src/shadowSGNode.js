/*
*  Extension of the SGNode for the shadows - code copied from the lab code
*/
class ShadowSGNode extends SGNode {
    constructor(shadowtexture, textureunit, width, height, children) {
      super(children);
      this.shadowtexture = shadowtexture;
      this.textureunit = textureunit;
      this.texturewidth = width;
      this.textureheight = height;
  
      this.lightViewProjectionMatrix = mat4.create(); // has to be updated each frame
    }
  
    render(context) {
      // set additional shader parameters
      gl.uniform1i(gl.getUniformLocation(context.shader, 'u_depthMap'), this.textureunit);
  
      // pass shadow map size to shader (required for extra task)
      gl.uniform1f(gl.getUniformLocation(context.shader, 'u_shadowMapWidth'), this.texturewidth);
      gl.uniform1f(gl.getUniformLocation(context.shader, 'u_shadowMapHeight'), this.textureheight);
  
      // compute eye-to-light matrix by multiplying this.lightViewProjectionMatrix and context.invViewMatrix
      var eyeToLightMatrix = mat4.multiply(mat4.create(), this.lightViewProjectionMatrix, context.invViewMatrix);
      gl.uniformMatrix4fv(gl.getUniformLocation(context.shader, 'u_eyeToLightMatrix'), false, eyeToLightMatrix);
  
      // activate and bind texture
      gl.activeTexture(gl.TEXTURE0 + this.textureunit);
      gl.bindTexture(gl.TEXTURE_2D, this.shadowtexture);
  
      // render children
      super.render(context);
  
      // clean up
      gl.activeTexture(gl.TEXTURE0 + this.textureunit);
      gl.bindTexture(gl.TEXTURE_2D, null);
    }
  }