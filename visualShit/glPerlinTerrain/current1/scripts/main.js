let canvas = document.getElementById('glcanvas');;
let gl;

let loop;
let tickRate = 16;
let dt = 1;

let precision = "highp";
let skyDepth = 1000;

let sphereRadius = skyDepth;
let sphereFaces = 625;
let gridQuads = 200;
let gridWidth = 500;
let gridHeight = 250;
let gridDepth = 500;
let gridOffsetX = 0;
let gridOffsetY = -20;
let gridOffsetZ = gridDepth / -2;

let terrainPositions = [];
let terrainColors = [];
let terrainTextureCoords = [];
let terrainNormals = [];

let skyPositions = [];
let skyColors = [];
let skyTextureCoords = [];
let skyNormals = [];

let starTextureArray;
let noiseTextureArray;

let updateBodies = true;

let terrainBuffers;
let skyBuffers;

let timePerDay = 5760;

let data = {
    // general
    uTick: 0.0,
    uTimeOfDay: timePerDay / 1.3,
    uTimePerDay: timePerDay,
    uUpdateBodies: 1.0,
    uResetTime: 100000,
    uSkyDepth: skyDepth,
    uNumStars: 350,
    uSeed: Math.random(),

    // terrains

    uFrequency: 0.25,
    uFrequencyCoeff: 1.16,
    uAmplitude: 0.5,
    uAmplitudeCoeff: 0.84,
    uSpeed: 0.05,

    uAmbientLight: 0.2,
    
    // sun
        // terrain properties
        uSunDiffuseContrast: 8,
        uSunDiffuseExponent: 1,
        uSunSpecularContrast: 0,
        uSunSpecularExponent: 10,

        // sky properties
        uSunDistance: skyDepth,
        uSunTheta: Math.PI * 1.6,
        uSunThetaSpeed: Math.PI * 2 / timePerDay,

        uSunBodyRadius: 20,
        uSunBodyContrast: 1,
        uSunBodyExponent: 5,
        uSunAtmosphereRadius: 40,
        uSunAtmosphereContrast: 0.4,
        uSunAtmosphereExponent: 2,
        uSunIntensity: 1.5,

    // moon
        // terrain properties
        uMoonDiffuseContrast: 0,
        uMoonDiffuseExponent: 1,
        uMoonSpecularContrast: 0,
        uMoonSpecularExponent: 2,

        // skyProperties
        uMoonDistance: skyDepth,
        uMoonTheta: Math.PI * 0.4,
        uMoonThetaSpeed: Math.PI * 2 / timePerDay,

        uMoonBodyRadius: 15,
        uMoonBodyContrast: 1,
        uMoonBodyExponent: 5,
        uMoonAtmosphereRadius: 30,
        uMoonAtmosphereContrast: 0.5,
        uMoonAtmosphereExponent: 2,
        uMoonIntensity: 0.2,

    // sky
    uSunsetBias: 0,

    // clouds
    uCloudContrast: .0,
    uCloudExponent: 1,
    uCloudSpeed: 0.0001,
    uCloudBias: 0.0,
    uCloudFrequency: 3.0,
    uCloudFrequencyCoeff: 2.0,
    uCloudAmplitude: 0.7,
    uCloudAmplitudeCoeff: 0.5,
};

let data3fv = {
    uSunPosition: new Vector3(0, 0, 0),
    uMoonPosition: new Vector3(0, 0, 0),
    uCameraPosition: new Vector3(0, 0, 0),
    uResolution: new Vector3(canvas.clientWidth, canvas.clientHeight, data.uSkyDepth),
    uStarTextureResolution: new Vector3(1024, 512, 1),
    uCameraPosition: new Vector3(0.0, -10.0, 0.0),
    uCameraRotations: new Vector3(0.0, 0.0, 0.0),
};

