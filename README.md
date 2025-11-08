# Test WebGL Capabilities

This time I prompted for some software development documenation before allow it to generate any code. This is testing if the implementation is less buggy then other testing... once again free version, not sharing my own code.

Much better! --> https://j23414.github.io/basic_webgl/
Although will see if this gets worse as the scene is more complicated, or adds interactive features...
Well horizontal rotation slightly flipped, should check with a mouse...

Initial reading to debug iphone touch support: https://discussions.unity.com/t/weird-touch-input-behavior-in-webgl-mobile-browsers/1519705

**Local Testing**

```
cd docs
python3 -m http.server 8080
```

* http://localhost:8080/

**PDB structure viewer**

* Perhaps use a lighter background or use lighter color scale
* Look into shaders and materials
* Looks like we're rotating the camera instead of the object, notice how light source is fixed relative to the structure
* Read about trp-cage ([Barua et al, 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3166533/))
----

# Basic WebGL Project - Software Development Documentation

## Project Overview

**Repository Name:** `basic_webgl`

**Purpose:** Create a foundational WebGL canvas environment for testing and prototyping 3D objects. This serves as a sandbox for experimenting with WebGL rendering, lighting, and interaction patterns before migrating components to production projects.

**Deployment:** GitHub Pages

**Estimated Completion Time:** 2-4 hours for developers familiar with JavaScript

---

## Quick Start

For experienced developers:
1. Create repository with `.nojekyll` file in root
2. Add `docs/` folder with `index.html`, `style.css`, `webgl-scene.js`
3. Implement WebGL context, basic shaders, and four cubes in square formation
4. Add mouse rotation, camera reset button, and axis/grid helpers
5. Enable GitHub Pages pointing to `docs/` folder

---

## Repository Structure

```
basic_webgl/
├── docs/
│   ├── index.html
│   ├── style.css
│   └── webgl-scene.js
├── .nojekyll
└── README.md
```

### File Descriptions

