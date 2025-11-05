// WebGL Scene Setup and Rendering

// Get canvas and WebGL context
const canvas = document.getElementById('webgl-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('WebGL not supported in this browser');
    throw new Error('WebGL not supported');
}

// Set canvas resolution to match display size
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Configuration
const defaultCameraDistance = 10.0;
const defaultCameraY = 5.0;
const defaultRotationX = -0.3;
const defaultRotationY = 0.0;

// Camera state
let rotationX = defaultRotationX;
let rotationY = defaultRotationY;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// ===== SHADER SOURCES =====

// Vertex shader for cubes (with lighting)
const cubeVertexShaderSource = `
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
`;

// Fragment shader for cubes (with lighting)
const cubeFragmentShaderSource = `
    precision mediump float;

    varying vec3 vNormal;
    varying vec3 vFragPos;

    uniform vec3 uLightPos;
    uniform vec3 uColor;

    void main() {
        vec3 norm = normalize(vNormal);
        vec3 lightDir = normalize(uLightPos - vFragPos);

        float ambient = 0.3;
        float diffuse = max(dot(norm, lightDir), 0.0) * 0.7;

        vec3 result = (ambient + diffuse) * uColor;
        gl_FragColor = vec4(result, 1.0);
    }
`;

// Vertex shader for helpers (no lighting)
const helperVertexShaderSource = `
    attribute vec3 aPosition;

    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main() {
        gl_Position = uProjectionMatrix * uViewMatrix * vec4(aPosition, 1.0);
    }
`;

// Fragment shader for helpers (flat color)
const helperFragmentShaderSource = `
    precision mediump float;

    uniform vec3 uColor;

    void main() {
        gl_FragColor = vec4(uColor, 1.0);
    }
`;

// ===== SHADER COMPILATION =====

function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(vertexSource, fragmentSource) {
    const vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program linking error:', gl.getProgramInfoLog(program));
        return null;
    }

    return program;
}

// Create shader programs
const cubeProgram = createProgram(cubeVertexShaderSource, cubeFragmentShaderSource);
const helperProgram = createProgram(helperVertexShaderSource, helperFragmentShaderSource);

// ===== CUBE GEOMETRY =====

const cubeVertices = new Float32Array([
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
]);

const cubeNormals = new Float32Array([
    // Front face
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,
    0.0,  0.0,  1.0,

    // Back face
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,
    0.0,  0.0, -1.0,

    // Top face
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,
    0.0,  1.0,  0.0,

    // Bottom face
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,
    0.0, -1.0,  0.0,

    // Right face
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,
    1.0,  0.0,  0.0,

    // Left face
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
]);

const cubeIndices = new Uint16Array([
    0,  1,  2,    0,  2,  3,    // Front
    4,  5,  6,    4,  6,  7,    // Back
    8,  9,  10,   8,  10, 11,   // Top
    12, 13, 14,   12, 14, 15,   // Bottom
    16, 17, 18,   16, 18, 19,   // Right
    20, 21, 22,   20, 22, 23    // Left
]);

// Create buffers for cube
const cubeVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);

const cubeNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, cubeNormals, gl.STATIC_DRAW);

const cubeIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, cubeIndices, gl.STATIC_DRAW);

// ===== AXIS HELPER GEOMETRY =====

const axisVertices = new Float32Array([
    // X axis (red)
    0.0, 0.0, 0.0,
    5.0, 0.0, 0.0,

    // Y axis (green)
    0.0, 0.0, 0.0,
    0.0, 5.0, 0.0,

    // Z axis (blue)
    0.0, 0.0, 0.0,
    0.0, 0.0, 5.0
]);

const axisBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
gl.bufferData(gl.ARRAY_BUFFER, axisVertices, gl.STATIC_DRAW);

// ===== GRID HELPER GEOMETRY =====

const gridVertices = [];
const gridSize = 10;
const gridSpacing = 1.0;

for (let i = -gridSize; i <= gridSize; i++) {
    // Lines parallel to X axis
    gridVertices.push(i * gridSpacing, 0, -gridSize * gridSpacing);
    gridVertices.push(i * gridSpacing, 0,  gridSize * gridSpacing);

    // Lines parallel to Z axis
    gridVertices.push(-gridSize * gridSpacing, 0, i * gridSpacing);
    gridVertices.push( gridSize * gridSpacing, 0, i * gridSpacing);
}

const gridBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gridVertices), gl.STATIC_DRAW);

// ===== MATRIX MATH UTILITIES =====

function createPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1 / (near - far);

    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
    ];
}

function createLookAtMatrix(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ) {
    let zx = eyeX - centerX;
    let zy = eyeY - centerY;
    let zz = eyeZ - centerZ;

    let len = Math.sqrt(zx * zx + zy * zy + zz * zz);
    zx /= len; zy /= len; zz /= len;

    let xx = upY * zz - upZ * zy;
    let xy = upZ * zx - upX * zz;
    let xz = upX * zy - upY * zx;

    len = Math.sqrt(xx * xx + xy * xy + xz * xz);
    xx /= len; xy /= len; xz /= len;

    const yx = zy * xz - zz * xy;
    const yy = zz * xx - zx * xz;
    const yz = zx * xy - zy * xx;

    return [
        xx, yx, zx, 0,
        xy, yy, zy, 0,
        xz, yz, zz, 0,
        -(xx * eyeX + xy * eyeY + xz * eyeZ),
        -(yx * eyeX + yy * eyeY + yz * eyeZ),
        -(zx * eyeX + zy * eyeY + zz * eyeZ),
        1
    ];
}

