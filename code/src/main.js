// the OpenGL context
var gl = null,
  program = null;

// camera
var camera = null;
var cameraPos = vec3.create();
var cameraCenter = vec3.create();
var cameraAnimation = null;
var cameraAnimation1 = null;
const backgroundColor = [0.02, 0.02, 0.02, 1.0];

// spaceProbe size parameters and transformation nodes
const spaceProbeSize = 1;
var spaceProbeTransformationNode;
var spaceProbeLeftPanel;
var spaceProbeRightPanel;

// animations
const startDelay = 2000;
const animationsOn = true; // disable non-constant animations like camera animation
const constantAnimations = true; // disable constant animations like rotations
var spaceProbeAnimation;
var starAnimation;
var planetAnimation;
var planetAnimationsArray = []; // array where all planets are stored, for the rotation animation
var solarPanelLeftAnimation;
var solarPanelRightAnimation;
var animationValue = 0;

// stars and planets
const planetPositions = [[-20, -5, 50], [50, 0, 100], [0, 0, -400], [-100, -20, -7], [0, 0, -400], [0, 0, -400], [-200, 70, 30]]; // first all fixed planets, then all constantly moving planets and lastly the animated planet
const planetRotation = [['Z', 15], ['X', -45], ['Z', -35], ['Z', 45], ['Y', 0], ['X', 0], ['Z', 180]]; // fixed rotation for the creation
const planetRotationSpeed = [0.2, 0.5, 0.1, 0.4, 0.5, 1, 0.5]; // rotation speed of each planet
const fixedPlanetsCount = 4;
const planetSizes = [8, 4, 110, 5, 15, 8, 3];
var movingPlanetTransformationNodeArray = [];
var movingPlanetTransformationNode;
var planetsTransformationNode;
const planetColorValue = [
  [[0.1, 0.1, 0.1, 1.0], [0.1, 0.1, 0.1, 1.0], [0.5, 0.5, 0.5, 1.0], 3],
  [[153 / 255, 102 / 255, 51 / 255, 1.0], [0.1, 0.1, 0.1, 1.0], [0.5, 0.5, 0.5, 1.0], 3],
  [[70 / 255, 100 / 255, 180 / 255, 1.0], [0.2, 0.2, 0.5, 1.0], [0.1, 0.1, 0.6, 1.0], 2],
  [[0.8, 0.8, 0.8, 1.0], [0.1, 0.1, 0.1, 1.0], [0.5, 0.5, 0.5, 1.0], 4],
  [[0.5, 0.5, 1.0, 1.0], [0.1, 0.1, 0.2, 1.0], [0.35, 0.2, 0.5, 1.0], 6],
  [[0.8, 0.5, 1.0, 1.0], [0.1, 0.1, 0.1, 1.0], [0.5, 0.5, 0.5, 1.0], 3],
  [[1, 0.5, 0.5, 1.0], [0.1, 0.1, 0.1, 1.0], [0.2, 0.1, 0.15, 1.0], 5],
];
var translateLight1;
var rotateLight1;
var translateLight2;
var rotateLight2;
var lightNode1;
var lightNode2;
var lightNode3;
var lightNode4;
var spotLightNode;

// textures
var planetTexturesArray = [];

// sceneGraph root node
var root = null;
var rootEmpty = null; // for shadow mapping

//framebuffer variables
var renderTargetFramebuffer;
var framebufferWidth = 1024;
var framebufferHeight = 1024;
var renderTargetColorTexture;
var renderTargetDepthTexture;
var lightViewProjectionMatrix;

// time in last render step
var previousTime = 0;

