function getShaderProgram(gl, vs, fs, attributeObject) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vs);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fs);
    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }

    let locations = attributeObject.locations;

    let attribLocations = {};

    for (let i = 0; i < locations.length; i++) {
        let currAttribLocationName = locations[i];
        let currAttribLocation = gl.getAttribLocation(shaderProgram, currAttribLocationName);

        attribLocations[currAttribLocationName] = currAttribLocation;
    }

    const programInfo = {
        program: shaderProgram,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        attribLocations: attribLocations,
    };

    return programInfo;
}

function setVertexAttribute(gl, buffer, location, numComponents, type, normalize, stride, offset) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(location, numComponents, type, normalize, stride, offset);
    gl.enableVertexAttribArray(location);
}

function initBuffers(gl, attributeObject) {
    let locations = attributeObject.locations;

    for (let i = 0; i < locations.length; i++) {
        let currAttribLocationName = locations[i];
        let currBuffer = attributeObject[currAttribLocationName].buffer;

        let newBuffer = createBuffer(gl, new Float32Array(currBuffer));
        attributeObject[currAttribLocationName].bufferInstiantiated = newBuffer;
    }
}

function createBuffer(gl, bufferContent) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, bufferContent, gl.STATIC_DRAW);

    return buffer;
}

function finaliseProgram(programInfo, attributeObject) {
    let locations = attributeObject.locations;

    let attribLocations = programInfo.attribLocations;

    for (let i = 0; i < locations.length; i++) {
        let currAttribLocationName = locations[i];
        let currAttribLocation = attribLocations[currAttribLocationName];
        let currBuffer = attributeObject[currAttribLocationName].bufferInstiantiated;
        let currBufferData = attributeObject[currAttribLocationName];

        setVertexAttribute(gl, currBuffer, currAttribLocation, currBufferData.numComponents, currBufferData.type, currBufferData.normalize, currBufferData.stride, currBufferData.offset);
    }

    gl.useProgram(programInfo.program);
}

function setUniforms(gl, programInfo, data1f, data3fv, data4fv, dataMat4) {
    let shaderProgram = programInfo.program;

    Object.keys(data1f).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform1f(uniformLocation, data1f[key]);
    });

    Object.keys(data3fv).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform3fv(uniformLocation, data3fv[key].array());
    });

    Object.keys(data4fv).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniform4fv(uniformLocation, data4fv[key].array());
    });

    Object.keys(dataMat4).forEach((key) => {
        const uniformLocation = gl.getUniformLocation(shaderProgram, key);
        gl.uniformMatrix4fv(uniformLocation, false, dataMat4[key]);
    });
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

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error occurred compiling the ${type} shader: ${gl.getShaderInfoLog(shader)}`);
        return null;
    }

    return shader;
}

function loadRGBATexture(gl, width, height, textureArray) {
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    loadTexture(gl, level, internalFormat, width, height, border, srcFormat, srcType, textureArray);
}

function loadRGBTexture(gl, width, height, textureArray) {
    const level = 0;
    const internalFormat = gl.RGB;
    const border = 0;
    const srcFormat = gl.RGB;
    const srcType = gl.UNSIGNED_BYTE;

    loadTexture(gl, level, internalFormat, width, height, border, srcFormat, srcType, textureArray);
}

function loadR8Texture(gl, width, height, textureArray) {
    const level = 0;
    const internalFormat = gl.R8;
    const border = 0;
    const srcFormat = gl.RED;
    const srcType = gl.UNSIGNED_BYTE;

    loadTexture(gl, level, internalFormat, width, height, border, srcFormat, srcType, textureArray);
}

function loadTexture(gl, level, internalFormat, width, height, border, srcFormat, srcType, textureArray) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, textureArray);

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

// at the start of the program, do the following:
// --- make sure to link template literal strings (using `` ticks) for the vertex and fragment shaders
// --- create these three things: 
// --- --- array a vertex attribute location STRING NAMES (attribLocationsArray)
// --- --- create an object of buffer CONTENT, with the keys corresponding to the vertex attribute locations EXACTLY (buffersObject)
// --- --- create an object of buffer DATA, for things like numComponents, type, stride, etc, with the keys acting the same as the buffers object (buffersDataObject)
// --- instiantiate buffers with initBuffers(glContext, attribLocationsArray, buffersObject) (returns instiantiatedBuffersObject)
// per iteration, do the following:
// --- create a shader program with getShaderProgram(glContext, vsString, fsString, attribLocationsArray) (returns programInfo)
// --- finalise this program with finaliseProgram(programInfo, attribLocationsArray, instiantiatedBuffersObject, buffersDataObject) (no return)
// --- create these two matrices:
// --- --- projection matrix with getMat4Projection(fieldOfView, aspect, zNear, zFar) (returns projectionMatrix)
// --- --- model view matrix with getMat4ModelView(rotationsArray, translationsArray) (returns modelViewMatrix)
// --- set uniform variables for the shader program with setUniforms(glContext, programInfo, projectionMatrix, modelViewMatrix, data1f, data3fv, data4fv) (no return)
// --- draw the arrays with gl.drawArrays(not doing allat)
// --- delete the shader program with deleteShaderProgram(glContext, programInfo)