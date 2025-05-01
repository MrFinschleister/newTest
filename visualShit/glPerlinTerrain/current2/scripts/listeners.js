function keydown(e) {
    let movementSpeed = 10.0;

    let code = e.code;

    let rotations = data3fv.uCameraRotations;
    let usedRotations = new Vector3(0.0, rotations.y, 0.0);

    let directionX = new Vector3(movementSpeed, 0.0, 0.0).rotateRad(usedRotations, Vector3.neutral());
    let directionY = new Vector3(0.0, movementSpeed, 0.0);
    let directionZ = new Vector3(0.0, 0.0, movementSpeed).rotateRad(usedRotations, Vector3.neutral());

    if (code == "Space") {
        data3fv.uCameraPosition.subtract(directionY);
    } else if (code == "ShiftLeft") {
        data3fv.uCameraPosition.add(directionY);
    } else if (code == "KeyW") {
        data3fv.uCameraPosition.add(directionZ);
    } else if (code == "KeyS") {
        data3fv.uCameraPosition.subtract(directionZ);
    } else if (code == "KeyA") {
        data3fv.uCameraPosition.add(directionX);
    } else if (code == "KeyD") {
        data3fv.uCameraPosition.subtract(directionX);
    } else if (code == "Backquote") {
        lockPointer();
    } else if (code == "KeyF") {
        fullscreen();
    } else if (code == "Escape") {
        escapeKey();
    }
}

function mousedown(e) {
    // mousedown listeners
}

function mousemove(e) {
    let totalRotation = Math.PI * 2;

    let locX = e.movementX;
    let locY = e.movementY;
    let ratioX = locX / document.body.clientWidth;
    let ratioY = locY / document.body.clientHeight;

    let rotationVector = new Vector3(ratioY, ratioX, 0.0).scaled(totalRotation);

    data3fv.uCameraRotations.add(rotationVector);
}

function mouseup(e) {
    // mouseup listeners
}

function lockPointer() {
    document.body.requestPointerLock();
}

function fullscreen() {
    document.body.requestFullscreen();
}

function escapeKey() {
}