/**
 * a phong shader implementation
 * Created by Samuel Gratzl on 29.02.2016.
 */
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;

uniform vec3 u_lightPos;
uniform vec3 u_light1Pos;
uniform vec3 u_light2Pos;
uniform vec3 u_light3Pos;
uniform vec3 u_spotLightPos;

uniform mat4 u_eyeToLightMatrix;
varying vec4 v_shadowMapTexCoord;

// output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_light1Vec;
varying vec3 v_light2Vec;
varying vec3 v_light3Vec;
varying vec3 v_spotlightVec;
varying vec2 v_texCoord;

void main(){
	vec4 eyePosition=u_modelView*vec4(a_position,1);

	v_normalVec=u_normalMatrix*a_normal;

	v_eyeVec=-eyePosition.xyz;

	// light position as uniform
	v_lightVec=u_lightPos-eyePosition.xyz;
	v_light1Vec=u_light1Pos-eyePosition.xyz;
	v_light2Vec=u_light2Pos-eyePosition.xyz;
	v_light3Vec=u_light3Pos-eyePosition.xyz;
	v_spotlightVec=u_spotLightPos-eyePosition.xyz;

	// calculate vertex position in light clip space coordinates using u_eyeToLightMatrix (assign result to v_shadowMapTexCoord)
	v_shadowMapTexCoord = u_eyeToLightMatrix * eyePosition;

	// pass texture corrdinates to the fs shader
	v_texCoord = a_texCoord;

	gl_Position=u_projection*eyePosition;
}
