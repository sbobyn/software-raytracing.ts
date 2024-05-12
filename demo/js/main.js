import { Device, Scene } from "./device.js";
import { Vec3 } from "./vector.js";
var canvas;
var canvasRect;
// can be larger than canvas pixel buffer
var canvasScaledWidth;
var canvasScaledHeight;
var heightForm;
var bounceDepthForm;
var numSamplesForm;
var frameWindowLengthForm;
var vfovForm;
var gammaCorrectionCheckbox;
var sceneSelect;
var device;
// fps
var divAverageFPS;
var prevTime = performance.now();
var lastFPSValues = new Array(60);
// camera spans
var cameraPosSpan;
var cameraLookSpan;
document.addEventListener("DOMContentLoaded", init, false);
// input handling
var keyStates = {};
var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;
var lookSensitivity = 0.01;
function init() {
    canvas = document.getElementById("frontBuffer");
    addKeyboardListeners();
    addMouseListeners();
    addTouchListeners();
    var canvasStyle = window.getComputedStyle(canvas);
    canvasScaledWidth = parseInt(canvasStyle.width, 10);
    canvasScaledHeight = parseInt(canvasStyle.height, 10);
    console.log("Scaled canvas width:", canvasScaledWidth, "px");
    console.log("Scaled canvas height:", canvasScaledHeight, "px");
    device = new Device(canvas);
    gammaCorrectionCheckbox = (document.getElementById("gammaCheckbox"));
    gammaCorrectionCheckbox.addEventListener("change", toggleGammaCorrection);
    divAverageFPS = document.getElementById("averageFPS");
    cameraPosSpan = document.getElementById("cameraPosSpan");
    cameraLookSpan = document.getElementById("cameraLookSpan");
    cameraPosSpan.textContent = device.camera.lookfrom.toString();
    cameraLookSpan.textContent = device.camera.lookdir.toString();
    heightForm = document.getElementById("heightForm");
    heightForm.addEventListener("submit", changeCanvasHeight);
    bounceDepthForm = document.getElementById("bounceDepthForm");
    bounceDepthForm.addEventListener("submit", changeBounceDepth);
    numSamplesForm = document.getElementById("numSamplesForm");
    numSamplesForm.addEventListener("submit", changeNumSamples);
    frameWindowLengthForm = (document.getElementById("frameWindowLengthForm"));
    frameWindowLengthForm.addEventListener("submit", changeFrameWindowLength);
    vfovForm = document.getElementById("vfovForm");
    vfovForm.addEventListener("submit", changevFOV);
    sceneSelect = document.getElementById("scenesSelect");
    sceneSelect.addEventListener("change", changeScene);
    requestAnimationFrame(drawingLoop);
}
// USER INPUT ------------------------------------------------------
function changeScene(event) {
    event.preventDefault();
    var selectedValue = sceneSelect.value;
    console.log("scene selected:", selectedValue);
    var scene;
    switch (selectedValue) {
        case "1wkndReduced":
            scene = Scene.WkndReduced;
            break;
        case "1wknd":
            scene = Scene.Wknd;
            break;
        case "whitted":
            scene = Scene.Whitted1980;
            break;
        case "textures":
            scene = Scene.Textures;
            break;
        case "perlin":
            scene = Scene.PerlinLights;
            break;
        case "emptyCornell":
            scene = Scene.CornellEmpty;
            break;
        case "cornell":
            scene = Scene.Cornell;
            break;
        case "1wknd2":
            scene = Scene.Wknd2;
            break;
        default:
            scene = Scene.WkndReduced;
    }
    device.changeScene(scene);
    cameraLookSpan.textContent = device.camera.lookdir.toString();
    cameraPosSpan.textContent = device.camera.lookfrom.toString();
}
function changevFOV(event) {
    event.preventDefault();
    var input = document.getElementById("vfovInput");
    var vfov = parseInt(input.value);
    console.log("vfov submitted:", vfov);
    device.changeFOV(vfov);
}
function changeCanvasHeight(event) {
    event.preventDefault();
    var input = document.getElementById("heightInput");
    var heightValue = parseInt(input.value);
    console.log("Height submitted:", heightValue);
    device.changeHeight(heightValue);
}
function toggleGammaCorrection() {
    console.log("Gamma correction toggled");
    device.toggleGammaCorrection();
}
function changeBounceDepth(event) {
    event.preventDefault();
    var input = document.getElementById("bounceDepthInput");
    var bounceDepthValue = parseInt(input.value);
    console.log("Bounce depth submitted:", bounceDepthValue);
    device.changeMaxDepth(bounceDepthValue);
}
function changeNumSamples(event) {
    event.preventDefault();
    var input = document.getElementById("numSamplesInput");
    var numSamplesValue = parseInt(input.value);
    console.log("Number of samples submitted", numSamplesValue);
    device.changeNumSamples(numSamplesValue);
}
function changeFrameWindowLength(event) {
    event.preventDefault();
    var input = (document.getElementById("frameWindowLengthInput"));
    var windowLengthValue = parseInt(input.value);
    console.log("Window Length submitted", windowLengthValue);
    device.changeProgressRenderingWindowSize(windowLengthValue);
}
function handleKeyDown(event) {
    keyStates[event.key.toLowerCase()] = true;
}
function handleKeyUp(event) {
    keyStates[event.key.toLowerCase()] = false;
}
function addKeyboardListeners() {
    document.addEventListener("keydown", handleKeyDown, false);
    document.addEventListener("keyup", handleKeyUp, false);
}
function updateCanvasRect() {
    canvasRect = canvas.getBoundingClientRect();
}
function handleMouseDown(event) {
    updateCanvasRect();
    // Calculate mouse position relative to the canvas
    var mouseX = event.clientX - canvasRect.left;
    var mouseY = event.clientY - canvasRect.top;
    // Check if mouse is outside canvas bounds
    if (mouseX < 0 ||
        mouseX >= canvasRect.width ||
        mouseY < 0 ||
        mouseY >= canvasRect.height)
        return;
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}
function handleMouseMove(event) {
    if (!isDragging)
        return;
    var deltaX = (event.clientX - lastMouseX) * lookSensitivity;
    var deltaY = (event.clientY - lastMouseY) * lookSensitivity;
    device.rotateCamera(deltaX, deltaY);
    cameraLookSpan.textContent = device.camera.lookdir.toString();
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}
function handleMouseUp(event) {
    isDragging = false;
}
function changeCameraPosition(deltaTime) {
    var moveDir = new Vec3(0, 0, 0);
    if (keyStates["w"])
        moveDir.plusEquals(device.camera.lookdir);
    if (keyStates["s"])
        moveDir.minusEquals(device.camera.lookdir);
    if (keyStates["a"])
        moveDir.minusEquals(device.camera.u);
    if (keyStates["d"])
        moveDir.plusEquals(device.camera.u);
    if (!moveDir.nearEquals(Vec3.ZERO)) {
        moveDir = moveDir.normalized();
        device.moveCamera(moveDir, deltaTime);
    }
    cameraPosSpan.textContent = device.camera.lookfrom.toString();
}
function addMouseListeners() {
    document.addEventListener("mousedown", handleMouseDown, false);
    document.addEventListener("mousemove", handleMouseMove, false);
    document.addEventListener("mouseup", handleMouseUp, false);
}
function handleTouchStart(e) {
    e.preventDefault(); // Prevent scrolling and other default actions
    updateCanvasRect();
    var touch = e.touches[0]; // Get the first touch
    var mouseX = touch.clientX - canvasRect.left;
    var mouseY = touch.clientY - canvasRect.top;
    // Check if touch is outside canvas bounds
    if (mouseX < 0 ||
        mouseX >= canvasRect.width ||
        mouseY < 0 ||
        mouseY >= canvasRect.height)
        return;
    isDragging = true;
    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;
}
function handleTouchMove(e) {
    if (!isDragging)
        return;
    e.preventDefault(); // Prevent default actions
    var touch = e.touches[0]; // Update with the movement of the first touch
    var deltaX = (touch.clientX - lastMouseX) * lookSensitivity;
    var deltaY = (touch.clientY - lastMouseY) * lookSensitivity;
    device.rotateCamera(deltaX, deltaY);
    cameraLookSpan.textContent = device.camera.lookdir.toString();
    lastMouseX = touch.clientX;
    lastMouseY = touch.clientY;
}
function handleTouchEnd(e) {
    isDragging = false;
}
function handleTouchCancel(e) {
    isDragging = false;
}
function addTouchListeners() {
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("touchcancel", handleTouchCancel);
}
// ------------------------------------------------------------------
function computeFps(now) {
    // fps calcs
    var currentFPS = 1000 / (now - prevTime);
    prevTime = now;
    if (lastFPSValues.length < 60) {
        lastFPSValues.push(currentFPS);
    }
    else {
        lastFPSValues.shift();
        lastFPSValues.push(currentFPS);
        var totalValues = 0;
        for (var i = 0; i < lastFPSValues.length; i++) {
            totalValues += lastFPSValues[i];
        }
        var averageFPS = totalValues / lastFPSValues.length;
        divAverageFPS.textContent = averageFPS.toFixed(2);
    }
}
function drawingLoop(now) {
    var deltaTime = (now - prevTime) / 1000;
    computeFps(now);
    changeCameraPosition(deltaTime);
    // device.clear(); // clear the front buffer and flush into back buffer
    device.render(); // write to back buffer
    device.present(); // flush the back buffer into the front buffer
    requestAnimationFrame(drawingLoop);
}
