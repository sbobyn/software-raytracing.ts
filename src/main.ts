import { Device, Scene } from "./device.js";
import { Vec3 } from "./vector.js";

let canvas: HTMLCanvasElement;

// can be larger than canvas pixel buffer
let canvasScaledWidth: number;
let canvasScaledHeight: number;

let heightForm: HTMLFormElement;
let bounceDepthForm: HTMLFormElement;
let numSamplesForm: HTMLFormElement;
let frameWindowLengthForm: HTMLFormElement;
let vfovForm: HTMLFormElement;

let gammaCorrectionCheckbox: HTMLInputElement;

let sceneSelect: HTMLSelectElement;

let device: Device;

// fps lets
let divAverageFPS: HTMLDivElement;
let prevTime = performance.now();
const lastFPSValues: number[] = new Array(60);

document.addEventListener("DOMContentLoaded", init, false);

// input handling
const keyStates: { [key: string]: boolean } = {};
document.addEventListener("keydown", handleKeyDown, false);
document.addEventListener("keyup", handleKeyUp, false);

let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
const lookSensitivity = 0.01;

document.addEventListener("mousedown", handleMouseDown, false);
document.addEventListener("mousemove", handleMouseMove, false);
document.addEventListener("mouseup", handleMouseUp, false);

function init() {
  canvas = <HTMLCanvasElement>document.getElementById("frontBuffer");
  const canvasStyle = window.getComputedStyle(canvas);
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

  vfovForm = <HTMLFormElement>document.getElementById("vfovForm");
  vfovForm.addEventListener("submit", changevFOV);

  sceneSelect = <HTMLSelectElement>document.getElementById("scenesSelect");
  sceneSelect.addEventListener("change", changeScene);

  requestAnimationFrame(drawingLoop);
}

// USER INPUT ------------------------------------------------------

function changeScene(event: Event) {
  event.preventDefault();
  let selectedValue = sceneSelect.value;
  console.log("scene selected:", selectedValue);

  let scene: Scene;
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
}

function changevFOV(event: Event) {
  event.preventDefault();
  const input = <HTMLInputElement>document.getElementById("vfovInput");
  const vfov: number = parseInt(input.value);
  console.log("vfov submitted:", vfov);

  device.changeFOV(vfov);
}

function changeCanvasHeight(event: Event) {
  event.preventDefault();
  const input = <HTMLInputElement>document.getElementById("heightInput");
  const heightValue: number = parseInt(input.value);
  console.log("Height submitted:", heightValue);

  device.changeHeight(heightValue);
}

function toggleGammaCorrection() {
  console.log("Gamma correction toggled");
  device.toggleGammaCorrection();
}

function changeBounceDepth(event: Event) {
  event.preventDefault();
  const input = <HTMLInputElement>document.getElementById("bounceDepthInput");
  const bounceDepthValue: number = parseInt(input.value);
  console.log("Bounce depth submitted:", bounceDepthValue);

  device.changeMaxDepth(bounceDepthValue);
}

function changeNumSamples(event: Event) {
  event.preventDefault();
  const input = <HTMLFormElement>document.getElementById("numSamplesInput");
  const numSamplesValue = parseInt(input.value);
  console.log("Number of samples submitted", numSamplesValue);

  device.changeNumSamples(numSamplesValue);
}

function changeFrameWindowLength(event: Event) {
  event.preventDefault();
  const input = <HTMLFormElement>(
    document.getElementById("frameWindowLengthInput")
  );
  const windowLengthValue = parseInt(input.value);
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

  const deltaX = (event.clientX - lastMouseX) * lookSensitivity;
  const deltaY = (event.clientY - lastMouseY) * lookSensitivity;

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
  const currentFPS = 1000 / (now - prevTime);
  prevTime = now;

  if (lastFPSValues.length < 60) {
    lastFPSValues.push(currentFPS);
  } else {
    lastFPSValues.shift();
    lastFPSValues.push(currentFPS);
    let totalValues = 0;
    for (let i = 0; i < lastFPSValues.length; i++) {
      totalValues += lastFPSValues[i];
    }

    const averageFPS = totalValues / lastFPSValues.length;
    divAverageFPS.textContent = averageFPS.toFixed(2);
  }
}

function drawingLoop(now: number) {
  const deltaTime = (now - prevTime) / 1000;
  computeFps(now);
  changeCameraPosition(deltaTime);

  // device.clear(); // clear the front buffer and flush into back buffer
  device.render(); // write to back buffer
  device.present(); // flush the back buffer into the front buffer
  requestAnimationFrame(drawingLoop);
}
