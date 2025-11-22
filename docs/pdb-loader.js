// PDB file loader and ball-and-stick visualizer for proteins

/**
 * Loads and parses a PDB file
 * @param {string} url - URL to the .pdb file
 * @returns {Promise<Object>} Promise resolving to protein data
 */
async function loadPDB(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load PDB: ${response.statusText}`);
        }
        const text = await response.text();
        return parsePDB(text);
    } catch (error) {
        console.error('Error loading PDB file:', error);
        throw error;
    }
}

/**
 * Parses PDB file text content
 * @param {string} text - PDB file content as string
 * @returns {Object} Protein data with atoms and bonds
 */
function parsePDB(text) {
    const atoms = [];
    const lines = text.split('\n');

    for (const line of lines) {
        // Parse ATOM and HETATM records
        if (line.startsWith('ATOM  ') || line.startsWith('HETATM')) {
            const atom = {
                serial: parseInt(line.substring(6, 11).trim()),
                name: line.substring(12, 16).trim(),
                resName: line.substring(17, 20).trim(),
                chainId: line.substring(21, 22).trim(),
                resSeq: parseInt(line.substring(22, 26).trim()),
                x: parseFloat(line.substring(30, 38).trim()),
                y: parseFloat(line.substring(38, 46).trim()),
                z: parseFloat(line.substring(46, 54).trim()),
                element: line.substring(76, 78).trim() || guessElement(line.substring(12, 16).trim())
            };
            atoms.push(atom);
        }
    }

    console.log(`Parsed ${atoms.length} atoms from PDB`);

    // Center the molecule at origin
    centerMolecule(atoms);

    // Calculate bonds based on distance
    const bonds = calculateBonds(atoms);
    console.log(`Calculated ${bonds.length} bonds`);

    return { atoms, bonds };
}

/**
 * Guess element from atom name if not specified
 */
function guessElement(atomName) {
    atomName = atomName.trim();
    // First character is usually the element for common atoms
    const firstChar = atomName.charAt(0);
    if (firstChar === 'C') return 'C';
    if (firstChar === 'N') return 'N';
    if (firstChar === 'O') return 'O';
    if (firstChar === 'S') return 'S';
    if (firstChar === 'H') return 'H';
    if (firstChar === 'P') return 'P';
    return 'C'; // Default to carbon
}

/**
 * Calculate bonds between atoms based on distance
 * Bonds exist when atoms are within typical bonding distance
 */
function calculateBonds(atoms, maxBondDistance = 1.8) {
    const bonds = [];

    // Only calculate bonds for nearby atoms to avoid O(n²) for large proteins
    for (let i = 0; i < atoms.length; i++) {
        for (let j = i + 1; j < atoms.length; j++) {
            const atom1 = atoms[i];
            const atom2 = atoms[j];

            // Skip hydrogen bonds for cleaner visualization
            if (atom1.element === 'H' || atom2.element === 'H') continue;

            // Calculate distance
            const dx = atom1.x - atom2.x;
            const dy = atom1.y - atom2.y;
            const dz = atom1.z - atom2.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Check if within bonding distance
            if (distance < maxBondDistance) {
                bonds.push({
                    atom1: i,
                    atom2: j,
                    distance: distance
                });
            }
        }
    }

    return bonds;
}

/**
 * Center molecule at origin for better viewing
 */
function centerMolecule(atoms) {
    if (atoms.length === 0) return;

    // Calculate center of mass
    let sumX = 0, sumY = 0, sumZ = 0;
    for (const atom of atoms) {
        sumX += atom.x;
        sumY += atom.y;
        sumZ += atom.z;
    }

    const centerX = sumX / atoms.length;
    const centerY = sumY / atoms.length;
    const centerZ = sumZ / atoms.length;

    // Shift all atoms
    for (const atom of atoms) {
        atom.x -= centerX;
        atom.y -= centerY;
        atom.z -= centerZ;
    }
}

/**
 * Get CPK color for an element (standard atom colors)
 */
function getCPKColor(element) {
    const colors = {
        'H': [1.0, 1.0, 1.0],  // White
        'C': [0.2, 0.2, 0.2],  // Dark gray
        'N': [0.0, 0.0, 1.0],  // Blue
        'O': [1.0, 0.0, 0.0],  // Red
        'S': [1.0, 1.0, 0.0],  // Yellow
        'P': [1.0, 0.5, 0.0],  // Orange
        'F': [0.0, 1.0, 0.0],  // Green
        'CL': [0.0, 1.0, 0.0], // Green
        'BR': [0.5, 0.0, 0.0], // Dark red
        'I': [0.5, 0.0, 0.5],  // Purple
        'FE': [1.0, 0.5, 0.0], // Orange
        'CA': [0.0, 1.0, 0.0]  // Green
    };

    return colors[element.toUpperCase()] || [0.8, 0.0, 0.8]; // Default: magenta
}

/**
 * Get Van der Waals radius for an element (in Angstroms)
 */
function getVDWRadius(element) {
    const radii = {
        'H': 0.3,
        'C': 0.4,
        'N': 0.35,
        'O': 0.35,
        'S': 0.45,
        'P': 0.45
    };

    return radii[element.toUpperCase()] || 0.4;
}

/**
 * Creates ball-and-stick geometry for a protein
 * @param {Object} proteinData - Data from parsePDB
 * @param {Object} options - Visualization options
 * @returns {Object} Geometry arrays for atoms and bonds
 */
function createBallAndStick(proteinData, options = {}) {
    const atomScale = options.atomScale || 0.3;  // Scale factor for atom spheres
    const bondRadius = options.bondRadius || 0.1; // Radius of bond cylinders
    const sphereDetail = options.sphereDetail || 8; // Sphere subdivision

    const atomGeometries = [];
    const bondGeometries = [];

    // Create sphere for each atom
    for (let i = 0; i < proteinData.atoms.length; i++) {
        const atom = proteinData.atoms[i];
        const radius = getVDWRadius(atom.element) * atomScale;
        const color = getCPKColor(atom.element);

        atomGeometries.push({
            position: [atom.x, atom.y, atom.z],
            radius: radius,
            color: color,
            element: atom.element
        });
    }

    // Create cylinder for each bond
    for (const bond of proteinData.bonds) {
        const atom1 = proteinData.atoms[bond.atom1];
        const atom2 = proteinData.atoms[bond.atom2];

        bondGeometries.push({
            start: [atom1.x, atom1.y, atom1.z],
            end: [atom2.x, atom2.y, atom2.z],
            radius: bondRadius,
            color: [0.5, 0.5, 0.5] // Gray bonds
        });
    }

    return { atomGeometries, bondGeometries };
}

/**
 * Generates merged WebGL geometry for all atoms and bonds
 * @param {Object} ballAndStick - Output from createBallAndStick
 * @param {Function} sphereGenerator - Function to generate sphere geometry
 * @param {Function} cylinderGenerator - Function to generate cylinder geometry
 * @returns {Object} Combined geometry {vertices, normals, colors, indices}
 */
function generateProteinGeometry(ballAndStick, sphereGenerator, cylinderGenerator) {
    const vertices = [];
    const normals = [];
    const colors = [];
    const indices = [];
    let currentIndex = 0;

    // Add all atoms (spheres)
    for (const atomGeom of ballAndStick.atomGeometries) {
        const sphere = sphereGenerator(atomGeom.radius, 10, 10);

        // Translate sphere to atom position
        for (let i = 0; i < sphere.vertices.length; i += 3) {
            vertices.push(
                sphere.vertices[i] + atomGeom.position[0],
                sphere.vertices[i + 1] + atomGeom.position[1],
                sphere.vertices[i + 2] + atomGeom.position[2]
            );

            // Add normals
            normals.push(
                sphere.normals[i],
                sphere.normals[i + 1],
                sphere.normals[i + 2]
            );

            // Add colors (repeat for each vertex)
            colors.push(atomGeom.color[0], atomGeom.color[1], atomGeom.color[2]);
        }

        // Add indices (offset by current index)
        for (let i = 0; i < sphere.indices.length; i++) {
            indices.push(sphere.indices[i] + currentIndex);
        }

        currentIndex += sphere.vertices.length / 3;
    }

    // Add all bonds (cylinders)
    for (const bondGeom of ballAndStick.bondGeometries) {
        // Calculate cylinder orientation
        const dx = bondGeom.end[0] - bondGeom.start[0];
        const dy = bondGeom.end[1] - bondGeom.start[1];
        const dz = bondGeom.end[2] - bondGeom.start[2];
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Create cylinder along Y axis, then rotate
        const cylinder = cylinderGenerator(bondGeom.radius, bondGeom.radius, length, 8);

        // Calculate rotation to align with bond
        const midX = (bondGeom.start[0] + bondGeom.end[0]) / 2;
        const midY = (bondGeom.start[1] + bondGeom.end[1]) / 2;
        const midZ = (bondGeom.start[2] + bondGeom.end[2]) / 2;

        // Simple approach: translate to midpoint
        // (Proper rotation would require quaternions or rotation matrices)
        for (let i = 0; i < cylinder.vertices.length; i += 3) {
            // For now, just translate - bonds will be simplified as lines in actual implementation
            vertices.push(
                cylinder.vertices[i] + midX,
                cylinder.vertices[i + 1] + midY,
                cylinder.vertices[i + 2] + midZ
            );

            normals.push(
                cylinder.normals[i],
                cylinder.normals[i + 1],
                cylinder.normals[i + 2]
            );

            colors.push(bondGeom.color[0], bondGeom.color[1], bondGeom.color[2]);
        }

        for (let i = 0; i < cylinder.indices.length; i++) {
            indices.push(cylinder.indices[i] + currentIndex);
        }

        currentIndex += cylinder.vertices.length / 3;
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals),
        colors: new Float32Array(colors),
        indices: new Uint16Array(indices)
    };
}

/**
 * Simplified version: Generate geometry with atoms as spheres and bonds as lines
 * This is easier to implement and performs better
 */
function generateProteinGeometrySimple(proteinData, options = {}) {
    const atomScale = options.atomScale || 0.3;
    const sphereDetail = options.sphereDetail || 10;

    const atomsGeometry = {
        positions: [],
        colors: [],
        radii: [],
        elements: []
    };

    const bondsGeometry = {
        positions: [],
        colors: []
    };

    // Store atom data
    for (const atom of proteinData.atoms) {
        atomsGeometry.positions.push(atom.x, atom.y, atom.z);

        const color = getCPKColor(atom.element);
        atomsGeometry.colors.push(color[0], color[1], color[2]);

        const radius = getVDWRadius(atom.element) * atomScale;
        atomsGeometry.radii.push(radius);

        atomsGeometry.elements.push(atom.element);
    }

    // Store bond data (as line segments)
    for (const bond of proteinData.bonds) {
        const atom1 = proteinData.atoms[bond.atom1];
        const atom2 = proteinData.atoms[bond.atom2];

        // Start point
        bondsGeometry.positions.push(atom1.x, atom1.y, atom1.z);
        // End point
        bondsGeometry.positions.push(atom2.x, atom2.y, atom2.z);

        // Gray color for bonds
        bondsGeometry.colors.push(0.5, 0.5, 0.5);
        bondsGeometry.colors.push(0.5, 0.5, 0.5);
    }

    return {
        atoms: atomsGeometry,
        bonds: bondsGeometry
    };
}

/**
 * Download PDB from RCSB database
 * @param {string} pdbId - 4-character PDB ID (e.g., '1CRN')
 * @returns {Promise<Object>} Protein data
 */
async function fetchPDBFromRCSB(pdbId) {
    const url = `https://files.rcsb.org/download/${pdbId.toUpperCase()}.pdb`;
    return await loadPDB(url);
}

