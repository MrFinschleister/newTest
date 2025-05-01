const skyVertexShader = `
    precision ${precision} float;

    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying vec3 vPosition;

    void main(void) {
        vPosition = aVertexPosition.xyz;
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;