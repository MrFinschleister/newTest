let skyDepth = 1000;

let sphereFaces = 625;
let sphereRadius = skyDepth;

let gridQuads = 64;
let gridWidth = 250;
let gridHeight = 250;
let gridDepth = 250;
let gridOffsetX = 0;
let gridOffsetY = -20;
let gridOffsetZ = gridDepth / -2;

let terrainAttributeObject;
let skyAttributeObject;

let data1f = {
    uTick: 0,
    uTimeOfDay: 0,
    uTimePerDay: 1000,
    uResetTime: 100000,
    uFov: Math.PI / 2,
    uSkyDepth: skyDepth,

    uAmbientLight: 0.25,
 
    // sun general
    uSunTheta: 0.0,
    uSunThetaSpeed: 0.01,

    // sun lighting
    uSunDiffuseContrast: 0.5,
    uSunDiffuseExponent: 5.0,
    uSunSpecularContrast: 0.5,
    uSunSpecularExponent: 2.0,

    // sun sky
    uSunBodyRadius: 50.0,
    uSunBodyContrast: 1.0,
    uSunBodyExponent: 1.0,
    uSunAtmosphereRadius: 60.0,
    uSunAtmosphereContrast: 1.0,
    uSunAtmosphereExponent: 1.0,
};

let data3fv = {
    uCameraPosition: new Vector3(0.0, 0.0, -50.0),
    uCameraRotations: new Vector3(0.0, 0.0, 0.0),

    uSunPosition: new Vector3(0.0, 0.0, skyDepth),
};

let data4fv = {
    uSunColor: new Vector4(0.9, 0.9, 0.3, 1.0),
};