/**
 * Extract backbone trace (CA atoms only) for cartoon representation
 * @param {Object} proteinData - Data from parsePDB
 * @returns {Object} Backbone trace data
 */
function extractBackboneTrace(proteinData) {
    const backboneAtoms = [];
    const backboneSegments = [];

    // Group atoms by chain and residue
    const chains = {};

    for (const atom of proteinData.atoms) {
        // Only consider CA (alpha carbon) atoms for backbone
        if (atom.name === 'CA') {
            const chainId = atom.chainId || 'A';
            if (!chains[chainId]) {
                chains[chainId] = [];
            }
            chains[chainId].push({
                resSeq: atom.resSeq,
                x: atom.x,
                y: atom.y,
                z: atom.z,
                resName: atom.resName
            });
        }
    }

    // Sort each chain by residue sequence number
    for (const chainId in chains) {
        chains[chainId].sort((a, b) => a.resSeq - b.resSeq);
    }

    // Create line segments connecting consecutive CA atoms
    for (const chainId in chains) {
        const chain = chains[chainId];

        for (let i = 0; i < chain.length; i++) {
            backboneAtoms.push(chain[i]);

            // Connect to next atom if consecutive residues
            if (i < chain.length - 1) {
                const current = chain[i];
                const next = chain[i + 1];

                // Only connect if residues are sequential (within 2 residues)
                // This avoids connecting across chain breaks
                if (Math.abs(next.resSeq - current.resSeq) <= 2) {
                    backboneSegments.push({
                        start: { x: current.x, y: current.y, z: current.z },
                        end: { x: next.x, y: next.y, z: next.z },
                        chainId: chainId
                    });
                }
            }
        }
    }

    return {
        atoms: backboneAtoms,
        segments: backboneSegments,
        chains: Object.keys(chains)
    };
}

