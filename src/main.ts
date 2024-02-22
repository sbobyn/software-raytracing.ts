import { Device } from "./device.js";

var canvas: HTMLCanvasElement;
var device: Device;

// fps vars
var divAverageFPS: HTMLDivElement;
var prevTime = performance.now();
var lastFPSValues: number[] = new Array(60);

document.addEventListener("DOMContentLoaded", init, false);

function init() {
  canvas = <HTMLCanvasElement>document.getElementById("frontBuffer");
  device = new Device(canvas);

  divAverageFPS = <HTMLDivElement>document.getElementById("averageFPS");

  requestAnimationFrame(drawingLoop);
}

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
  computeFps(now);

  device.clear(); // clear the front buffer and flush into back buffer
  device.render(); // write to back buffer
  device.present(); // flush the back buffer into the front buffer
  requestAnimationFrame(drawingLoop);
}