function draw(gl) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); 
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawTerrains(gl);
    drawSky(gl);
}

function drawTerrains(gl) {
    const fieldOfViewTerrain = Math.PI / 4;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNearTerrain = 0.1;
    const zFarTerrain = gridDepth; 

    const projectionMatrixTerrain = mat4.create();
    const modelViewMatrixTerrain = mat4.create();

    mat4.perspective(projectionMatrixTerrain, fieldOfViewTerrain, aspect, zNearTerrain, zFarTerrain);
    mat4.rotate(modelViewMatrixTerrain, modelViewMatrixTerrain, data3fv.uCameraRotations.x, [1.0, 0.0, 0.0]);
    mat4.rotate(modelViewMatrixTerrain, modelViewMatrixTerrain, data3fv.uCameraRotations.y, [0.0, 1.0, 0.0]);
    mat4.rotate(modelViewMatrixTerrain, modelViewMatrixTerrain, data3fv.uCameraRotations.z, [0.0, 0.0, 1.0]);
    mat4.translate(modelViewMatrixTerrain, modelViewMatrixTerrain, data3fv.uCameraPosition.array());

    const terrainProgram = constructFullShaderProgram(gl, terrainVertexShader, terrainFragmentShader);
    finaliseProgram(terrainProgram, terrainBuffers, projectionMatrixTerrain, modelViewMatrixTerrain);
    gl.drawArrays(gl.TRIANGLES, 0, terrainBuffers.vertexCount);
    deleteShaderProgram(gl, terrainProgram);
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
    mat4.rotate(modelViewMatrixSky, modelViewMatrixSky, data3fv.uCameraRotations.x, [1.0, 0.0, 0.0]);
    mat4.rotate(modelViewMatrixSky, modelViewMatrixSky, data3fv.uCameraRotations.y, [0.0, 1.0, 0.0]);
    mat4.rotate(modelViewMatrixSky, modelViewMatrixSky, data3fv.uCameraRotations.z, [0.0, 0.0, 1.0]);

    const skyProgram = constructFullShaderProgram(gl, skyVertexShader, skyFragmentShader);
    finaliseProgram(skyProgram, skyBuffers, projectionMatrixSky, modelViewMatrixSky);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, skyBuffers.vertexCount);
    deleteShaderProgram(gl, skyProgram);
}