//load the shader resources using a utility function
loadResources({
  vs: './src/shader/phong.vs.glsl',
  fs: './src/shader/phong.fs.glsl',
  vs_single: './src/shader/single.vs.glsl',
  fs_single: './src/shader/single.fs.glsl',
  spaceProbeCoreModel: './src/models/spaceProbeCore.obj',
  connectorModel: './src/models/connector.obj',
  solarPanelModel: './src/models/solarPanel.obj',
  thrusterModel: './src/models/thruster.obj',
  antennaDishModel: './src/models/antennaDish.obj',
  antennaRodModel: './src/models/antennaRod.obj',
  antennaBoomModel: './src/models/antennaBoom.obj',
  longAntennaModel: './src/models/longAntenna.obj',
  solarPanelTexture: './src/textures/solar_panel.jpg',
  antennaDishTexture: './src/textures/antenna_dish.jpg',
  coreTexture: './src/textures/core.jpg',
  connectorTexture: './src/textures/connector.jpg',
  planetTexture1: './src/textures/planet_1.png',
  planetTexture2: './src/textures/planet_2.png',
  planetTexture3: './src/textures/planet_3.jpg',
  planetTexture4: './src/textures/planet_4.png',
  planetTexture5: './src/textures/planet_5.jpg',
  planetTexture6: './src/textures/planet_6.jpg',
  planetTexture7: './src/textures/planet_7.jpg',
}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  render(0);
});

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context

  // add all planet textures to a array for an simpler creation of the planets
  planetTexturesArray = [resources.planetTexture1, resources.planetTexture2, resources.planetTexture3, resources.planetTexture4, resources.planetTexture5, resources.planetTexture6, resources.planetTexture7];

  gl = createContext();

  // initialize all textures including depth textures
  initRenderToTexture();

  //setup camera
  cameraStartPos = vec3.fromValues(0, 0, 30);
  camera = new UserControlledCamera(gl.canvas, cameraStartPos);

  // change camera perspective to look back
  camera.control.lookingDir.x = -180;

  // offset of the camera for the camera pan
  const offset = 30;
  //setup an animation for the camera, moving it into position
  cameraAnimation = new Animation(camera,
    [{ matrix: mat4.rotateZ(mat4.create(), mat4.create(), glm.deg2rad(0)), duration: startDelay },
    { matrix: mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0, 0, -offset)), duration: 4000 },
    { matrix: mat4.rotateY(mat4.create(), mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(offset, 0, 0)), glm.deg2rad(-90)), duration: 6000 },
    { matrix: mat4.rotateY(mat4.create(), mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0, 0, offset)), glm.deg2rad(-180)), duration: 6000 },
    { matrix: mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0, 10, 290)), duration: 10000 }
    ],
    false);

  root = createSceneGraph(gl, resources);

  // create and empty root node for depth rendering
  rootEmpty = new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single));
  rootEmpty.append(spaceProbeTransformationNode);
  rootEmpty.append(planetsTransformationNode);

  // space probe animation
  spaceProbeAnimation = new Animation(spaceProbeTransformationNode,
    [{ matrix: mat4.rotateZ(mat4.create(), mat4.create(), glm.deg2rad(0)), duration: startDelay },
    { matrix: mat4.rotateZ(mat4.create(), mat4.create(), glm.deg2rad(0)), duration: 17000 },
    { matrix: mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0, 0, -300)), duration: 6000 },
    { matrix: mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(0, 0, 0)), duration: 4000 }],
    false);

  // planet moving animation - animation plays in a loop
  planetAnimation = new Animation(movingPlanetTransformationNode,
    [{ matrix: mat4.rotateZ(mat4.create(), mat4.create(), glm.deg2rad(0)), duration: startDelay },
    { matrix: mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(300, -120, -100)), duration: 30000 },
    { matrix: mat4.translate(mat4.create(), mat4.create(), vec3.fromValues(planetPositions[planetPositions.length - 1][0], planetPositions[planetPositions.length - 1][1], planetPositions[planetPositions.length - 1][2])), duration: 30000 }],
    true);

  // Attention: There is a start delay of x seconds for the animations, so the animations do not start immediately but are delayed. This was chosen because it makes creating the video easier

  // start all animations
  if (animationsOn) {
    cameraAnimation.start();
    spaceProbeAnimation.start();
    planetAnimation.start();
  }
}

/**
 * Creates the SceneGraph
 * 
 * @param gl 
 * @param resources 
 * @returns the created SceneGraph
 */
