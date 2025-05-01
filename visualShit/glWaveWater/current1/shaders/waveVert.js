const waveVertexShader = `
    precision ${precision} float;

    attribute vec4 aVertexPosition;
    
    struct Wave {
        vec4 position;
        vec3 tangent;
        vec3 binormal;
    };

    const int numWaves = ${numWaves};

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    uniform float uTick;

    uniform float uFrequency;
    uniform float uFrequencyCoeff;
    uniform float uAmplitude;
    uniform float uAmplitudeCoeff;
    uniform float uSpeed;

    uniform float uDirections[numWaves];
    uniform float uDirections2[numWaves * 2];

    varying vec3 vPosition;
    varying vec3 vNormal;

    void main(void) {
        float x = aVertexPosition.x;
        float z = aVertexPosition.z;
            
        float timeSpeed = uTick * uSpeed;
        float w1 = uFrequency;
        float A1 = uAmplitude;

        float waveVal = 0.0;
        float dX = 0.0;
        float dZ = 0.0;

        for (int i = 0; i < numWaves; i++) {
            int index = i * 2;

            float dir1 = uDirections2[index];
            float dir2 = uDirections2[index + 1];

            float posDirDot = x * dir1 + z * dir2;
            float comp = posDirDot * w1 + timeSpeed;

            float cosVal = cos(comp);
            float expVal = A1 * exp(sin(comp) - 1.0);

            waveVal += expVal;

            dX += w1 * dir1 * expVal * cosVal;
            dZ += w1 * dir2 * expVal * cosVal;

            w1 *= uFrequencyCoeff;
            A1 *= uAmplitudeCoeff;
        }

        vec4 newPosition = aVertexPosition.xyzw;
        newPosition.y += waveVal;

        vec3 tangent = vec3(1.0, dX, 0.0);
        vec3 binormal = vec3(0.0, dZ, 1.0);
        
        vec3 normal = cross(tangent, binormal);

        vPosition = newPosition.xyz;
        vNormal = normal;
        
        gl_Position = uProjectionMatrix * uModelViewMatrix * newPosition;
    }
`;