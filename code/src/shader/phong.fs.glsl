/**
 * a phong shader implementation
 * Created by Samuel Gratzl on 29.02.2016.
 */
precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material{
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light{
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;

	// extened by direction and angle, in order to access them in the shader calculation
	vec3 direction;
	float innerAngle;
	float outerAngle;
};

uniform Material u_material;
uniform Light u_light;
uniform Light u_light1;
uniform Light u_light2;
uniform Light u_light3;
uniform Light u_spotLight;

// varying vectors for light computation
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_light1Vec;
varying vec3 v_light2Vec;
varying vec3 v_light3Vec;
varying vec3 v_spotlightVec;
uniform bool u_enableObjectTexture; 
varying vec2 v_texCoord;
uniform sampler2D u_tex;

//shadow map resolution
uniform float u_shadowMapWidth;
uniform float u_shadowMapHeight;

//shadow related variables
varying vec4 v_shadowMapTexCoord;
uniform sampler2D u_depthMap;

vec4 calculateSimplePointLight(Light light,Material material,vec3 lightVec,vec3 normalVec,vec3 eyeVec,float factor, vec4 textureColor, int shadowEnabled, vec4 shadowMapTexCoord, sampler2D depthMap){
	// You can find all built-in functions (min, max, clamp, reflect, normalize, etc.) 
	// and variables (gl_FragCoord, gl_Position) in the OpenGL Shading Language Specification: 
	// https://www.khronos.org/registry/OpenGL/specs/gl/GLSLangSpec.4.60.html#built-in-functions

	lightVec=normalize(lightVec);
	normalVec=normalize(normalVec);
	eyeVec=normalize(eyeVec);

  	// implement phong shader
	// compute diffuse term
	float diffuse=max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec=reflect(-lightVec,normalVec);
	float spec=pow(max(dot(reflectVec,eyeVec),0.0),material.shininess);

	if(u_enableObjectTexture) {
		material.ambient = textureColor;
		material.diffuse = textureColor;
  	}

	vec4 c_amb=clamp(light.ambient*material.ambient,0.0,1.0);
	vec4 c_diff=clamp(diffuse*light.diffuse*material.diffuse,0.0,1.0);
	vec4 c_spec=clamp(spec*light.specular*material.specular,0.0,1.0);
	vec4 c_em=material.emission;
	
	// code copied from the lab code

	// apply perspective division to v_shadowMapTexCoord and save to shadowMapTexCoord3D
 	vec3 shadowMapTexCoord3D = shadowMapTexCoord.xyz/shadowMapTexCoord.w;

	// do texture space transformation (-1 to 1 -> 0 to 1)
	shadowMapTexCoord3D = vec3(0.5,0.5,0.5) + shadowMapTexCoord3D*0.5;
	// substract small amount from z to get rid of self shadowing
	shadowMapTexCoord3D.z -= 0.003;

	// set to 1 if no shadow!
	float shadowCoeff = 1.0;

	// smootheing the shadow by sampling and averaging shadow coefficient over a 9x9 neighborhood in depth texture 
	float sumShadowCoeff = 0.0;
	for(float dx = -4.0; dx <= 4.0; dx++) {
		for(float dy = -4.0; dy <= 4.0; dy++) {
			float subShadowCoeff = 1.0;
			float zShadowMap = texture2D(depthMap, shadowMapTexCoord3D.xy + vec2(dx/u_shadowMapWidth, dy/u_shadowMapHeight)).r;
			if (shadowMapTexCoord3D.z > zShadowMap) { // if the depth value of the current fragment is further away than the value of the fragment in the depth frame buffer, then the coefficient is set to 0 -> shadow
				subShadowCoeff = 0.0;
			}
			sumShadowCoeff += subShadowCoeff;
		}
	}
	shadowCoeff = sumShadowCoeff / 81.0;

	// render shadows only if light should support shadow mapping
	if(shadowEnabled == 1) {
		return factor * c_amb + shadowCoeff * factor * (c_diff + c_spec) + c_em;
	}
	return factor * c_amb + factor * c_diff + factor * c_spec + c_em;
}

vec4 calculateSpotLight(Light light,Material material,vec3 lightVec,vec3 normalVec,vec3 eyeVec, vec4 textureColor, vec4 shadowMapTexCoord, sampler2D depthMap){

	// source: https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-spot.html

	vec3 direction=normalize(light.direction);
	vec3 surfaceToLightDirection=normalize(lightVec);
	// calculate dot product (angle) between direction and surfaceToLightDirection
	float theta=dot(surfaceToLightDirection,-direction);

	// only calculate the light if the current angle between the direction and surfaceToLightDirection is smaller than the cutoffangle
	// if outside of outer angle -> 0.0
	// if inside of inner angle -> 1.0
	// between inner and other angel -> 0.0...1.0
	float limit=light.innerAngle-light.outerAngle;
	float factor=clamp((theta-light.outerAngle) / limit, 0.0, 1.0);

	return calculateSimplePointLight(light, material, lightVec, normalVec, eyeVec, factor, textureColor, 0, shadowMapTexCoord, depthMap);
}

void main(){
	vec4 textureColor = vec4(0, 0, 0, 1);
	if(u_enableObjectTexture) {
		textureColor = texture2D(u_tex, v_texCoord);
	}

	// calculate the shading for each light + the failed spotlight
	gl_FragColor=calculateSimplePointLight(u_light,u_material, v_lightVec, v_normalVec, v_eyeVec, 1.0, textureColor, 0, v_shadowMapTexCoord, u_depthMap)
	+ calculateSimplePointLight(u_light1, u_material,v_light1Vec, v_normalVec,v_eyeVec, 1.0, textureColor, 0, v_shadowMapTexCoord, u_depthMap)
	+ calculateSimplePointLight(u_light2, u_material,v_light2Vec, v_normalVec,v_eyeVec, 1.0, textureColor, 0, v_shadowMapTexCoord, u_depthMap)
	+ calculateSimplePointLight(u_light3, u_material,v_light3Vec, v_normalVec,v_eyeVec, 1.0, textureColor, 1, v_shadowMapTexCoord, u_depthMap)
	+ calculateSpotLight(u_spotLight, u_material,v_spotlightVec, v_normalVec,v_eyeVec, textureColor, v_shadowMapTexCoord, u_depthMap);
}