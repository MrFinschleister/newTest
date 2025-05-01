const terrainFragmentShader = `
    precision ${precision} float;

    uniform vec3 uSunPosition;
    uniform vec3 uMoonPosition;
    uniform vec3 uCameraPosition;

    varying vec4 vColor;
    varying vec3 vPosition;
    varying vec3 vNormal;

    float maxZero(float value) {
        return max(0.0, value);
    }

    void main(void) {
        vec3 normal = normalize(vNormal);

        vec3 toEye = normalize(vPosition * -1.0);
        vec3 toSun = normalize(uSunPosition - vPosition);

        float diffuse = maxZero(dot(normal, toSun));

        gl_FragColor = vColor * diffuse;
    }
`;