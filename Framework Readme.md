# Framework Readme

***loadResources function***

This function is designed to load various types of resources (images, models, etc.) asynchronously. It takes an object resources containing key-value pairs where the keys represent resource identifiers and the values represent URLs of the corresponding resources and returns a Promise that resolves when all the resources are loaded.

***displayText and clearText functions***

These functions manipulate the text content of an HTML element with the id paragraph. displayText sets the text to be displayed, while clearText clears the text from the element.

***createContext function***

This function creates a WebGLRenderingContext along with a canvas element for rendering. It accepts width and height parameters (defaulting to 400x400 if not provided), creates a canvas element with the specified dimensions, appends it to the document body, and returns a WebGLRenderingContext for the canvas.

***createHtmlText function***

This function creates an HTML paragraph element (<p>) for displaying text on the screen. It is designed to be placed on top of a canvas element. The paragraph is given the id paragraph, and its width is set to match the width of the provided canvas element.

***createShader function***

This function creates a WebGL shader object from the provided shader code. It accepts the WebGLRenderingContext (gl), shader code (code), and shader type (type), and returns the created shader object.

***createProgram function***

This function creates a WebGL program by attaching vertex and fragment shaders to it. It accepts the WebGLRenderingContext (gl), vertex shader code or object (vertex), and fragment shader code or object (fragment). It returns the created WebGLProgram object.

***checkForWindowResize function***

This function checks and updates the size of the canvas element to match its current size on the webpage. It ensures that the canvas dimensions match the dimensions of its container to prevent distortion of rendered graphics.

***isValidAttributeLocation and isValidUniformLocation functions***

These functions check whether the provided attribute or uniform location is valid, respectively. They ensure that the location is a non-negative number (for attributes) or an instance of WebGLUniformLocation (for uniforms).

***hex2rgba function***

This function converts a hexadecimal color representation (e.g., "#FF00FF") to an RGBA tuple. It first parses the hexadecimal color string to an integer, then extracts the red, green, and blue components, scaling them to the range [0, 1]. It returns an object with properties r, g, b, and a representing the red, green, blue, and alpha components of the color, respectively.

***glm (GL Matrix) object***

This object provides utility functions for working with matrices and transformations commonly used in WebGL applications. It includes functions for converting degrees to radians (deg2rad) and for creating translation, scaling, and rotation matrices along the X, Y, and Z axes.

***makeSphere function***

This function generates the model data for a sphere with the given radius and number of latitude and longitude bands. It calculates the vertices, normals, texture coordinates, and indices required to render a sphere using the specified parameters. The generated data is returned in an object with properties position, normal, texture, and index.

***parseObjFile function***

This function parses data from an OBJ file format, which is a common format used for storing 3D models. It reads the vertices, vertex normals, and texture coordinates from the OBJ file and constructs the corresponding vertex data arrays. Triangulation is performed to convert polygons into triangles. The parsed data is returned in an object with properties position, normal, texture, and index.

***parseMtlFile function***

This function parses the contents of an MTL (Material Template Library) file, which contains material definitions used in 3D models. It extracts information such as ambient color, diffuse color, specular color, emission color, shininess, and texture map file paths for each material defined in the file. The parsed data is returned as an object with material names as keys, each containing an object with the material properties.

***makeRect function***

This function generates the model data for a rectangle with the given width and height.
It defines the vertices, normals, texture coordinates, and indices required to render a rectangle. The generated data is returned in an object with properties position, normal, texture, and index.

***SGNode class***

This class represents a node in the scene graph. It provides methods for appending, removing, and rendering child nodes. Child nodes can be added to the scene graph hierarchy using the append method.

***TransformationSGNode class***

This class extends SGNode and represents a transformation node in the scene graph. It applies a transformation matrix to its child nodes during rendering, allowing for transformations such as translation, rotation, and scaling.The transformation matrix is set using the setMatrix method.

***ShaderSGNode class***

This class extends SGNode and represents a shader node in the scene graph. It sets a specific shader program to be used for rendering its child nodes. During rendering, it activates the shader program and renders its children using that program.

***SetUniformSGNode class***

This class extends SGNode and represents a utility node for setting uniform variables in a shader program. It allows setting uniform variables like floats, booleans, or arrays to be used during rendering. The uniforms are set using the setUniforms method, which is called during rendering.

***AdvancedTextureSGNode class***

This class extends SGNode and represents a node for handling advanced textures.
It initializes a texture using the provided image data and sets parameters such as filtering and wrapping modes. During rendering, it binds the texture, sets shader parameters, and renders its child nodes. The texture unit, uniform name, and texture ID are configurable properties.

***RenderSGNode class***

This class extends SGNode and represents a node for rendering specific models. It takes a renderer function or a model and generates a renderer function for rendering the model. During rendering, it sets transformation uniforms (model-view, normal, and projection matrices) and calls the renderer function to render the model. Child nodes are rendered before and after the model rendering.

***modelRenderer function***

This is a factory function for creating a renderer function for a given model. It initializes WebGL buffers for the model's position, texture coordinates, normals, and indices. The returned renderer function sets attribute pointers and renders the model using either vertex arrays or element arrays.

***MaterialSGNode class***

This class extends SGNode and represents a node for handling materials. It sets material properties such as ambient, diffuse, specular, emission colors, and shininess as shader uniforms. During rendering, it sets material uniforms and then renders its child nodes.

***LightSGNode class***

This class extends TransformationSGNode and represents a node for handling lights. It sets light properties such as ambient, diffuse, specular colors, and position as shader uniforms. During rendering, it computes the light position in world space, sets light uniforms, and updates its transformation matrix. Child nodes are rendered after updating the light position and transformation.

***UserControlledCamera class***

This class represents a camera that can be controlled by the user via keyboard and mouse interactions. It initializes with movement speed, mouse sensitivity, initial position, and control settings. The initInteraction method sets up event listeners for mouse and keyboard interactions. The update method updates the camera position based on user input or animation. The render method updates the view matrix in the rendering context.

***Animation class***

This class represents an animation applied to a transformation node. It takes an array of animation segments, each defining a transformation matrix or a function returning a matrix and its duration. The start method initiates the animation, and the update method progresses the animation over time.

***createSGContext function***

This function creates a rendering context object with WebGL-related properties. It takes the WebGL context and an optional projection matrix as parameters and returns the context object.

***sg object***

This object contains factory utility functions for creating scene graph nodes. It includes functions for creating nodes such as the root node, transformation node, drawing nodes (with custom renderers), and shader nodes. Utility functions like translation, scaling, and rotation are also provided for convenience.
