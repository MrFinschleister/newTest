let terrainFrag = 

`precision highp float;

struct Material {
    float diffuseContrast;
    float diffuseExponent;
    float specularContrast;
    float specularExponent;

    vec4 color;
};

// CONSTS

// --- CONST INT
const int useNormalColoring = 0;
const int useRotatedNormal = 0;

// VARYINGS

varying vec4 vColor;
varying vec3 vPosition;
varying vec3 vModelViewPosition;
varying vec3 vNormal;
varying vec3 vRotatedNormal;
varying float vMaterialIndex;

// UNIFORMS

// --- UNIFORM MAT4
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uRotationMatrix;

// --- UNIFORM VEC4
uniform vec4 uSunColor;

// --- UNIFORM VEC3
uniform vec3 uSunPosition;
uniform vec3 uSunPositionRotated;
uniform vec3 uCameraPosition;

// --- UNIFORM FLOAT
uniform float uAmbientLight;

uniform float uSunDiffuseContrast; 
uniform float uSunDiffuseExponent;
uniform float uSunSpecularContrast;
uniform float uSunSpecularExponent;



// ACTUAL CODE

Material getMaterialProperties(float materialIndex) {
    if (materialIndex == 0.0) {
        return Material(0.0, 0.0, 0.0, 0.0, vec4(0.0));
    } else if (materialIndex == 1.0) {
        return Material(0.5, 5.0, 0.1, 2.0, vec4(1.0));
    } else if (materialIndex == 2.0) {
        return Material(10.0, 1.0, 1.0, 10.0, vec4(1.0, 1.0, 1.0, 1.0)); 
    }
}

float maxZero(float value) {
    return max(0.0, value);
}

float clampZeroOne(float value) {
    return clamp(value, 0.0, 1.0);
}

float adjustLightValue(float value, float contrast, float exponent) {
    return pow(value, exponent) * contrast;
}

float getSunDiffuse(vec3 position, vec3 negativePosition, vec3 normal, Material materialProperties) {
    vec3 toEye = normalize(negativePosition);
    vec3 toSun = normalize(uSunPosition + negativePosition);

    float diffuse = dot(normal, toSun);
    float diffuseVal = adjustLightValue(maxZero(diffuse), materialProperties.diffuseContrast, materialProperties.diffuseExponent);

    return diffuseVal;
}

float getSunSpecular(vec3 position, vec3 negativePosition, vec3 normal, Material materialProperties) {
    vec3 toEye = normalize(negativePosition);
    vec3 toSun = normalize(uSunPositionRotated + negativePosition);
    vec3 reflection = normalize(2.0 * dot(normal, toSun) * normal - toSun);
    
    float specular = dot(reflection, toEye);
    float specularVal = adjustLightValue(clampZeroOne(specular), materialProperties.specularContrast, materialProperties.specularExponent);

    return specularVal;
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 rotatedNormal = normalize(vRotatedNormal);

    if (useNormalColoring == 1) {
        if (useRotatedNormal == 1) {

            gl_FragColor = vec4(rotatedNormal, 1.0);

        } else {

            gl_FragColor = vec4(normal, 1.0);

        }
    } else {  
        Material materialProperties = getMaterialProperties(floor(vMaterialIndex));

        float diffuse = getSunDiffuse(vPosition, vPosition * -1.0, normal, materialProperties);
        float specular = getSunSpecular(vModelViewPosition, vModelViewPosition * -1.0, rotatedNormal, materialProperties);

        vec4 diffuseColor = materialProperties.color * diffuse * (1.0 - specular);
        vec4 specularColor = uSunColor * specular;
        vec4 ambientColor = materialProperties.color * uAmbientLight;
        vec4 color = diffuseColor + specularColor + ambientColor;

        gl_FragColor = vColor * color;

    }
}`