function createSceneGraph(gl, resources) {
  //create sceneGraph
  const root = new ShaderSGNode(createProgram(gl, resources.vs, resources.fs))

  //add node for setting shadow parameters
  shadowNode = new ShadowSGNode(renderTargetDepthTexture, 3, framebufferWidth, framebufferHeight);
  root.append(shadowNode);

  // create node with different shaders
  function createLightSphere(resources, diameter) {
    return new ShaderSGNode(createProgram(gl, resources.vs_single, resources.fs_single), [
      new RenderSGNode(makeSphere(diameter, 30, 30))
    ]);
  }

  // generate all stars and light sources

  // create star1
  lightNode1 = new LightSGNode();
  lightNode1.uniform = 'u_light1';
  lightNode1.ambient = [0.1, 0.1, 0.1, 1];
  lightNode1.diffuse = [0.1, 0.1, 0.1, 1];
  lightNode1.specular = [0.2, 0.2, 0.2, 1];
  lightNode1.position = [300, 40, -450];
  lightNode1.append(createLightSphere(resources, 20));
  // add star1 to sceneGraph
  shadowNode.append(lightNode1);

  // create star2
  lightNode2 = new LightSGNode();
  lightNode2.uniform = 'u_light2';
  lightNode2.ambient = [0.1, 0.1, 0.1, 1];
  lightNode2.diffuse = [0.1, 0.1, 0.1, 1];
  lightNode2.specular = [0.2, 0.2, 0.2, 1];
  lightNode2.position = [-200, 40, 40];
  lightNode2.append(createLightSphere(resources, 5));
  // add star2 to sceneGraph
  shadowNode.append(lightNode2);

  // create the moving star
  lightNode3 = new LightSGNode();
  lightNode3.uniform = 'u_light';
  lightNode3.ambient = [0.2, 0.2, 0.2, 1];
  lightNode3.diffuse = [0.2, 0.2, 0.2, 1];
  lightNode3.specular = [0.4, 0.4, 0.4, 1];
  lightNode3.position = [0, 0, 0];
  rotateLight1 = new TransformationSGNode(mat4.create());
  translateLight1 = new TransformationSGNode(glm.translate(-30, 10, 250));
  rotateLight1.append(translateLight1);
  translateLight1.append(lightNode3);
  translateLight1.append(createLightSphere(resources, 2));
  shadowNode.append(rotateLight1);

  // create the moving star with shadows
  lightNode4 = new LightSGNode();
  lightNode4.uniform = 'u_light3';
  lightNode4.ambient = [0.2, 0.2, 0.2, 1];
  lightNode4.diffuse = [0.2, 0.2, 0.2, 1];
  lightNode4.specular = [0.4, 0.4, 0.4, 1];
  lightNode4.position = [0, 0, 0];
  rotateLight2 = new TransformationSGNode(mat4.create());
  translateLight2 = new TransformationSGNode(glm.translate(20, 20, 150));
  rotateLight2.append(translateLight2);
  translateLight2.append(lightNode4);
  translateLight2.append(createLightSphere(resources, 0.5));
  shadowNode.append(rotateLight2);

  // create space probe and add it to the sceneGraph
  shadowNode.append(createSpaceProbe(resources));
  // create planets and add them to the sceneGraph
  shadowNode.append(createPlanets());

  // create spotlight which looks like a flashlight, as it is positioned in the camera center
  spotLightNode = new SpotLightSGNode();
  spotLightNode.uniform = 'u_spotLight';
  spotLightNode.ambient = [0.1, 0.1, 0.1, 1.0];
  spotLightNode.diffuse = [0.1, 0.1, 0.1, 1.0];
  spotLightNode.specular = [0.1, 0.1, 0.1, 1.0];
  spotLightNode.innerAngle = 0.99; // 57°
  spotLightNode.outerAngle = 0.98; // 56°
  spotLightNode.direction = [0, 0, -1];
  shadowNode.append(spotLightNode);

  return root;
}

/**
 * Initialize depth textures
 * 
 */
function initRenderToTexture() {

  // code copied from the lab code

  //generate color texture (required mainly for debugging and to avoid bugs in some WebGL platforms)
  renderTargetFramebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, renderTargetFramebuffer);

  //create color texture
  renderTargetColorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, renderTargetColorTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, framebufferWidth, framebufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  //create depth texture
  renderTargetDepthTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, renderTargetDepthTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, framebufferWidth, framebufferHeight, 0, gl.DEPTH_COMPONENT, gl.FLOAT, null);

  //bind textures to framebuffer
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTargetColorTexture, 0);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, renderTargetDepthTexture, 0);

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) != gl.FRAMEBUFFER_COMPLETE) { alert('Framebuffer incomplete!'); }

  //clean up
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

