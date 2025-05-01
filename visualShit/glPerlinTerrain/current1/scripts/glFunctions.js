function setUniforms(gl, shaderProgram, projectionMatrix, modelViewMatrix) {
    let projectionMatrixLocation = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

    let modelViewMatrixLocation = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix');
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

    Object.keys(data).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform1f(uniformLocation, data[key]);
    });

    Object.keys(data3fv).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform3fv(uniformLocation, data3fv[key].array());
    });

    Object.keys(data4fv).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform4fv(uniformLocation, data4fv[key].array());
    });
}

function constructFullShaderProgram(gl, vs, fs) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
            shaderProgram
        )}`
        );
        return null;
    }

    const programInfo = {
        program: shaderProgram,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,

        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexColor: gl.getAttribLocation(shaderProgram, "aVertexColor"),
            vertexTextureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
            vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
        },
    };

    return programInfo;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error occurred compiling the ${type} shader: ${gl.getShaderInfoLog(shader)}`);gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function loadRGBATexture(gl, width, height, textureArray) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    loadTexture(gl, level, internalFormat, width, height, border, srcFormat, srcType, textureArray);
}

function loadInt8Texture(gl, width, height, textureArray) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.R8;
    const border = 0;
    const srcFormat = gl.RED;
    const srcType = gl.UNSIGNED_BYTE;

    loadTexture(gl, level, internalFormat, width, height, border, srcFormat, srcType, textureArray);
}

function loadTexture(gl, level, internalFormat, width, height, border, srcFormat, srcType, textureArray) {
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, textureArray);
}

function finaliseProgram(programInfo, buffers, projectionMatrix, modelViewMatrix) {
    if (buffers.position) {
        setVertexAttribute(gl, buffers.position, programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
    }

    if (buffers.color) {
        setVertexAttribute(gl, buffers.color, programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
    }

    if (buffers.textureCoord) {
        setVertexAttribute(gl, buffers.textureCoord, programInfo.attribLocations.vertexTextureCoord, 2, gl.FLOAT, false, 0, 0);
    }

    if (buffers.normal) {
        setVertexAttribute(gl, buffers.normal, programInfo.attribLocations.vertexNormal, 3, gl.FLOAT, false, 0, 0);
    }

    gl.useProgram(programInfo.program);

    setUniforms(gl, programInfo.program, projectionMatrix, modelViewMatrix);
}

function initBuffers(gl, positions, colors, textureCoords, normals) {
    let buffers = {};

    if (positions) {
        buffers.position = createBuffer(gl, new Float32Array(positions));
        buffers.vertexCount = positions.length / 3;
    }

    if (colors) {
        buffers.color = createBuffer(gl, new Float32Array(colors));
    }

    if (textureCoords) {
        buffers.textureCoord = createBuffer(gl, new Float32Array(textureCoords));
    }

    if (normals) {
        buffers.normal = createBuffer(gl, new Float32Array(normals));
    }

    return buffers;
}

function createBuffer(gl, bufferContent) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferContent, gl.STATIC_DRAW);

    return buffer;
}

function setVertexAttribute(gl, buffer, location, numComponents, type, normalize, stride, offset) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(location, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(location);
}

function deleteShaderProgram(gl, programInfo) {
    let program = programInfo.program;
    let vertexShader = programInfo.vertexShader;
    let fragmentShader = programInfo.fragmentShader;

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
}

function deleteBuffers(gl, buffers) {
    gl.deleteBuffer(buffers.position);
    gl.deleteBuffer(buffers.color);
    gl.deleteBuffer(buffers.textureCoord);
}