let data4fv = {
    uSunColor: new Vector4(0.9, 0.9, 0.3, 1.0),
    uMoonColor: new Vector4(0.75, 0.75, 0.75, 1.0),
    uSkyColorDark: new Vector4(0, 0, 0.1, 1.0),
    uSkyColorLight: new Vector4(0.2, 0.4, 1.0, 1.0),
    uCloudColor: new Vector4(1.0, 1.0, 1.0, 1.0),
    uStarColor: new Vector4(1.0, 1.0, 1.0, 1.0),
};

function onload() {
    try {
        setup();
        startLoop();
    } catch (error) {
        alert(error.stack);
    }
}

function setup() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    gl = canvas.getContext('webgl');

    if (gl === null) {
        throw new Error("Unable to initialize WebGL. Your browser or machine may not support it.");
    }

    setListeners();
    initTerrainArrays();
    initSkyArrays();
    initStarTextureArray(data3fv.uStarTextureResolution.x, data3fv.uStarTextureResolution.y, data.uNumStars);

    terrainBuffers = initBuffers(gl, terrainPositions, terrainColors, terrainTextureCoords, terrainNormals);
    skyBuffers = initBuffers(gl, skyPositions, skyColors, skyTextureCoords, skyNormals);
    loadTexture(gl, data3fv.uStarTextureResolution.x, data3fv.uStarTextureResolution.y, starTextureArray);
}

function initTerrainArrays() {
    let frequency = 1.0;
    let roughness = 3.0;
    let amplitude = 5.0;
    let persistence = 0.8;
    let cellSize = 128;
    let octaves = 4;
    let contrast = 1;

    let perlin = new Perlin(Math.random());
    perlin.settings(frequency, roughness, amplitude, persistence, cellSize, octaves, contrast)

    let noiseMesh = new Float32Array(gridQuads * gridQuads);

    for (let i = 0; i < gridQuads; i++) {
        for (let j = 0; j < gridQuads; j++) {
            let index = i + j * gridQuads;

            noiseMesh[index] = perlin.perlinLayered(i, j);
        }
    }

    let terrainMesh = createRectangleMeshY(gridQuads, gridWidth, gridDepth, gridOffsetX, gridOffsetY, gridOffsetZ);

    for (let i = 0; i < terrainMesh.length; i += 3) {
        let x = terrainMesh[i];
        let y = terrainMesh[i + 1];
        let z = terrainMesh[i + 2];

        let x1 = (x - gridOffsetX + gridWidth / 2) / gridWidth * gridQuads;
        let y1 = y;
        let z1 = (z - gridOffsetZ + gridDepth / 2) / gridDepth * gridQuads;

        let index = Math.floor(x1) + Math.floor(z1) * gridQuads;

        let perlinVal = noiseMesh[index];

        terrainPositions.push(x, y + perlinVal, z);
        terrainColors.push(0.2, 0.7, 0.5, 1.0);
        terrainTextureCoords.push(Math.floor(x1), Math.floor(z1));
        
        let perlinVal2 = noiseMesh[index + 1];
        let perlinVal3 = noiseMesh[index + gridQuads];
        let normalVector = new Vector3(1.0, y + perlinVal2, 0.05).crossProd(new Vector3(0.0, y + perlinVal3, 1.0));

        terrainNormals.push(normalVector.x, normalVector.y, normalVector.z);
    }

    data.terrainCount = terrainMesh.length / 3;
}

function initSkyArrays() {
    let skyMesh = createSphereMesh(sphereFaces, sphereRadius, 0, 0, 0);

    for (let i = 0; i < skyMesh.length; i += 3) {
        skyPositions.push(skyMesh[i], skyMesh[i + 1], skyMesh[i + 2]);
        skyColors.push();
    }

    data.skyCount = skyMesh.length / 3;
}