/**
 * Creates all planets
 * 
 * @returns {TransformationSGNode} of the planets
 */
function createPlanets() {
  planetsTransformationNode = new TransformationSGNode();

  // generate planets from arrays
  for (let i = 0; i < fixedPlanetsCount; i++) {
    let planet = createPlanet(planetSizes[i], planetColorValue[i][0], planetColorValue[i][1], planetColorValue[i][2], planetColorValue[i][3], planetTexturesArray[i]);
    planetAnimationsArray[i] = planet;
    // rotate planet if specified
    let ptm;
    if (planetRotation[i][0] == 'X') {
      ptm = glm.transform({ translate: planetPositions[i], rotateX: planetRotation[i][1] });
    }
    else if (planetRotation[i][0] == 'Y') {
      ptm = glm.transform({ translate: planetPositions[i], rotateY: planetRotation[i][1] });
    }
    else if (planetRotation[i][0] == 'Z') {
      ptm = glm.transform({ translate: planetPositions[i], rotateZ: planetRotation[i][1] });
    }
    else {
      ptm = glm.transform({ translate: planetPositions[i] });
    }
    planetsTransformationNode.append(new TransformationSGNode(ptm, planet));
  }

  // generate the moving planet
  movingPlanetTransformationNode = new TransformationSGNode();
  var planet4 = createPlanet(planetSizes[planetPositions.length - 1], planetColorValue[planetPositions.length - 1][0], planetColorValue[planetPositions.length - 1][1], planetColorValue[planetPositions.length - 1][2], planetColorValue[planetPositions.length - 1][3], planetTexturesArray[planetPositions.length - 1]);
  let p1tm = glm.transform({ translate: planetPositions[planetPositions.length - 1] });
  planetAnimationsArray[planetPositions.length - 1] = planet4;
  movingPlanetTransformationNode.append(planet4);
  planetsTransformationNode.append(new TransformationSGNode(p1tm, movingPlanetTransformationNode));

  // generate constant moving planets
  for (i = 0; i < planetPositions.length - fixedPlanetsCount - 1; i++) {
    var transformationNode = new TransformationSGNode();
    var planet5 = createPlanet(planetSizes[i + fixedPlanetsCount], planetColorValue[i + fixedPlanetsCount][0], planetColorValue[i + fixedPlanetsCount][1], planetColorValue[i + fixedPlanetsCount][2], planetColorValue[i + fixedPlanetsCount][3], planetTexturesArray[i + fixedPlanetsCount]);
    planetAnimationsArray[i + fixedPlanetsCount] = planet5;
    var ptm = glm.transform({ translate: planetPositions[i + fixedPlanetsCount], scale: 1 });
    transformationNode.append(planet5);
    planetsTransformationNode.append(new TransformationSGNode(ptm, transformationNode));
    movingPlanetTransformationNodeArray[i] = transformationNode;
  }

  return planetsTransformationNode;
}

/**
 * Creates a single new planet
 * 
 * @param radius    radius of the planet
 * @param ambient   ambient values for the planet
 * @param diffuse   diffuse values for the planet
 * @param specular  specular values for the planet
 * @param shininess shininess value for the planet
 * @param texture   texture to apply to the created planet
 * @returns {TransformationSGNode} of the planet
 */
function createPlanet(radius, ambient, diffuse, specular, shininess, texture) {
  var planetTransformationNode = new TransformationSGNode();

  // created new sphere
  let planet = new MaterialSGNode(
    new TextureSGNode(texture, new RenderSGNode(makeSphere(radius, 50, 50))));
  // set material properties
  planet.ambient = ambient;
  planet.diffuse = diffuse;
  planet.specular = specular;
  planet.shininess = shininess;
  // append new planet to the planetTransformationNode
  planetTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateY: 90, scale: 1 }), planet));

  return planetTransformationNode;
}

/**
 * Creates the whole space probe
 * 
 * @param resources 
 * @returns {TransformationSGNode} of the space probe
 */
