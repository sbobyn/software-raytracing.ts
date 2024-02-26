import { Device } from "./device.js";
import { Vec3 } from "./vector.js";

var canvas: HTMLCanvasElement;

// can be larger than canvas pixel buffer
var canvasScaledWidth: number;
var canvasScaledHeight: number;

var heightForm: HTMLFormElement;
var bounceDepthForm: HTMLFormElement;
var numSamplesForm: HTMLFormElement;
var frameWindowLengthForm: HTMLFormElement;
var numBallsForm: HTMLFormElement;
var vfovForm: HTMLFormElement;

var gammaCorrectionCheckbox: HTMLInputElement;

var device: Device;

// fps vars
var divAverageFPS: HTMLDivElement;
var prevTime = performance.now();
var lastFPSValues: number[] = new Array(60);

document.addEventListener("DOMContentLoaded", init, false);

// input handling
var keyStates: { [key: string]: boolean } = {};
document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);

var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;
document.addEventListener("mousedown", handleMouseDown, false);
document.addEventListener("mousemove", handleMouseMove, false);
document.addEventListener("mouseup", handleMouseUp, false);

function init() {
  canvas = <HTMLCanvasElement>document.getElementById("frontBuffer");
  let canvasStyle = window.getComputedStyle(canvas);
  canvasScaledWidth = parseInt(canvasStyle.width, 10);
  canvasScaledHeight = parseInt(canvasStyle.height, 10);

  console.log("Scaled canvas width:", canvasScaledWidth, "px");
  console.log("Scaled canvas height:", canvasScaledHeight, "px");

  device = new Device(canvas);

  gammaCorrectionCheckbox = <HTMLInputElement>(
    document.getElementById("gammaCheckbox")
  );
  gammaCorrectionCheckbox.addEventListener("change", toggleGammaCorrection);

  divAverageFPS = <HTMLDivElement>document.getElementById("averageFPS");

  heightForm = <HTMLFormElement>document.getElementById("heightForm");
  heightForm.addEventListener("submit", changeCanvasHeight);

  bounceDepthForm = <HTMLFormElement>document.getElementById("bounceDepthForm");
  bounceDepthForm.addEventListener("submit", changeBounceDepth);

  numSamplesForm = <HTMLFormElement>document.getElementById("numSamplesForm");
  numSamplesForm.addEventListener("submit", changeNumSamples);

  frameWindowLengthForm = <HTMLFormElement>(
    document.getElementById("frameWindowLengthForm")
  );
  frameWindowLengthForm.addEventListener("submit", changeFrameWindowLength);

  numBallsForm = <HTMLFormElement>document.getElementById("numBallsForm");
  numBallsForm.addEventListener("submit", changeNumBalls);

  vfovForm = <HTMLFormElement>document.getElementById("vfovForm");
  vfovForm.addEventListener("submit", changevFOV);

  requestAnimationFrame(drawingLoop);
}

// USER INPUT ------------------------------------------------------

function changevFOV(event: Event) {
  event.preventDefault();
  var input = <HTMLInputElement>document.getElementById("vfovInput");
  var vfov: number = parseInt(input.value);
  console.log("vfov submitted:", vfov);

  device.changeFOV(vfov);
}

function changeNumBalls(event: Event) {
  event.preventDefault();
  var input = <HTMLInputElement>document.getElementById("numBallsInput");
  var numBalls: number = parseInt(input.value);
  console.log("numBalls submitted:", numBalls);

  device.changeNumBalls(numBalls);
}

function changeCanvasHeight(event: Event) {
  event.preventDefault();
  var input = <HTMLInputElement>document.getElementById("heightInput");
  var heightValue: number = parseInt(input.value);
  console.log("Height submitted:", heightValue);

  device.changeHeight(heightValue);
}

function toggleGammaCorrection() {
  console.log("Gamma correction toggled");
  device.toggleGammaCorrection();
}

function changeBounceDepth(event: Event) {
  event.preventDefault();
  var input = <HTMLInputElement>document.getElementById("bounceDepthInput");
  var bounceDepthValue: number = parseInt(input.value);
  console.log("Bounce depth submitted:", bounceDepthValue);

  device.changeMaxDepth(bounceDepthValue);
}

function changeNumSamples(event: Event) {
  event.preventDefault();
  var input = <HTMLFormElement>document.getElementById("numSamplesInput");
  var numSamplesValue = parseInt(input.value);
  console.log("Number of samples submitted", numSamplesValue);

  device.changeNumSamples(numSamplesValue);
}

function changeFrameWindowLength(event: Event) {
  event.preventDefault();
  var input = <HTMLFormElement>(
    document.getElementById("frameWindowLengthInput")
  );
  var windowLengthValue = parseInt(input.value);
  console.log("Window Length submitted", windowLengthValue);

  device.changeProgressRenderingWindowSize(windowLengthValue);
}

function handleKeyDown(event: KeyboardEvent) {
  keyStates[event.key.toLowerCase()] = true;
}

function handleKeyUp(event: KeyboardEvent) {
  keyStates[event.key.toLowerCase()] = false;
}

function handleMouseDown(event: MouseEvent) {
  if (
    event.clientX < 0 ||
    event.clientX >= canvasScaledWidth ||
    event.clientY < 0 ||
    event.clientY >= canvasScaledHeight
  )
    return;
  isDragging = true;
  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function handleMouseMove(event: MouseEvent) {
  if (!isDragging) return;

  let lookSensitivity = 0.01;

  let deltaX = (event.clientX - lastMouseX) * lookSensitivity;
  let deltaY = (event.clientY - lastMouseY) * lookSensitivity;

  device.rotateCamera(deltaX, deltaY);

  lastMouseX = event.clientX;
  lastMouseY = event.clientY;
}

function handleMouseUp(event: MouseEvent) {
  isDragging = false;
}

function changeCameraPosition(deltaTime: number) {
  let moveDir = new Vec3(0, 0, 0);
  if (keyStates["w"]) moveDir.plusEquals(device.camera.lookdir);
  if (keyStates["s"]) moveDir.minusEquals(device.camera.lookdir);
  if (keyStates["a"]) moveDir.minusEquals(device.camera.u);
  if (keyStates["d"]) moveDir.plusEquals(device.camera.u);

  if (!moveDir.nearEquals(Vec3.ZERO)) {
    moveDir = moveDir.normalized();
    device.moveCamera(moveDir, deltaTime);
  }
}

// ------------------------------------------------------------------

function computeFps(now: number) {
  // fps calcs
  var currentFPS = 1000 / (now - prevTime);
  prevTime = now;

  if (lastFPSValues.length < 60) {
    lastFPSValues.push(currentFPS);
  } else {
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

function drawingLoop(now: number) {
  let deltaTime = (now - prevTime) / 1000;
  computeFps(now);
  changeCameraPosition(deltaTime);

  // device.clear(); // clear the front buffer and flush into back buffer
  device.render(); // write to back buffer
  device.present(); // flush the back buffer into the front buffer
  requestAnimationFrame(drawingLoop);
}
