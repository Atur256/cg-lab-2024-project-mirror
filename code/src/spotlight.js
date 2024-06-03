
/*
* Extension of the LightSGNode for the spotLight
*/
class SpotLightSGNode extends LightSGNode {
  constructor(position, direction, children) {
    super(position, children);
    this._worldDirection = direction || vec3.fromValues(0, 0, -1);
    this.innerAngle = Math.PI / 6; // 30 degrees
    this.outerAngle = Math.PI / 3; // 60 degrees
    this.uniform = 'u_spotLight';

    this._worldPosition = null;
  }

  setLightUniforms(context) {
    super.setLightUniforms(context);
    const gl = context.gl;

    // add direction and angle to setLightUniforms
    gl.uniform3fv(gl.getUniformLocation(context.shader, this.uniform + '.direction'), this.direction);
    gl.uniform1f(gl.getUniformLocation(context.shader, this.uniform + '.innerAngle'), this.innerAngle);
    gl.uniform1f(gl.getUniformLocation(context.shader, this.uniform + '.outerAngle'), this.outerAngle);
  }

  computeLightPosition(context) {
    super.computeLightPosition(context);
    // update position to camera position, so that the spotlight looks like a flashlight
    this._worldPosition = [0, 0, 0];
  }
}