function createSpaceProbe(resources) {
  spaceProbeTransformationNode = new TransformationSGNode();

  // material properties of the space probe

  // spaceProbe values
  const ambientSpaceProbe = [0.02, 0.02, 0.02, 1.0];
  const diffuseSpaceProbe = [0.01, 0.01, 0.01, 1.0];
  const specularSpaceProbe = [0.5, 0.5, 0.5, 1.0];
  const shininessSpaceProbe = 0.75;

  // solarPanel values
  const ambientSolar = [0 / 255, 0 / 255, 31 / 255, 1];
  const diffuseSolar = [0.2, 0.2, 0.2, 1.0];
  const specularSolar = [0.4, 0.4, 0.5, 1.0];
  const shininessSolar = 0.1;

  // thruster values
  const ambientThruster = [0.3, 0.3, 0.3, 1.0];
  const diffuseThruster = [0.7, 0.7, 1, 1.0];
  const specularThruster = [0.5, 0.5, 0.5, 1.0];
  const shininessThruster = 3;

  // antenna
  const ambientAntenna = [128 / 255, 128 / 255, 128 / 255, 1];
  const diffuseAntenna = [0.1, 0.1, 0.1, 1.0];
  const specularAntenna = [0.5, 0.5, 0.5, 1.0];
  const shininessAntenna = 2;

  // antenna rod
  const ambientAntennaRod = [0, 0, 0, 1];
  const diffuseAntennaRod = [0.1, 0.1, 0.1, 1.0];
  const specularAntennaRod = [0.5, 0.5, 0.5, 1.0];
  const shininessAntennaRod = 0.5;

  // texture coordinates are imported from blender via the .obj files

  // create spaceProbeCore
  var spaceProbeCore = new MaterialSGNode(
    new TextureSGNode(resources.coreTexture, new RenderSGNode(resources.spaceProbeCoreModel)));
  spaceProbeCore.ambient = ambientSpaceProbe;
  spaceProbeCore.diffuse = diffuseSpaceProbe;
  spaceProbeCore.specular = specularSpaceProbe;
  spaceProbeCore.shininess = shininessSpaceProbe;

  // add spaceProbeCore to spaceProbeTransformationNode
  spaceProbeTransformationNode.append(spaceProbeCore);

  // create connector
  var connector = new MaterialSGNode(
    new TextureSGNode(resources.connectorTexture, new RenderSGNode(resources.connectorModel)));
  connector.ambient = ambientSpaceProbe;
  connector.diffuse = diffuseSpaceProbe;
  connector.specular = specularSpaceProbe;
  connector.shininess = shininessSpaceProbe;

  // create panel
  var solarPanel = new MaterialSGNode(
    new TextureSGNode(resources.solarPanelTexture, new RenderSGNode(
      resources.solarPanelModel)));
  solarPanel.ambient = ambientSolar;
  solarPanel.diffuse = diffuseSolar;
  solarPanel.specular = specularSolar;
  solarPanel.shininess = shininessSolar;

  // solar panel
  // add solar to connector
  connector.append(new TransformationSGNode(glm.transform({ translate: [0, 0, 3 * spaceProbeSize] }), [solarPanel]));
  // add both solar panels to their transformation nodes
  spaceProbeLeftPanel = new TransformationSGNode(glm.transform({ translate: [spaceProbeSize, 0, 0] }), [new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateZ: -45, scale: 1 }), [connector])]);
  spaceProbeRightPanel = new TransformationSGNode(glm.transform({ translate: [-spaceProbeSize, 0, 0] }), [new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateZ: 45, scale: 1 }), [connector])]);
  // add both panel transformation nodes to the space probe
  spaceProbeCore.append(spaceProbeLeftPanel);
  spaceProbeCore.append(spaceProbeRightPanel);

  // truster
  // create truster
  var thruster = new MaterialSGNode([new RenderSGNode(resources.thrusterModel)]);
  thruster.ambient = ambientThruster;
  thruster.diffuse = diffuseThruster;
  thruster.specular = specularThruster;
  thruster.shininess = shininessThruster;

  // add the main thruster to the space probe
  spaceProbeTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [0, 0, spaceProbeSize + spaceProbeSize / 7.5], rotateY: 180 }), [thruster]));
  // add all secondary thrusters to the space probe
  spaceProbeTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [spaceProbeSize + (spaceProbeSize / 7.5) * 0.25, spaceProbeSize - spaceProbeSize / 3, spaceProbeSize - spaceProbeSize / 5], rotateY: 90, scale: 0.25 }), [new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateX: 180, scale: 1 }), [thruster])]));
  spaceProbeTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [spaceProbeSize + (spaceProbeSize / 7.5) * 0.25, -spaceProbeSize + spaceProbeSize / 3, spaceProbeSize - spaceProbeSize / 5], rotateY: 90, scale: 0.25 }), [new TransformationSGNode(glm.transform({ translate: [0, 0, 0], rotateX: 180, scale: 1 }), [thruster])]));
  spaceProbeTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [-spaceProbeSize - (spaceProbeSize / 7.5) * 0.25, -spaceProbeSize + spaceProbeSize / 3, spaceProbeSize - spaceProbeSize / 5], rotateY: 90, scale: 0.25 }), [thruster]));
  spaceProbeTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [-spaceProbeSize - (spaceProbeSize / 7.5) * 0.25, spaceProbeSize - spaceProbeSize / 3, spaceProbeSize - spaceProbeSize / 5], rotateY: 90, scale: 0.25 }), [thruster]));

  // front antenna
  // create antennaDish
  var antennaDish = new MaterialSGNode(
    new TextureSGNode(resources.antennaDishTexture, new RenderSGNode(resources.antennaDishModel)));
  antennaDish.ambient = ambientAntenna;
  antennaDish.diffuse = diffuseAntenna;
  antennaDish.specular = specularAntenna;
  antennaDish.shininess = shininessAntenna;

  // create antennaRod
  var antennaRod = new MaterialSGNode([new RenderSGNode(resources.antennaRodModel)]);
  antennaRod.ambient = ambientAntennaRod;
  antennaRod.diffuse = diffuseAntennaRod;
  antennaRod.specular = specularAntennaRod;
  antennaRod.shininess = shininessAntennaRod;

  // add the antenna rode to the antenna dish
  antennaDish.append(antennaRod);

  // add the antenna too the space probe
  spaceProbeTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [0, 0, -spaceProbeSize * 1.2], scale: 0.5 }), [antennaDish]));

  // bottom antenna
  // create antennaBottom
  var antennaBottomRod = new MaterialSGNode([new RenderSGNode(resources.longAntennaModel)]);
  antennaBottomRod.ambient = ambientAntennaRod;
  antennaBottomRod.diffuse = diffuseAntennaRod;
  antennaBottomRod.specular = specularAntennaRod;
  antennaBottomRod.shininess = shininessAntennaRod;

  var antennaBottom = new TransformationSGNode();
  antennaBottom.append(antennaBottomRod);

  // add crossbars to the bottom antenna
  var j = 0.75;
  for (i = -spaceProbeSize / 2; i < 2 * spaceProbeSize; i += 2.5 * spaceProbeSize / 10) {
    antennaBottom.append(new TransformationSGNode(glm.transform({ translate: [0, 0, i], rotateY: 90, scale: j }), [antennaBottomRod]));
    j -= 0.05;
  }

  // top antenna
  // add antennaBottom to spaceProbeTransformationNode
  spaceProbeTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [0, - 2 * spaceProbeSize, spaceProbeSize / 4], rotateX: 70 }), [antennaBottom]));

  // create antennaDish1
  var antennaDish1 = new MaterialSGNode(
    new TextureSGNode(resources.antennaDishTexture, new RenderSGNode(resources.antennaDishModel)));
  antennaDish1.ambient = ambientAntenna;
  antennaDish1.diffuse = diffuseAntenna;
  antennaDish1.specular = specularAntenna;
  antennaDish1.shininess = shininessAntenna;

  // create antennaDish2
  var antennaDish2 = new MaterialSGNode(
    new TextureSGNode(resources.antennaDishTexture, new RenderSGNode(resources.antennaDishModel)));
  antennaDish2.ambient = ambientAntenna;
  antennaDish2.diffuse = diffuseAntenna;
  antennaDish2.specular = specularAntenna;
  antennaDish2.shininess = shininessAntenna;

  // create antennaRod2
  var antennaRod2 = new MaterialSGNode([new RenderSGNode(resources.antennaRodModel)]);
  antennaRod2.ambient = ambientAntennaRod;
  antennaRod2.diffuse = diffuseAntennaRod;
  antennaRod2.specular = specularAntennaRod;
  antennaRod2.shininess = shininessAntennaRod;

  // create spaceProbeAntennaBoom
  var spaceProbeAntennaBoom = new MaterialSGNode([new RenderSGNode(resources.antennaBoomModel)]);
  spaceProbeAntennaBoom.ambient = ambientAntennaRod;
  spaceProbeAntennaBoom.diffuse = diffuseAntennaRod;
  spaceProbeAntennaBoom.specular = specularAntennaRod;
  spaceProbeAntennaBoom.shininess = shininessAntennaRod;

  var antennaSize = 0.067;
  var antennaLength = 0.5;

  // add antennaDish2 to spaceProbeAntennaBoom
  spaceProbeAntennaBoom.append(new TransformationSGNode(glm.transform({ translate: [0, antennaSize, - antennaLength * 2], rotateX: 90, scale: 0.5 }), [antennaDish1]));
  // add the antennaRod2 to the antennaDish1
  antennaDish1.append(new TransformationSGNode(glm.transform({ translate: [0, 0, -spaceProbeSize * 0.6], scale: 0.6 }), [antennaRod2]));
  // add the antennaDish2 to the movingAntennaRod
  antennaRod2.append(new TransformationSGNode(glm.transform({ translate: [0, 0, 0], scale: 0.8 }), [antennaDish2]));
  // add spaceProbeAntennaBoom to spaceProbeAntenna
  spaceProbeTransformationNode.append(new TransformationSGNode(glm.transform({ translate: [0, spaceProbeSize - antennaSize, 0], rotateX: 60 }), [spaceProbeAntennaBoom]));

  return spaceProbeTransformationNode;
}

