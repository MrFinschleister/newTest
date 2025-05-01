const waveFragmentShader = `
    precision ${precision} float;

    varying vec3 vPosition;
    varying vec3 vNormal;

    uniform vec4 uWaveColor;
    uniform vec4 uSunColor;
    uniform vec4 uMoonColor;

    uniform vec3 uSunPosition;
    uniform vec3 uMoonPosition;

    uniform float uSunDiffuseContrast;
    uniform float uSunDiffuseExponent;
    uniform float uSunSpecularContrast;
    uniform float uSunSpecularExponent;

    uniform float uMoonDiffuseContrast;
    uniform float uMoonDiffuseExponent;
    uniform float uMoonSpecularContrast;
    uniform float uMoonSpecularExponent;

    float constrainLight(float val) {
        return max(0.0, val);
    }

    float adjustValue(float value, float contrast, float exponent) {
        return pow(value, exponent) * contrast;
    }

    vec4 getColorFromLight(vec3 position, vec3 normal, vec4 color, vec3 lightPosition, vec4 lightColor, float lightDiffuseContrast, float lightDiffuseExponent, float lightSpecularContrast, float lightSpecularExponent) {
        vec3 toEye = normalize(position * -1.0);
        vec3 toLight = normalize(lightPosition - position);
        vec3 halfVec = normalize(toEye + toLight);
        vec3 reflectionVec = normalize(2.0 * dot(normal, toLight) * normal - toLight);
        
        float diffuse = dot(normal, -1.0 * toLight);
        float diffuseVal = adjustValue(constrainLight(diffuse), lightDiffuseContrast, lightDiffuseExponent);

        float specular = dot(toEye, reflectionVec);
        float specularVal = adjustValue(constrainLight(specular), lightSpecularContrast, lightSpecularExponent);

        vec4 diffuseColor = diffuseVal * color;
        vec4 specularColor = specularVal * lightColor;

        vec4 totalColor = diffuseColor + specularColor;

        return totalColor;
    }

    void main(void) {
        vec3 normal = normalize(vNormal);

        vec4 colorFromSun = getColorFromLight(vPosition, normal, uWaveColor, uSunPosition, uSunColor, uSunDiffuseContrast, uSunDiffuseExponent, uSunSpecularContrast, uSunSpecularExponent);
        vec4 colorFromMoon = getColorFromLight(vPosition, normal, uWaveColor, uMoonPosition, uMoonColor, uMoonDiffuseContrast, uMoonDiffuseExponent, uMoonSpecularContrast, uMoonSpecularExponent);

        gl_FragColor = colorFromSun + colorFromMoon;
    }
`;