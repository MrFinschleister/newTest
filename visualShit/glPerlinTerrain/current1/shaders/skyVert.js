const skyVertexShader = `
    precision ${precision} float;

    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    uniform vec3 uCameraPosition;

    varying vec3 vPosition;

    void main(void) {
        vPosition = aVertexPosition.xyz;

        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;