/**
 * Render depth texture
 */
function renderToTexture() {

  // code copied from the lab code

  // bind framebuffer to draw scene into texture
  gl.bindFramebuffer(gl.FRAMEBUFFER, renderTargetFramebuffer);

  // setup viewport
  gl.viewport(0, 0, framebufferWidth, framebufferHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // setup context and camera matrices
  const context = createSGContext(gl);
  // setup a projection matrix for the light camera which is large enough to capture our scene
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), framebufferWidth / framebufferHeight, 30, 1500);
  // compute the light's position in world space

  let lightModelMatrix = mat4.multiply(mat4.create(), rotateLight2.matrix, translateLight2.matrix);
  let lightPositionVector = vec4.fromValues(lightNode4.position[0], lightNode4.position[1], lightNode4.position[2], 1);
  let worldLightPos = vec4.transformMat4(vec4.create(), lightPositionVector, lightModelMatrix);

  // let the light "shine" towards the scene center
  let worldLightLookAtPos = [0, 0, -400]; // [0, 0, -400] position of the big planet
  let upVector = [0, 1, 0];

  // setup camera to look at the scene from the light's perspective
  let lookAtMatrix = mat4.lookAt(mat4.create(), worldLightPos, worldLightLookAtPos, upVector);
  context.viewMatrix = lookAtMatrix;

  // multiply and save light projection and view matrix for later use in shadow mapping shader!
  shadowNode.lightViewProjectionMatrix = mat4.multiply(mat4.create(), context.projectionMatrix, context.viewMatrix);

  // render scene graph
  rootEmpty.render(context); // empty scene graph to avoid reading from the same texture as we write to...

  // disable framebuffer (render to screen again)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