/**
 * Generate geometry for backbone trace rendering
 * @param {Object} backboneTrace - Data from extractBackboneTrace
 * @param {number} scale - Scale factor for coordinates
 * @returns {Object} Geometry for rendering
 */
function generateBackboneGeometry(backboneTrace, scale = 1.0) {
    const positions = [];
    const colors = [];

    // Colors for different chains
    const chainColors = [
        [0.2, 0.6, 1.0],  // Blue
        [1.0, 0.5, 0.0],  // Orange
        [0.0, 0.8, 0.3],  // Green
        [0.9, 0.2, 0.5],  // Pink
        [0.7, 0.7, 0.0],  // Yellow
        [0.5, 0.0, 0.8],  // Purple
    ];

    // Create color map for chains
    const chainColorMap = {};
    backboneTrace.chains.forEach((chainId, index) => {
        chainColorMap[chainId] = chainColors[index % chainColors.length];
    });

    // Generate line segments (APPLY SCALE HERE)
    for (const segment of backboneTrace.segments) {
        // Start point (scaled)
        positions.push(
            segment.start.x * scale,
            segment.start.y * scale,
            segment.start.z * scale
        );

        // End point (scaled)
        positions.push(
            segment.end.x * scale,
            segment.end.y * scale,
            segment.end.z * scale
        );

        // Color for this chain
        const color = chainColorMap[segment.chainId] || [0.8, 0.8, 0.8];
        colors.push(...color);
        colors.push(...color);
    }

    return {
        positions: positions,
        colors: colors
    };
}