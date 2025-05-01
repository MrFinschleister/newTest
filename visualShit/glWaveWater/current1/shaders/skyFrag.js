const skyFragmentShader = `
    precision ${precision} float;

    struct LightSource {
        vec3 position;
        vec4 color;
        float distance;

        float bodyRadius;
        float bodyContrast;
        float bodyExponent;

        float atmosphereRadius;
        float atmosphereContrast;
        float atmosphereExponent;

        float intensity;
    };

    varying vec3 vPosition;

    uniform sampler2D skyTexture;

    uniform float uSkyDepth;
    uniform float uTick;
    uniform float uTimeOfDay;
    uniform float uTimePerDay;
    uniform float uSeed;
    uniform float uUpdateBodies;

    uniform vec4 uSunColor;
    uniform vec4 uMoonColor;
    uniform vec4 uSkyColorDark;
    uniform vec4 uSkyColorLight;
    uniform vec4 uCloudColor;

    uniform vec3 uSunPosition;
    uniform vec3 uMoonPosition;
    uniform vec3 uCameraPosition;
    uniform vec3 uResolution;

    uniform float uSunDistance;
    uniform float uSunBodyRadius;
    uniform float uSunBodyContrast;
    uniform float uSunBodyExponent;
    uniform float uSunAtmosphereRadius;
    uniform float uSunAtmosphereContrast;
    uniform float uSunAtmosphereExponent;
    uniform float uSunIntensity;

    uniform float uMoonDistance;
    uniform float uMoonBodyRadius;
    uniform float uMoonBodyContrast;
    uniform float uMoonBodyExponent;
    uniform float uMoonAtmosphereRadius;
    uniform float uMoonAtmosphereContrast;
    uniform float uMoonAtmosphereExponent;
    uniform float uMoonIntensity;

    uniform float uCloudContrast;
    uniform float uCloudExponent;
    uniform float uCloudSpeed;
    uniform float uCloudBias;
    uniform float uCloudFrequency;
    uniform float uCloudFrequencyCoeff;
    uniform float uCloudAmplitude;
    uniform float uCloudAmplitudeCoeff;

    uniform float uSunsetBias;
    
    float constrainLight(float val) {
        return max(0.0, val);
    }

    float adjustValue(float value, float contrast, float exponent) {
        return pow(value, exponent) * contrast;
    }

    float noise(vec2 pq) {
        highp float a = 12.9898;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt = dot(pq.xy, vec2(a, b));
        highp float sn = mod(dt,3.14 * uSeed);
        return fract(sin(sn) * c);
    }

    float noiseSmooth(vec2 pq) {
        vec2 index = floor(pq);
        vec2 interpVec = smoothstep(0.0, 1.0, fract(pq));

        float tL = noise(index + vec2(0.0, 0.0));
        float tR = noise(index + vec2(1.0, 0.0));
        float top = mix(tL, tR, interpVec.x);

        float bL = noise(index + vec2(0.0, 1.0));
        float bR = noise(index + vec2(1.0, 1.0));
        float bottom = mix(bL, bR, interpVec.x);

        return mix(top, bottom, interpVec.y);
    }

    float layeredNoiseSmooth(vec2 pq, float frequency, float frequencyCoeff, float amplitude, float amplitudeCoeff) {
        float value = 0.0;

        float currAmplitude = amplitude;
        float currFrequency = frequency;

        for (float i = 0.0; i < 5.0; i++) {
            value += noiseSmooth(pq * currFrequency) * currAmplitude;
            currAmplitude *= amplitudeCoeff;
            currFrequency *= frequencyCoeff;
        }

        return value;
    }

    float getCloudValue(vec2 uv, float directionDot, float cloudContrast, float cloudExponent, float cloudBias, float cloudSpeed, float time, float cloudFrequency, float cloudFrequencyCoeff, float cloudAmplitude, float cloudAmplitudeCoeff) {
        vec2 uv1 = vec2(uv.x + time * cloudSpeed, uv.y);
        
        float cloud = layeredNoiseSmooth(uv1, cloudFrequency, cloudFrequencyCoeff, cloudAmplitude, cloudAmplitudeCoeff);
        float cloudVal = constrainLight(adjustValue(cloud * directionDot - cloudBias, cloudContrast, cloudExponent));

        return cloudVal;
    }

    vec4 getLightSourceColor(vec3 direction, LightSource light, vec4 skyColorDark, vec4 skyColorLight, vec4 cloudColor, float fragDirectionDot, float cloudValue, float sunsetBias) {
        vec3 fragPosition = direction * light.distance;
        vec3 lightPosition = light.position;
        vec3 lightDirection = normalize(lightPosition);

        vec3 toCamera = fragPosition * -1.0;
        vec3 toLight = lightPosition - fragPosition;
        float distance = length(toLight);

        vec3 normalizedToCamera = normalize(toCamera);
        vec3 normalizedToLight = normalize(toLight);
        
        float lightCameraSimilarity = dot(normalizedToCamera, normalizedToLight);

        float lightDirectionDot = dot(lightDirection, vec3(0.0, 1.0, 0.0));
        float totalDot = lightDirectionDot + fragDirectionDot;
        
        vec4 skyColor = mix(skyColorDark, skyColorLight, constrainLight(totalDot));
        
        vec4 bodyColor = vec4(0.0);
        vec4 atmosphereColor = vec4(0.0);

        if (distance < light.bodyRadius) {
            float opacity = 1.0 - light.bodyRadius / distance;
            float value = adjustValue(opacity, light.bodyContrast, light.bodyExponent);

            bodyColor = light.color * value;
        }

        if (distance < light.atmosphereRadius) {
            float opacity = 1.0 - light.atmosphereRadius / distance;
            float value = adjustValue(opacity, light.atmosphereContrast, light.atmosphereExponent);

            atmosphereColor = light.color * value;  
        }

        skyColor *= light.intensity;

        if (cloudValue > 0.0) {
            skyColor = mix(skyColor, cloudColor, cloudValue);
        }

        vec4 lightColor = bodyColor + atmosphereColor;
        vec4 totalColor = skyColor + lightColor;

        return totalColor;
    }

    void main(void) {
        float percentOfDay = mod(uTimeOfDay / uTimePerDay, 1.0);

        vec2 uv = gl_FragCoord.xy / uResolution.xy;

        vec3 direction = normalize(vPosition);
        float directionDot = dot(direction, vec3(0.0, 1.0, 0.0));

        vec4 colorFromTexture = texture2D(skyTexture, uv) * percentOfDay;

        LightSource sun = LightSource(uSunPosition, uSunColor, uSunDistance, uSunBodyRadius, uSunBodyContrast, uSunBodyExponent, uSunAtmosphereRadius, uSunAtmosphereContrast, uSunAtmosphereExponent, uSunIntensity);
        LightSource moon = LightSource(uMoonPosition, uMoonColor, uMoonDistance, uMoonBodyRadius, uMoonBodyContrast, uMoonBodyExponent, uMoonAtmosphereRadius, uMoonAtmosphereContrast, uMoonAtmosphereExponent, uMoonIntensity);

        float cloudValue = getCloudValue(uv, directionDot, uCloudContrast, uCloudExponent, uCloudBias, uCloudSpeed, uTick, uCloudFrequency, uCloudFrequencyCoeff, uCloudAmplitude, uCloudAmplitudeCoeff);
        vec4 cloudColor = cloudValue * uCloudColor;

        vec4 sunColor = getLightSourceColor(direction, sun, uSkyColorDark, uSkyColorLight, cloudColor, directionDot, cloudValue, uSunsetBias);
        vec4 moonColor = getLightSourceColor(direction, moon, uSkyColorDark, uSkyColorLight, cloudColor, directionDot, cloudValue, uSunsetBias);

        vec4 color = sunColor + moonColor;

        float textureTransparency = colorFromTexture.w;

        if (textureTransparency > 0.0) {
            color += colorFromTexture;
        }

        gl_FragColor = color;
    }
`;