/**
 * render one frame
 */
function render(timeInMilliseconds) {
  // check for resize of browser window and adjust canvas sizes
  checkForWindowResize(gl);

  var deltaTime = timeInMilliseconds - previousTime;
  previousTime = timeInMilliseconds;

  // update object animations before the death/shadow rendering
  planetAnimation.update(deltaTime);
  spaceProbeAnimation.update(deltaTime);
  animateObjects(timeInMilliseconds);

  // draw scene for shadow map into texture
  renderToTexture();

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  // set background-color
  gl.clearColor(backgroundColor[0], backgroundColor[1], backgroundColor[2], backgroundColor[3]);
  // clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // enable depth test to let objects in front occludes objects further away
  gl.enable(gl.DEPTH_TEST);

  // create projection Matrix and context for rendering.
  const context = createSGContext(gl);
  // render distance (last parameter) increased
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(30), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 1000);
  context.viewMatrix = mat4.lookAt(mat4.create(), [0, 1, -10], [0, 0, 0], [0, 1, 0]);

  // update animation BEFORE camera
  cameraAnimation.update(deltaTime);
  camera.update(deltaTime);

  //At the end of the automatic flight, switch to manual control
  if (!cameraAnimation.running && !camera.control.enabled) {
    camera.control.enabled = true;
  }

  // apply camera
  camera.render(context);

  // get inverse view matrix to allow computing eye-to-light matrix
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  // render scene
  root.render(context);

  // request another call as soon as possible
  requestAnimationFrame(render);
}