function initStarTextureArray(width, height, numStars) {
    starTextureArray = new Uint8Array(width * height * 4);

    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            let index = (i + j * width) * 4;

            starTextureArray[index + 0] = 0;
            starTextureArray[index + 1] = 0;
            starTextureArray[index + 2] = 0;
            starTextureArray[index + 3] = 255;
        }
    }

    let starColor = data4fv.uStarColor;

    for (let i = 0; i < numStars; i++) {
        let x = Math.floor(Math.random() * width);
        let y = Math.floor(Math.random() * height);

        let index = (x + y * width) * 4;

        starTextureArray[index + 0] = starColor.x * 255;
        starTextureArray[index + 1] = starColor.y * 255;
        starTextureArray[index + 2] = starColor.z * 255;
        starTextureArray[index + 3] = starColor.w * 255;
    }
}

function startLoop() {
    loop = setInterval(function() {
        try {
            update(dt);
            draw(gl);

            data.t += dt;
        } catch (error) {
            alert(error.stack);
        }
    }, tickRate);
}

function update(dt) {
    if (data.uUpdateBodies == 1.0) {
        data.uSunTheta = ((data.uTimeOfDay / data.uTimePerDay) % 1) * Math.PI * 2;
        data.uMoonTheta = data.uSunTheta + Math.PI;

        let sunTheta = data.uSunTheta;
        data3fv.uSunPosition = new Vector3(0.0, Math.cos(sunTheta), Math.sin(sunTheta)).scaled(data.uSunDistance);

        let moonTheta = data.uMoonTheta;
        data3fv.uMoonPosition = new Vector3(0.0, Math.cos(moonTheta), Math.sin(moonTheta)).scaled(data.uMoonDistance);

        //data.uSunTheta += data.uSunThetaSpeed * dt;
        data.uSunTheta %= Math.PI * 2;

        //data.uMoonTheta += data.uMoonThetaSpeed * dt;
        data.uMoonTheta %= Math.PI * 2;

        data.uTimeOfDay += dt;
        data.uTimeOfDay %= data.uResetTime;
    }

    data.uTick += dt;
    data.uTick %= data.uResetTime;
}

function setListeners() {
    document.body.addEventListener('mousedown', (e) => {dt *= 10 * (e.ctrlKey ? -1 : 1); 
        glcanvas.requestPointerLock();
    });
    document.body.addEventListener('mousemove', (e) => {
        let totalRotation = Math.PI * 2;
        let locX = e.movementX;
        let locY = e.movementY;
        let ratioX = locX / document.body.clientWidth;
        let ratioY = locY / document.body.clientHeight;

        data3fv.uCameraRotations.x += (ratioY * totalRotation);
        data3fv.uCameraRotations.y += (ratioX * totalRotation);
    });

    document.body.addEventListener('mouseup', (e) => {dt /= 10 * (dt < 0 ? -1 : 1)});
    document.body.addEventListener('keydown', (e) => {
        let code = e.code;

        let rotations = data3fv.uCameraRotations;
        let usedRotations = new Vector3(0.0, rotations.y, 0.0);

        let directionX = new Vector3(10.0, 0.0, 0.0).rotateRad(usedRotations, Vector3.neutral());
        let directionY = new Vector3(0.0, 10.0, 0.0);
        let directionZ = new Vector3(0.0, 0.0, 10.0).rotateRad(usedRotations, Vector3.neutral());

        
        if (code == "Space") {
            if (dt == 0.0) {
                dt = 1.0;
            } else {
                dt = 0.0;
            }
        } else if (code == "Backspace") {
            if (data.uUpdateBodies == 1.0) {
                data.uUpdateBodies = 0.0;
            } else {
                data.uUpdateBodies = 1.0;
            }
        } else if (code == "KeyW") {
            data3fv.uCameraPosition.add(directionZ);
        } else if (code == "KeyS") {
            data3fv.uCameraPosition.subtract(directionZ);
        } else if (code == "KeyA") {
            data3fv.uCameraPosition.add(directionX);
        } else if (code == "KeyD") {
            data3fv.uCameraPosition.subtract(directionX);
        } else if (code == "KeyI") {
            data3fv.uCameraPosition.subtract(directionY);
        } else if (e.code == "KeyK") {
            data3fv.uCameraPosition.add(directionY);
        }
    });
}