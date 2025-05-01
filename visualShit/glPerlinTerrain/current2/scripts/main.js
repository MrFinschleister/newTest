let glcanvas = document.getElementById('glcanvas');
let gl;

let interval;
let tickRate = 16;
let dt = 1;

function onload() {
    try {
        canvasSetup();
        setListeners();
        setup();
        start();
    } catch (error) {
        alert(error.stack);
    }
}

function canvasSetup() {
    glcanvas.width = glcanvas.clientWidth;
    glcanvas.height = glcanvas.clientHeight;

    gl = glcanvas.getContext('webgl2');
}

function setListeners() {
    document.body.addEventListener('keydown', keydown);
    document.body.addEventListener('mousedown', mousedown);
    document.body.addEventListener('mousemove', mousemove);
    document.body.addEventListener('mouseup', mouseup);
}

function setup() {
    initTerrain(gl);
    initSky(gl);
}

function initTerrain(gl) {
    let frequency = 1.0;
    let roughness = 1.5;
    let amplitude = 20.0;
    let persistence = 0.8;
    let cellSize = 128;
    let octaves = 4;
    let contrast = 1;

    let perlin = new Perlin(Math.random());
    perlin.settings(frequency, roughness, amplitude, persistence, cellSize, octaves, contrast);

    let noiseMesh = new Float32Array(gridQuads * gridQuads);
    let normalMesh = new Float32Array(gridQuads * gridQuads * 3);

    let terrainPositions = [];
    let terrainColors = [];
    let terrainNormals = [];
    let terrainTextureCoords = [];
    let terrainMaterialIndices = [];

    for (let i = 0; i < gridQuads; i++) {
        for (let j = 0; j < gridQuads; j++) {
            let noiseIndex = i + j * gridQuads;
            let normalIndex = (i + j * gridQuads) * 3;

            let offset = 0.0001;

            let value1 = perlin.perlinLayered(i, j);
            let value2 = perlin.perlinLayered(i + offset, j);
            let value3 = perlin.perlinLayered(i, j + offset);

            let tangent_x = new Vector3(-offset, value1 - value2, 0.0).normalised();
            let tangent_z = new Vector3(0.0, value1 - value3, -offset).normalised();

            let norm = tangent_z.crossProd(tangent_x).normalised();
            
            let nX = norm.x;
            let nY = norm.y;
            let nZ = norm.z;

            noiseMesh[noiseIndex] = value1;
            normalMesh[normalIndex + 0] = nX;
            normalMesh[normalIndex + 1] = nY;
            normalMesh[normalIndex + 2] = nZ;
        }
    }

    let terrainMesh = createRectangleMeshY(gridQuads, gridWidth, gridDepth, gridOffsetX, gridOffsetY, gridOffsetZ);

    let startX = gridOffsetX - gridWidth / 2;
    let startZ = gridOffsetZ - gridDepth / 2;

    let stepX = gridWidth / gridQuads;
    let stepZ = gridDepth / gridQuads;

    for (let i = 0; i < terrainMesh.length; i += 3) {
        let x = terrainMesh[i];
        let y = terrainMesh[i + 1];
        let z = terrainMesh[i + 2];

        let x1 = (x - startX) / stepX;
        let y1 = 0;
        let z1 = (z - startZ) / stepZ;

        let index = x1 + z1 * gridQuads;
        
        let noise = noiseMesh[index];
        let nX = normalMesh[index * 3 + 0];
        let nY = normalMesh[index * 3 + 1];
        let nZ = normalMesh[index * 3 + 2];

        terrainPositions.push(x, y + noise, z);
        terrainColors.push(0.2, 0.7, 0.5, 1.0);
        terrainNormals.push(nX, nY, nZ);
        terrainMaterialIndices.push(1.0);
    }

    terrainAttributeObject = {
        locations: ["aVertexPosition", "aVertexColor", "aVertexNormal", "aVertexMaterialIndex"],
        "aVertexPosition": {
            buffer: terrainPositions,

            numComponents: 3, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        "aVertexColor": {
            buffer: terrainColors,

            numComponents: 4, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        "aVertexNormal": {
            buffer: terrainNormals,

            numComponents: 3,
            type: gl.FLOAT,
            normalize: false,
            stride: 0,
            offset: 0,
        },
        "aVertexMaterialIndex": {
            buffer: terrainMaterialIndices,

            numComponents: 1,
            type: gl.FLOAT,
            normalize: false,
            stride: 0,
            offset: 0,
        }
    }

    terrainAttributeObject.vertexCount = terrainMesh.length / 3;

    initBuffers(gl, terrainAttributeObject);
}

function initSky(gl) {
    let skyPositions = [];
    let skyColors = [];

    let skyMesh = getSkyCube();

    for (let i = 0; i < skyMesh.length; i += 3) {
        let x = skyMesh[i];
        let y = skyMesh[i + 1];
        let z = skyMesh[i + 2];

        skyPositions.push(x, y, z);
        skyColors.push(0.2, 0.4, 1.0, 1.0);
    }
    
    skyAttributeObject = {
        locations: ["aVertexPosition", "aVertexColor"],
        "aVertexPosition": {
            buffer: skyPositions,

            numComponents: 3, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        },
        "aVertexColor": {
            buffer: skyColors,

            numComponents: 4, 
            type: gl.FLOAT, 
            normalize: false, 
            stride: 0, 
            offset: 0,
        }
    }

    skyAttributeObject.vertexCount = skyMesh.length / 3;

    initBuffers(gl, skyAttributeObject);
}

function getSkySphere() {
    return createSphereMesh(sphereFaces, sphereRadius, 0, 0, 0);
}

function getSkyCube() {
    return createCubeMesh(sphereRadius * 2, sphereRadius * 2, sphereRadius * 2, 0, 0, 0);
}

function start() {
    interval = setInterval(function() {
        try {
            tick();
        } catch (error) {
            alert(error.stack); 
        }
    }, tickRate);
}

function tick() {
    update();
    render();
}

function update() {
    data1f.uSunTheta += data1f.uSunThetaSpeed * dt;
    data1f.uSunTheta %= Math.PI * 2;

    let sunTheta = data1f.uSunTheta;
    data3fv.uSunPosition = new Vector3(Math.cos(sunTheta), Math.sin(sunTheta), 0.0).scaled(data1f.uSkyDepth)

    data1f.uTick += dt;
    data1f.uTick %= data1f.uResetTime;

    data3fv.uSunPositionRotated = data3fv.uSunPosition.rotateRad(data3fv.uCameraRotations, Vector3.neutral());
}