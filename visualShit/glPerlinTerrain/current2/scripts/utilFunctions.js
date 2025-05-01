function getMat4Projection(fieldOfView, aspect, zNear, zFar) {
    let projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);
    return projectionMatrix;
}

function getMat4ModelView(rotationsArray, translationsArray) {
    let modelViewMatrix = mat4.create();
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationsArray[0], [1.0, 0.0, 0.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationsArray[1], [0.0, 1.0, 0.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotationsArray[2], [0.0, 0.0, 1.0]);
    mat4.translate(modelViewMatrix, modelViewMatrix, translationsArray);
    return modelViewMatrix;
}