/**
 * Animates objects with constant animations
 * 
 * @param timeInMilliseconds current time in timeInMilliseconds for the animation calculation
 */
function animateObjects(timeInMilliseconds) {
  // rotation of spaceProbe - if statement is needed as the spaceprobe is animated by both a constant animation (rotation) and by the animation class
  let rtm;
  if (spaceProbeAnimation.running) rtm = mat4.multiply(mat4.create(), spaceProbeTransformationNode.matrix, glm.transform({ rotateZ: animationValue / 3 }));
  else rtm = mat4.multiply(mat4.create(), mat4.create(), glm.transform({ rotateZ: animationValue / 3 }));
  spaceProbeTransformationNode.setMatrix(rtm);

  // rotation of solar panels
  // left panel - rltm = rotation left transformation matrix
  var rltm = glm.transform({ translate: [spaceProbeSize, 0, 0], rotateY: 90 }); // translation and rotation related to the space probe 
  rltm = mat4.multiply(mat4.create(), rltm, glm.transform({ rotateZ: -45 })); // translation and rotation related to the space probe 
  rltm = mat4.multiply(mat4.create(), rltm, glm.transform({ rotateZ: animationValue / 3 })); // rotation of the solar panel itself
  spaceProbeLeftPanel.setMatrix(rltm);

  // right panel - rrtm = rotation right transformation matrix
  var rrtm = glm.transform({ translate: [-spaceProbeSize, 0, 0], rotateY: -90 }); // translation and rotation related to the space probe 
  rrtm = mat4.multiply(mat4.create(), rrtm, glm.transform({ rotateZ: 45 })); // translation and rotation related to the space probe 
  rrtm = mat4.multiply(mat4.create(), rrtm, glm.transform({ rotateZ: animationValue / 3 })); // rotation of the solar panel itself
  spaceProbeRightPanel.setMatrix(rrtm);

  // rotation of star (lightNode3)
  var stm = glm.transform({ translate: [0, 0, 0], rotateY: animationValue / 6, scale: 2 });
  stm = mat4.multiply(mat4.create(), stm, glm.transform({ rotateZ: animationValue / 4, }));
  rotateLight1.setMatrix(stm);

  // rotation of star (lightNode4) which throws shadows
  var stm1 = glm.transform({ translate: [0, 0, 0], rotateZ: -animationValue / 6, scale: 2 });
  rotateLight2.setMatrix(stm1);

  // rotation of planets
  var ptm = glm.transform({ translate: [0, 0, 0], rotateY: animationValue / 12 - 60 });
  ptm = mat4.multiply(mat4.create(), ptm, glm.transform({ translate: [0, 0, 0], rotateZ: animationValue / 8 - 100 }));
  ptm = mat4.multiply(mat4.create(), ptm, glm.transform({ translate: [-30, 10, 200] }));
  movingPlanetTransformationNodeArray[0].setMatrix(ptm);

  ptm = glm.transform({ translate: [0, 0, 0], rotateY: -animationValue / 2 });
  ptm = mat4.multiply(mat4.create(), ptm, glm.transform({ translate: [0, 0, 0], rotateZ: -animationValue / 3 }));
  ptm = mat4.multiply(mat4.create(), ptm, glm.transform({ translate: [-60, 30, 150] }));
  movingPlanetTransformationNodeArray[1].setMatrix(ptm);

  // rotate all planets around their own axis
  for (let i = 0; i < planetAnimationsArray.length; i++) {
    var ptm;
    ptm = glm.transform({ translate: [0, 0, 0], rotateY: animationValue * planetRotationSpeed[i] });
    planetAnimationsArray[i].setMatrix(ptm);
  }

  // calculate next animationValue, if animations are disabled animationValue will stay 0
  if (constantAnimations) animationValue = timeInMilliseconds / 20;
}