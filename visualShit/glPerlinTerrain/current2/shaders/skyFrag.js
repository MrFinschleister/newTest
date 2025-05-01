let skyFrag =

`precision highp float;

varying vec4 vColor;
varying vec3 vPosition;

uniform vec4 uSunColor;

uniform vec3 uSunPosition;

uniform float uSkyDepth;

uniform float uSunBodyRadius;
uniform float uSunBodyContrast;
uniform float uSunBodyExponent;
uniform float uSunAtmosphereRadius;
uniform float uSunAtmosphereContrast;
uniform float uSunAtmosphereExponent;

float adjustLightValue(float value, float contrast, float exponent) {
    return pow(value, exponent) * contrast;
}

vec4 getSunColor(vec3 spherePosition) {
    vec3 distanceVec = uSunPosition - spherePosition;
    float distance = length(distanceVec);

    vec4 color = vec4(0.0);

    if (distance < uSunBodyRadius) {
        float value = 1.0 - distance / uSunBodyRadius;

        color += uSunColor * adjustLightValue(value, uSunBodyContrast, uSunBodyExponent);
    }

    if (distance < uSunAtmosphereRadius) {
        float value = 1.0 - distance / uSunAtmosphereRadius;

        color += uSunColor * adjustLightValue(value, uSunAtmosphereContrast, uSunAtmosphereExponent);
    }

    return color;
}

void main() {
    vec3 spherePosition = normalize(vPosition) * uSkyDepth;

    vec4 sunColor = getSunColor(spherePosition);

    gl_FragColor = sunColor + vColor;
}`