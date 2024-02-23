import { Device } from "./device.js";
import { Vec3 } from "./vector.js";

var canvas: HTMLCanvasElement;

// can be larger than canvas pixel buffer
var canvasScaledWidth: number;
var canvasScaledHeight: number;

var heightForm: HTMLFormElement;
var bounceDepthForm: HTMLFormElement;

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

  divAverageFPS = <HTMLDivElement>document.getElementById("averageFPS");

  heightForm = <HTMLFormElement>document.getElementById("heightForm");
  heightForm.addEventListener("submit", changeCanvasHeight);

  bounceDepthForm = <HTMLFormElement>document.getElementById("bounceDepthForm");
  bounceDepthForm.addEventListener("submit", changeBounceDepth);

  requestAnimationFrame(drawingLoop);
}

// USER INPUT ------------------------------------------------------
function changeCanvasHeight(event: Event) {
  event.preventDefault();
  var input = <HTMLInputElement>document.getElementById("heightInput");
  var heightValue: number = parseInt(input.value);
  console.log("Height submitted:", heightValue);

  device.changeHeight(heightValue);
}

function changeBounceDepth(event: Event) {
  event.preventDefault();
  var input = <HTMLInputElement>document.getElementById("bounceDepthInput");
  var bounceDepthValue: number = parseInt(input.value);
  console.log("Bounce depth submitted:", bounceDepthValue);

  device.changeMaxDepth(bounceDepthValue);
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

  let currLookAt = device.camera.lookfrom.add(device.camera.lookdir);
  let newLookAt = currLookAt
    .add(device.camera.u.scale(deltaX))
    .add(device.camera.v.scale(-deltaY));

  device.camera.lookAt(newLookAt);

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

  if (!moveDir.equals(Vec3.ZERO)) {
    moveDir = moveDir.normalized();
    device.moveCamera(moveDir, deltaTime);
  }
}

// Click and Drag
function changeCameraDirection() {}

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

  device.clear(); // clear the front buffer and flush into back buffer
  device.render(); // write to back buffer
  device.present(); // flush the back buffer into the front buffer
  requestAnimationFrame(drawingLoop);
}
