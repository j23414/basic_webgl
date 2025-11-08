// Simple OBJ file loader for WebGL

/**
 * Loads and parses an OBJ file
 * @param {string} url - URL to the .obj file
 * @returns {Promise<Object>} Promise resolving to geometry data {vertices, normals, indices}
 */
async function loadOBJ(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load OBJ: ${response.statusText}`);
        }
        const text = await response.text();
        return parseOBJ(text);
    } catch (error) {
        console.error('Error loading OBJ file:', error);
        throw error;
    }
}

/**
 * Parses OBJ file text content
 * @param {string} text - OBJ file content as string
 * @returns {Object} Geometry data {vertices, normals, indices}
 */
function parseOBJ(text) {
    // Temporary storage for parsing
    const positions = [];      // vertex positions (v)
    const normals = [];        // vertex normals (vn)
    const texCoords = [];      // texture coordinates (vt)

    // Final output arrays
    const vertices = [];       // interleaved vertex data
    const vertexNormals = [];  // interleaved normal data
    const indices = [];        // face indices

    // Map to avoid duplicate vertices
    const vertexMap = new Map();
    let currentIndex = 0;

    // Split into lines and process
    const lines = text.split('\n');

    for (let line of lines) {
        line = line.trim();

        // Skip empty lines and comments
        if (!line || line.startsWith('#')) continue;

        const parts = line.split(/\s+/);
        const type = parts[0];

        switch (type) {
            case 'v':  // Vertex position
                positions.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                );
                break;

            case 'vn': // Vertex normal
                normals.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                );
                break;

            case 'vt': // Texture coordinate (not used but parsed)
                texCoords.push(
                    parseFloat(parts[1]),
                    parseFloat(parts[2])
                );
                break;

            case 'f':  // Face
                // OBJ faces can be triangles or quads
                // Format: f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3 [v4/vt4/vn4]
                const faceVertices = [];

                for (let i = 1; i < parts.length; i++) {
                    const vertexData = parts[i].split('/');
                    const posIndex = parseInt(vertexData[0]) - 1;  // OBJ indices start at 1
                    const texIndex = vertexData[1] ? parseInt(vertexData[1]) - 1 : -1;
                    const normIndex = vertexData[2] ? parseInt(vertexData[2]) - 1 : -1;

                    // Create unique key for this vertex combination
                    const key = `${posIndex}/${texIndex}/${normIndex}`;

                    let index;
                    if (vertexMap.has(key)) {
                        // Reuse existing vertex
                        index = vertexMap.get(key);
                    } else {
                        // Add new vertex
                        index = currentIndex++;
                        vertexMap.set(key, index);

                        // Add position
                        vertices.push(
                            positions[posIndex * 3],
                            positions[posIndex * 3 + 1],
                            positions[posIndex * 3 + 2]
                        );

                        // Add normal (or generate if missing)
                        if (normIndex >= 0 && normals.length > 0) {
                            vertexNormals.push(
                                normals[normIndex * 3],
                                normals[normIndex * 3 + 1],
                                normals[normIndex * 3 + 2]
                            );
                        } else {
                            // Default normal if not provided
                            vertexNormals.push(0, 0, 1);
                        }
                    }

                    faceVertices.push(index);
                }

                // Triangulate face (handles both triangles and quads)
                if (faceVertices.length === 3) {
                    // Triangle
                    indices.push(faceVertices[0], faceVertices[1], faceVertices[2]);
                } else if (faceVertices.length === 4) {
                    // Quad - split into two triangles
                    indices.push(faceVertices[0], faceVertices[1], faceVertices[2]);
                    indices.push(faceVertices[0], faceVertices[2], faceVertices[3]);
                } else if (faceVertices.length > 4) {
                    // Polygon - fan triangulation
                    for (let i = 1; i < faceVertices.length - 1; i++) {
                        indices.push(faceVertices[0], faceVertices[i], faceVertices[i + 1]);
                    }
                }
                break;
        }
    }

    // If no normals were provided, calculate them
    if (vertexNormals.length === 0) {
        calculateNormals(vertices, indices, vertexNormals);
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(vertexNormals),
        indices: new Uint16Array(indices)
    };
}

/**
 * Calculate normals for geometry without normals
 * Uses face normals (flat shading)
 */
function calculateNormals(vertices, indices, outNormals) {
    // Initialize normals to zero
    const normalCount = vertices.length;
    for (let i = 0; i < normalCount; i++) {
        outNormals.push(0);
    }

    // Calculate face normals and accumulate at vertices
    for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i] * 3;
        const i1 = indices[i + 1] * 3;
        const i2 = indices[i + 2] * 3;

        // Get triangle vertices
        const v0 = [vertices[i0], vertices[i0 + 1], vertices[i0 + 2]];
        const v1 = [vertices[i1], vertices[i1 + 1], vertices[i1 + 2]];
        const v2 = [vertices[i2], vertices[i2 + 1], vertices[i2 + 2]];

        // Calculate edges
        const e1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
        const e2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];

        // Calculate normal (cross product)
        const normal = [
            e1[1] * e2[2] - e1[2] * e2[1],
            e1[2] * e2[0] - e1[0] * e2[2],
            e1[0] * e2[1] - e1[1] * e2[0]
        ];

        // Accumulate normal at each vertex
        for (let j = 0; j < 3; j++) {
            const idx = indices[i + j] * 3;
            outNormals[idx] += normal[0];
            outNormals[idx + 1] += normal[1];
            outNormals[idx + 2] += normal[2];
        }
    }

    // Normalize all normals
    for (let i = 0; i < outNormals.length; i += 3) {
        const x = outNormals[i];
        const y = outNormals[i + 1];
        const z = outNormals[i + 2];
        const length = Math.sqrt(x * x + y * y + z * z);

        if (length > 0) {
            outNormals[i] /= length;
            outNormals[i + 1] /= length;
            outNormals[i + 2] /= length;
        }
    }
}

/**
 * Creates a simple OBJ file content for testing
 * @param {string} shape - Shape type ('cube', 'pyramid', 'tetrahedron')
 * @returns {string} OBJ file content
 */
function createTestOBJ(shape = 'cube') {
    switch (shape) {
        case 'pyramid':
            return `# Simple pyramid
v 0.0 1.0 0.0
v -1.0 0.0 1.0
v 1.0 0.0 1.0
v 1.0 0.0 -1.0
v -1.0 0.0 -1.0

vn 0.0 0.447 0.894
vn 0.894 0.447 0.0
vn 0.0 0.447 -0.894
vn -0.894 0.447 0.0
vn 0.0 -1.0 0.0

f 1//1 2//1 3//1
f 1//2 3//2 4//2
f 1//3 4//3 5//3
f 1//4 5//4 2//4
f 2//5 5//5 4//5
f 2//5 4//5 3//5
`;

        case 'tetrahedron':
            return `# Simple tetrahedron
v 0.0 1.0 0.0
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v 0.0 -1.0 -1.0

f 1 2 3
f 1 3 4
f 1 4 2
f 2 4 3
`;

        case 'cube':
        default:
            return `# Simple cube
v -1.0 -1.0 1.0
v 1.0 -1.0 1.0
v 1.0 1.0 1.0
v -1.0 1.0 1.0
v -1.0 -1.0 -1.0
v 1.0 -1.0 -1.0
v 1.0 1.0 -1.0
v -1.0 1.0 -1.0

vn 0.0 0.0 1.0
vn 0.0 0.0 -1.0
vn 0.0 1.0 0.0
vn 0.0 -1.0 0.0
vn 1.0 0.0 0.0
vn -1.0 0.0 0.0

f 1//1 2//1 3//1 4//1
f 5//2 8//2 7//2 6//2
f 4//3 3//3 7//3 8//3
f 5//4 6//4 2//4 1//4
f 2//5 6//5 7//5 3//5
f 5//6 1//6 4//6 8//6
`;
    }
}