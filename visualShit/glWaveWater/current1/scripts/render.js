function draw(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawWaves(gl);
    drawSky(gl);
}

function drawWaves(gl) {
    const fieldOfViewWave = Math.PI / 4;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNearWave = 0.1;
    const zFarWave = gridDepth;

    const projectionMatrixWave = mat4.create();
    const modelViewMatrixWave = mat4.create();

    mat4.perspective(projectionMatrixWave, fieldOfViewWave, aspect, zNearWave, zFarWave);
    mat4.translate(modelViewMatrixWave, modelViewMatrixWave,[0.0, -0.0, 0.0]);
    mat4.rotate(modelViewMatrixWave, modelViewMatrixWave, 0.0, [1.0, 0.0, 0.0]);

    const waveProgram = constructFullShaderProgram(gl, waveVertexShader, waveFragmentShader);
    finaliseProgram(waveProgram, waveBuffers, projectionMatrixWave, modelViewMatrixWave);
    gl.drawArrays(gl.TRIANGLES, 0, waveBuffers.vertexCount);
    deleteShaderProgram(gl, waveProgram);
}

function drawSky(gl) {
    const fieldOfViewSky = Math.PI / 4;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    const zNearSky = 0.1;
    const zFarSky = skyDepth;

    const projectionMatrixSky = mat4.create();
    const modelViewMatrixSky = mat4.create();

    mat4.perspective(projectionMatrixSky, fieldOfViewSky, aspect, zNearSky, zFarSky);
    mat4.translate(modelViewMatrixSky, modelViewMatrixSky,[0.0, 0.0, 0.0]);
    mat4.rotate(modelViewMatrixSky, modelViewMatrixSky, 0.0, [0.0, 0, 1.0]);

    const skyProgram = constructFullShaderProgram(gl, skyVertexShader, skyFragmentShader);
    finaliseProgram(skyProgram, skyBuffers, projectionMatrixSky, modelViewMatrixSky);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, skyBuffers.vertexCount);
    deleteShaderProgram(gl, skyProgram);
}