- **docs/**: Root directory for GitHub Pages content
- **docs/index.html**: Main HTML page with canvas element and UI controls
- **docs/style.css**: Styling for layout, canvas, and UI elements
- **docs/webgl-scene.js**: WebGL initialization, scene setup, and interaction logic
- **.nojekyll**: Disables Jekyll processing to ensure WebGL assets load correctly
- **README.md**: Project notes, setup instructions, and development log

---

## Technical Specifications

### HTML Structure (index.html)

**Requirements:**
- Display "Hello World!" as page title (H1 element)
- WebGL canvas element below title
- Canvas dimensions: 66.67% viewport width, fixed height for laptop viewing
- Reset camera button positioned near canvas
- Fallback message for browsers without WebGL support

**Key Elements:**
```html
- <h1> for title
- <canvas id="webgl-canvas"> for 3D rendering
- <button id="reset-camera"> to reset camera view
- <script> tags for WebGL JavaScript
```

### CSS Styling (style.css)

**Layout Requirements:**
- Centered content with reasonable margins
- Canvas: 2/3 width (66.67vw or max 800px)
- Canvas height: 500-600px (optimal for laptop screens)
- Button styled with clear visibility
- Responsive design considerations
- Clean, minimal aesthetic

**Styling Approach:**
- Flexbox or centered block layout
- Dark border around canvas for visibility
- Button positioned below or beside canvas
- Sans-serif typography for readability

### WebGL Scene Implementation (webgl-scene.js)

#### Core Components

**1. WebGL Initialization**
- Get canvas element and WebGL context
- Set viewport and clear color
- Enable depth testing for 3D rendering
- Error handling for WebGL unavailability

**2. Shader Programs**
- Vertex shader: Transform 3D coordinates to screen space
- Fragment shader: Apply lighting and color
- Implement basic diffuse lighting model

**3. Scene Objects**

**Main Objects: Four Cubes**
- Four cubes arranged in square formation
- Cube generation using simple vertex arrays (8 vertices, 6 faces)
- Each cube: distinct color (e.g., red, blue, green, yellow)
- Position cubes at corners of square in XZ plane

**Cube Positions (example):**
```
Cube 1: (-2, 0, -2) - Red
Cube 2: ( 2, 0, -2) - Blue
Cube 3: (-2, 0,  2) - Green
Cube 4: ( 2, 0,  2) - Yellow
```

**Debug Helpers:**
- **Axis Indicator**: Three colored lines showing X (red), Y (green), Z (blue) axes
  - Each line extends from origin in positive/negative direction
  - Length: 5-10 units
  - Rendered with line primitives (gl.LINES)

- **Grid Floor**: Grid lines in XZ plane
  - 10x10 grid or similar
  - Gray/white lines for subtle visibility
  - Centered at origin
  - Helps visualize object positions and camera movement

**4. Lighting System**
- Single directional or point light source
- Light position: elevated and offset for visibility
- Ambient + diffuse lighting components
- Surface normals calculated for each cube face

**5. Camera System**
- Perspective projection matrix
- Initial camera position: looking at center of cube formation
- Default position: (0, 5, 10) looking at (0, 0, 0)
- Field of view: 45-60 degrees
- Near/far clipping planes: 0.1 to 100 units

**6. Interaction System**

**Mouse Interaction:**
- Mouse click-and-drag to rotate scene
- Track mouse down/up events
- Calculate rotation delta from mouse movement
- Apply rotation to view matrix (rotate camera around scene center)
- Smooth rotation using delta time or direct angle updates

**Camera Reset:**
- Button click returns camera to default position and rotation
- Reset rotation angles to initial values
- Smooth transition optional (can snap instantly)

#### Mathematical Components

**Projection Matrix:**
- Perspective projection with aspect ratio matching canvas dimensions
- FOV, aspect, near plane, far plane parameters

**View Matrix:**
- Look-at matrix pointing at origin (0, 0, 0)
- Camera orbits around center point based on mouse input
- Rotation applied via spherical coordinates or rotation matrices

**Model Matrix:**
- Individual transformation for each cube
- Translation to position in square formation
- Optional: scale adjustment for cube size

**Cube Generation:**
- 8 vertices defining cube corners
- 6 faces, each with 2 triangles (36 vertices total for indexed drawing, or 12 triangles)
- Normal vectors: one per face (flat shading) or interpolated (smooth shading)
- Store in WebGL buffers

---

## Implementation Steps

### Phase 1: Repository Setup
1. Create GitHub repository named `basic_webgl`
2. Add `.nojekyll` file (empty file in root)
3. Create `docs/` directory
4. Initialize README.md with project description

### Phase 2: HTML/CSS Foundation
1. Create `docs/index.html` with basic structure
2. Add canvas element with ID
3. Add reset camera button element
4. Create `docs/style.css` with layout rules
5. Test page loads correctly on local server

### Phase 3: WebGL Core Setup
1. Create `docs/webgl-scene.js`
2. Initialize WebGL context
3. Write vertex and fragment shaders
4. Compile and link shader program
5. Set up viewport and clear operations

### Phase 4: Cube Geometry
1. Define cube vertex positions (8 corners)
2. Define face indices for triangles
3. Calculate normals for each face
4. Create WebGL buffers (vertices, normals, indices)
5. Bind buffers and set up attribute pointers

### Phase 5: Debug Helpers
1. Create axis indicator geometry (6 vertices for 3 lines)
2. Create grid floor geometry (lines in XZ plane)
3. Add separate render calls for helpers
4. Use different colors for each axis
5. Ensure helpers render without lighting (or with simple flat color)

### Phase 6: Scene Assembly
1. Position four cubes in square formation
2. Assign colors to each cube
3. Set up projection and view matrices
4. Implement render loop with `requestAnimationFrame`
5. Render cubes, then axis, then grid in correct order

### Phase 7: Lighting Implementation
1. Add light position uniform to shaders
2. Calculate diffuse lighting in fragment shader
3. Add ambient lighting component
4. Test lighting visibility from multiple angles
5. Ensure axis/grid helpers bypass lighting or use flat shading

### Phase 8: Mouse Interaction
1. Add mouse event listeners (mousedown, mousemove, mouseup)
2. Track mouse position changes
3. Convert mouse delta to rotation angles
4. Update camera position or view matrix
5. Re-render scene on interaction

### Phase 9: Camera Reset Button
1. Add click event listener to reset button
2. Store default camera rotation angles
3. Reset rotation variables to defaults on click
4. Update view matrix with reset values
5. Re-render scene

### Phase 10: Testing and Refinement
1. Test on multiple browsers (Chrome, Firefox, Safari)
2. Verify WebGL support fallback
3. Test mouse interaction responsiveness
4. Test camera reset button
5. Verify axis and grid helpers are visible
6. Adjust lighting and camera parameters
7. Optimize render loop performance

### Phase 11: GitHub Pages Deployment
1. Commit all files to repository
2. Enable GitHub Pages in repository settings
3. Set source to `docs/` folder
4. Verify `.nojekyll` is present
5. Test deployed site at `https://[username].github.io/basic_webgl/`

---

## Configuration Parameters

### Canvas Dimensions
```javascript
const canvasWidth = Math.min(window.innerWidth * 0.667, 800);
const canvasHeight = 550;
```

### Camera Settings
```javascript
const fieldOfView = 45 * Math.PI / 180; // 45 degrees
const aspect = canvasWidth / canvasHeight;
const nearPlane = 0.1;
const farPlane = 100.0;

// Default camera settings
const defaultCameraDistance = 10.0;
const defaultCameraY = 5.0;
const defaultRotationX = -0.3; // Slight downward angle
const defaultRotationY = 0.0;
```

### Cube Parameters
```javascript
const cubeSize = 1.0; // Half-extent (cube spans -1 to 1)
const cubeSpacing = 4.0; // Distance between cube centers
```

### Grid Helper Parameters
```javascript
const gridSize = 10; // Number of grid lines
const gridSpacing = 1.0; // Distance between lines
const gridColor = [0.5, 0.5, 0.5]; // Gray
```

### Axis Helper Parameters
```javascript
const axisLength = 5.0;
const axisColors = {
    x: [1.0, 0.0, 0.0], // Red
    y: [0.0, 1.0, 0.0], // Green
    z: [0.0, 0.0, 1.0]  // Blue
};
```

### Lighting
```javascript
const lightPosition = [5.0, 5.0, 5.0];
const ambientStrength = 0.3;
const diffuseStrength = 0.7;
```

---

## WebGL Shader Examples

### Vertex Shader (GLSL) - Main Objects
```glsl
attribute vec3 aPosition;
attribute vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec3 vNormal;
varying vec3 vFragPos;

void main() {
    vec4 worldPos = uModelMatrix * vec4(aPosition, 1.0);
    vFragPos = worldPos.xyz;
    vNormal = mat3(uModelMatrix) * aNormal;

    gl_Position = uProjectionMatrix * uViewMatrix * worldPos;
}
```

### Fragment Shader (GLSL) - Main Objects
```glsl
precision mediump float;

varying vec3 vNormal;
varying vec3 vFragPos;

uniform vec3 uLightPos;
uniform vec3 uColor;

void main() {
    vec3 norm = normalize(vNormal);
    vec3 lightDir = normalize(uLightPos - vFragPos);

    float ambient = 0.3;
    float diffuse = max(dot(norm, lightDir), 0.0);

    vec3 result = (ambient + diffuse) * uColor;
    gl_FragColor = vec4(result, 1.0);
}
```

### Vertex Shader (GLSL) - Helpers (Axis/Grid)
```glsl
attribute vec3 aPosition;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
    gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
}
```

### Fragment Shader (GLSL) - Helpers
```glsl
precision mediump float;

uniform vec3 uColor;

void main() {
    gl_FragColor = vec4(uColor, 1.0);
}
```

---

## Cube Geometry Definition

### Vertex Positions
```javascript
const cubeVertices = [
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
];
```

### Normals (One Per Face)
```javascript
const cubeNormals = [
    // Front face (repeated 4 times)
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,

    // Back, Top, Bottom, Right, Left faces...
    // (similar pattern)
];
```

### Indices
```javascript
const cubeIndices = [
    0,  1,  2,    0,  2,  3,    // Front
    4,  5,  6,    4,  6,  7,    // Back
    8,  9,  10,   8,  10, 11,   // Top
    12, 13, 14,   12, 14, 15,   // Bottom
    16, 17, 18,   16, 18, 19,   // Right
    20, 21, 22,   20, 22, 23    // Left
];
```

---

## Axis and Grid Helper Implementation

### Axis Lines
```javascript
const axisVertices = [
    // X axis (red)
    -5.0, 0.0, 0.0,
     5.0, 0.0, 0.0,

    // Y axis (green)
    0.0, 0.0, 0.0,
    0.0, 5.0, 0.0,

    // Z axis (blue)
    0.0, 0.0, -5.0,
    0.0, 0.0,  5.0
];

// Render with gl.LINES, 2 vertices per line, 3 lines total
```

### Grid Lines
```javascript
// Generate grid in XZ plane
// Example: 10x10 grid from -5 to 5 in X and Z
const gridVertices = [];
for (let i = -5; i <= 5; i++) {
    // Lines parallel to X axis
    gridVertices.push(i, 0, -5);
    gridVertices.push(i, 0,  5);

    // Lines parallel to Z axis
    gridVertices.push(-5, 0, i);
    gridVertices.push( 5, 0, i);
}

// Render with gl.LINES
```

---

## Mouse Interaction Logic

### Event Handling Pattern
```javascript
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let rotationX = defaultRotationX;
let rotationY = defaultRotationY;

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    rotationY += deltaX * 0.01; // Horizontal rotation
    rotationX += deltaY * 0.01; // Vertical rotation

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Camera reset
document.getElementById('reset-camera').addEventListener('click', () => {
    rotationX = defaultRotationX;
    rotationY = defaultRotationY;
});
```

### Camera Rotation Update
```javascript
// Convert rotation angles to camera position
const camX = cameraDistance * Math.sin(rotationY) * Math.cos(rotationX);
const camY = defaultCameraY + cameraDistance * Math.sin(rotationX);
const camZ = cameraDistance * Math.cos(rotationY) * Math.cos(rotationX);

// Update view matrix with new camera position
```

---

## Render Order

Important: Render objects in this order for proper depth testing:
1. Clear color and depth buffers
2. Render cubes (with lighting)
3. Render grid (flat color, no lighting)
4. Render axis (flat color, no lighting)

This ensures helpers render on top when appropriate and maintain correct depth relationships.

---

## Future Development Considerations

### Testing New Objects
When adding new 3D objects to test:
1. Create separate geometry generation function
2. Use same buffer and shader infrastructure
3. Add to render loop with appropriate model matrix
4. Test lighting and interaction

### From Cubes to Complex Shapes
Once basics work:
- Add sphere generation function (use trigonometry for UV sphere)
- Add cylinder, cone, or other primitives
- Import external mesh models (OBJ files)
- Test procedural generation

### Performance Monitoring
- Use browser DevTools Performance tab
- Monitor frame rate (target: 60 FPS)
- Profile render loop for bottlenecks
- Consider instancing for multiple similar objects

### Migration to Production
Before moving working prototypes to production projects:
1. Extract reusable functions (geometry generation, matrix math)
2. Document shader requirements
3. Note any browser-specific quirks encountered
4. Capture performance benchmarks

### Potential Enhancements
- Add zoom functionality (mouse wheel)
- Implement touch controls for mobile
- Add object picking (click individual cubes)
- Include framerate counter
- Add wireframe toggle
- Implement shadows
- Add texture mapping examples
- Add color picker to change object colors

---

## Troubleshooting Guide

### Canvas Not Displaying
- Check browser console for WebGL errors
- Verify canvas has explicit width/height
- Confirm WebGL context initialization succeeded
- Check if viewport is set correctly

### Cubes Not Visible
- Verify camera position and orientation
- Check if depth testing is enabled (`gl.enable(gl.DEPTH_TEST)`)
- Confirm lighting calculations in shaders
- Verify cube positions are within view frustum
- Check face winding order (CCW vs CW)

### Axis/Grid Not Visible
- Verify line rendering uses correct primitive (gl.LINES)
- Check that helper shader is separate from main shader
- Confirm colors have sufficient contrast with background
- Verify helpers are rendered after clearing buffers

### Mouse Rotation Not Working
- Check event listeners are attached to canvas
- Verify rotation calculations update view matrix
- Confirm render loop is running continuously
- Check mouse position calculations
- Test if `isDragging` flag toggles correctly

### Camera Reset Button Not Working
- Verify button element has correct ID
- Check event listener is attached
- Confirm default values are defined
- Test if rotation variables reset properly
- Verify re-render is triggered after reset

### GitHub Pages Not Loading
- Verify `.nojekyll` file exists in repository root
- Check GitHub Pages is enabled in settings
- Confirm source is set to `docs/` folder
- Wait 5-10 minutes after first deployment
- Check browser console for 404 errors on resources

### Performance Issues
- Reduce cube count for testing
- Simplify grid resolution
- Optimize shader complexity
- Check for unnecessary buffer operations
- Profile with browser DevTools

---

## Resources and References

### WebGL Documentation
- [WebGL Fundamentals](https://webglfundamentals.org/)
- [MDN WebGL API](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)
- [WebGL Specification](https://www.khronos.org/registry/webgl/specs/)

### Mathematics for 3D Graphics
- Perspective projection matrices
- View transformation (look-at)
- Quaternions vs. Euler angles for rotation
- Basic lighting models (Phong, Blinn-Phong)

### GitHub Pages Setup
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- Jekyll bypassing with `.nojekyll`

---

## Development Notes Template

Use README.md to track:
- **Date:** When changes were made
- **Changes:** What was modified
- **Tests Added:** New objects or features tested
- **Issues Encountered:** Problems and solutions
- **Performance Notes:** FPS, optimization insights
- **Next Steps:** Future experiments or migrations

---

## Success Criteria

Project is complete when:
1. ✅ GitHub Pages displays "Hello World!" title
2. ✅ Canvas renders at 2/3 viewport width
3. ✅ Four cubes visible in square formation
4. ✅ Each cube has distinct color
5. ✅ Lighting makes cubes clearly visible
6. ✅ Axis indicator shows X, Y, Z with correct colors
7. ✅ Grid floor visible in XZ plane
8. ✅ Mouse click-and-drag rotates view smoothly
9. ✅ Reset camera button returns to default view
10. ✅ Scene renders at acceptable framerate (30+ FPS)
11. ✅ Works in Chrome, Firefox, and Safari
12. ✅ Code is documented and organized
13. ✅ Ready for future object testing

---

## Maintenance and Updates

This sandbox project should be kept simple and stable. When testing new concepts:
- Create branches for experimental features
- Keep main branch functional at all times
- Document successful experiments in README
- Extract proven techniques to separate production repositories

**Last Updated:** [Date]
**Version:** 2.0
**Status:** Ready for Implementation
