let terrainVert = 

`precision highp float;

// ATTRIBUTES
attribute vec4 aVertexPosition;
attribute vec4 aVertexColor;
attribute vec3 aVertexNormal;
attribute float aVertexMaterialIndex;

// UNIFORMS

// --- UNIFORM MAT4
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uRotationMatrix;

// --- UNIFORM VEC3
uniform vec3 uSunPosition;

// VARYINGS
varying vec4 vColor;
varying vec3 vPosition;
varying vec3 vModelViewPosition;
varying vec3 vNormal;
varying vec3 vRotatedNormal;
varying float vMaterialIndex;

void main() {
    vec4 modelViewPosition = uModelViewMatrix * aVertexPosition;

    vColor = aVertexColor;
    vPosition = aVertexPosition.xyz;
    vModelViewPosition = modelViewPosition.xyz;
    vNormal = aVertexNormal;
    vRotatedNormal = (uRotationMatrix * vec4(aVertexNormal, 1.0)).xyz;
    vMaterialIndex = aVertexMaterialIndex;

    gl_Position = uProjectionMatrix * modelViewPosition;
}`