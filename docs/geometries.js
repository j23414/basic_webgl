// Geometry factory functions for WebGL primitives

/**
 * Creates cube geometry data
 * @param {number} size - Half-extent of the cube (default: 1.0)
 * @returns {Object} Object containing vertices, normals, and indices
 */
function createCube(size = 1.0) {
    const s = size;

    const vertices = new Float32Array([
        // Front face
        -s, -s,  s,
         s, -s,  s,
         s,  s,  s,
        -s,  s,  s,

        // Back face
        -s, -s, -s,
        -s,  s, -s,
         s,  s, -s,
         s, -s, -s,

        // Top face
        -s,  s, -s,
        -s,  s,  s,
         s,  s,  s,
         s,  s, -s,

        // Bottom face
        -s, -s, -s,
         s, -s, -s,
         s, -s,  s,
        -s, -s,  s,

        // Right face
         s, -s, -s,
         s,  s, -s,
         s,  s,  s,
         s, -s,  s,

        // Left face
        -s, -s, -s,
        -s, -s,  s,
        -s,  s,  s,
        -s,  s, -s
    ]);

    const normals = new Float32Array([
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

    const indices = new Uint16Array([
        0,  1,  2,    0,  2,  3,    // Front
        4,  5,  6,    4,  6,  7,    // Back
        8,  9,  10,   8,  10, 11,   // Top
        12, 13, 14,   12, 14, 15,   // Bottom
        16, 17, 18,   16, 18, 19,   // Right
        20, 21, 22,   20, 22, 23    // Left
    ]);

    return {
        vertices,
        normals,
        indices
    };
}

/**
 * Creates sphere geometry data using UV sphere method
 * @param {number} radius - Radius of the sphere (default: 1.0)
 * @param {number} latitudeBands - Number of horizontal divisions (default: 30)
 * @param {number} longitudeBands - Number of vertical divisions (default: 30)
 * @returns {Object} Object containing vertices, normals, and indices
 */
function createSphere(radius = 1.0, latitudeBands = 30, longitudeBands = 30) {
    const vertices = [];
    const normals = [];
    const indices = [];

    // Generate vertices and normals
    for (let lat = 0; lat <= latitudeBands; lat++) {
        const theta = lat * Math.PI / latitudeBands;
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        for (let lon = 0; lon <= longitudeBands; lon++) {
            const phi = lon * 2 * Math.PI / longitudeBands;
            const sinPhi = Math.sin(phi);
            const cosPhi = Math.cos(phi);

            const x = cosPhi * sinTheta;
            const y = cosTheta;
            const z = sinPhi * sinTheta;

            // Vertex position
            vertices.push(radius * x, radius * y, radius * z);

            // Normal (same as position for unit sphere)
            normals.push(x, y, z);
        }
    }

    // Generate indices
    for (let lat = 0; lat < latitudeBands; lat++) {
        for (let lon = 0; lon < longitudeBands; lon++) {
            const first = lat * (longitudeBands + 1) + lon;
            const second = first + longitudeBands + 1;

            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}

/**
 * Creates cylinder geometry data
 * @param {number} radiusTop - Radius at the top (default: 1.0)
 * @param {number} radiusBottom - Radius at the bottom (default: 1.0)
 * @param {number} height - Height of the cylinder (default: 2.0)
 * @param {number} radialSegments - Number of segments around circumference (default: 32)
 * @returns {Object} Object containing vertices, normals, and indices
 */
function createCylinder(radiusTop = 1.0, radiusBottom = 1.0, height = 2.0, radialSegments = 32) {
    const vertices = [];
    const normals = [];
    const indices = [];

    const halfHeight = height / 2;

    // Generate vertices for the sides
    for (let y = 0; y <= 1; y++) {
        const v = y;
        const radius = v * (radiusTop - radiusBottom) + radiusBottom;
        const yPos = v * height - halfHeight;

        for (let x = 0; x <= radialSegments; x++) {
            const u = x / radialSegments;
            const theta = u * Math.PI * 2;

            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            // Vertex
            vertices.push(radius * cosTheta, yPos, radius * sinTheta);

            // Normal
            normals.push(cosTheta, 0, sinTheta);
        }
    }

    // Generate indices for sides
    for (let y = 0; y < 1; y++) {
        for (let x = 0; x < radialSegments; x++) {
            const a = y * (radialSegments + 1) + x;
            const b = a + radialSegments + 1;

            indices.push(a, b, a + 1);
            indices.push(b, b + 1, a + 1);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}

/**
 * Creates a plane (quad) geometry
 * @param {number} width - Width of the plane (default: 2.0)
 * @param {number} height - Height of the plane (default: 2.0)
 * @param {number} widthSegments - Number of width subdivisions (default: 1)
 * @param {number} heightSegments - Number of height subdivisions (default: 1)
 * @returns {Object} Object containing vertices, normals, and indices
 */
function createPlane(width = 2.0, height = 2.0, widthSegments = 1, heightSegments = 1) {
    const vertices = [];
    const normals = [];
    const indices = [];

    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // Generate vertices
    for (let iy = 0; iy <= heightSegments; iy++) {
        const y = iy * height / heightSegments - halfHeight;

        for (let ix = 0; ix <= widthSegments; ix++) {
            const x = ix * width / widthSegments - halfWidth;

            vertices.push(x, y, 0);
            normals.push(0, 0, 1);
        }
    }

    // Generate indices
    for (let iy = 0; iy < heightSegments; iy++) {
        for (let ix = 0; ix < widthSegments; ix++) {
            const a = iy * (widthSegments + 1) + ix;
            const b = a + 1;
            const c = a + widthSegments + 1;
            const d = c + 1;

            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices)
    };
}