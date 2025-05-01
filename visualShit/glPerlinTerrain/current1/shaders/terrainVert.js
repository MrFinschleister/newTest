const terrainVertexShader = `
    precision ${precision} float;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    uniform sampler2D skyTexture;
    
    uniform vec3 uCameraPosition;

    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;

    varying vec4 vColor;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main(void) {
        vColor = aVertexColor;
        vPosition = (aVertexPosition).xyz;
        vNormal = aVertexNormal;

        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;