function createTranslationMatrix(x, y, z) {
    return [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ];
}

// ===== RENDERING =====

// Cube positions and colors
const cubes = [
    { position: [-2, 0, -2], color: [1.0, 0.0, 0.0] }, // Red
    { position: [ 2, 0, -2], color: [0.0, 0.0, 1.0] }, // Blue
    { position: [-2, 0,  2], color: [0.0, 1.0, 0.0] }, // Green
    { position: [ 2, 0,  2], color: [1.0, 1.0, 0.0] }  // Yellow
];

function render() {
    // Clear
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Projection matrix
    const fov = 45 * Math.PI / 180;
    const aspect = canvas.width / canvas.height;
    const projectionMatrix = createPerspectiveMatrix(fov, aspect, 0.1, 100.0);

    // View matrix (camera)
    const camX = defaultCameraDistance * Math.sin(rotationY) * Math.cos(rotationX);
    const camY = defaultCameraY + defaultCameraDistance * Math.sin(rotationX);
    const camZ = defaultCameraDistance * Math.cos(rotationY) * Math.cos(rotationX);
    const viewMatrix = createLookAtMatrix(camX, camY, camZ, 0, 0, 0, 0, 1, 0);

    // ===== RENDER CUBES =====
    gl.useProgram(cubeProgram);

    // Get attribute and uniform locations
    const cubePositionLoc = gl.getAttribLocation(cubeProgram, 'aPosition');
    const cubeNormalLoc = gl.getAttribLocation(cubeProgram, 'aNormal');
    const cubeModelMatrixLoc = gl.getUniformLocation(cubeProgram, 'uModelMatrix');
    const cubeViewMatrixLoc = gl.getUniformLocation(cubeProgram, 'uViewMatrix');
    const cubeProjectionMatrixLoc = gl.getUniformLocation(cubeProgram, 'uProjectionMatrix');
    const cubeLightPosLoc = gl.getUniformLocation(cubeProgram, 'uLightPos');
    const cubeColorLoc = gl.getUniformLocation(cubeProgram, 'uColor');

    // Set projection and view matrices
    gl.uniformMatrix4fv(cubeProjectionMatrixLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(cubeViewMatrixLoc, false, viewMatrix);
    gl.uniform3f(cubeLightPosLoc, 5.0, 5.0, 5.0);

    // Bind cube vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.enableVertexAttribArray(cubePositionLoc);
    gl.vertexAttribPointer(cubePositionLoc, 3, gl.FLOAT, false, 0, 0);

    // Bind cube normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
    gl.enableVertexAttribArray(cubeNormalLoc);
    gl.vertexAttribPointer(cubeNormalLoc, 3, gl.FLOAT, false, 0, 0);

    // Bind index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    // Render each cube
    for (const cube of cubes) {
        const modelMatrix = createTranslationMatrix(...cube.position);
        gl.uniformMatrix4fv(cubeModelMatrixLoc, false, modelMatrix);
        gl.uniform3f(cubeColorLoc, ...cube.color);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }

    // ===== RENDER GRID =====
    gl.useProgram(helperProgram);

    const helperPositionLoc = gl.getAttribLocation(helperProgram, 'aPosition');
    const helperViewMatrixLoc = gl.getUniformLocation(helperProgram, 'uViewMatrix');
    const helperProjectionMatrixLoc = gl.getUniformLocation(helperProgram, 'uProjectionMatrix');
    const helperColorLoc = gl.getUniformLocation(helperProgram, 'uColor');

    gl.uniformMatrix4fv(helperProjectionMatrixLoc, false, projectionMatrix);
    gl.uniformMatrix4fv(helperViewMatrixLoc, false, viewMatrix);

    // Draw grid
    gl.bindBuffer(gl.ARRAY_BUFFER, gridBuffer);
    gl.enableVertexAttribArray(helperPositionLoc);
    gl.vertexAttribPointer(helperPositionLoc, 3, gl.FLOAT, false, 0, 0);
    gl.uniform3f(helperColorLoc, 0.5, 0.5, 0.5); // Gray
    gl.drawArrays(gl.LINES, 0, gridVertices.length / 3);

    // ===== RENDER AXIS =====
    gl.bindBuffer(gl.ARRAY_BUFFER, axisBuffer);
    gl.vertexAttribPointer(helperPositionLoc, 3, gl.FLOAT, false, 0, 0);

    // X axis (red)
    gl.uniform3f(helperColorLoc, 1.0, 0.0, 0.0);
    gl.drawArrays(gl.LINES, 0, 2);

    // Y axis (green)
    gl.uniform3f(helperColorLoc, 0.0, 1.0, 0.0);
    gl.drawArrays(gl.LINES, 2, 2);

    // Z axis (blue)
    gl.uniform3f(helperColorLoc, 0.0, 0.0, 1.0);
    gl.drawArrays(gl.LINES, 4, 2);
}

// ===== INTERACTION =====

canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    rotationY += deltaX * 0.01;
    rotationX += deltaY * 0.01;

    // Clamp vertical rotation
    rotationX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotationX));

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    render();
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

// Reset camera button
document.getElementById('reset-camera').addEventListener('click', () => {
    rotationX = defaultRotationX;
    rotationY = defaultRotationY;
    render();
});

// ===== ANIMATION LOOP =====

function animate() {
    render();
    requestAnimationFrame(animate);
}

// Start rendering
animate();