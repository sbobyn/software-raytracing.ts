import { Color3 } from "./color.js";
import { Ray } from "./ray.js";
import { Vec3, Point3 } from "./vector.js";
import { Camera } from "./camera.js";
import { Hittable, HittableList } from "./hittable.js";
import { Sphere } from "./sphere.js";
import { Dielectric, Diffuse, Material, Metal } from "./material.js";
import { randomInRange } from "./utils.js";

export class Device {
  // the back buffer size is equal to the number of pixels
  // to draw on screen (width * height) * 4 (RGBA values)
  private canvas: HTMLCanvasElement;
  private backbuffer: ImageData;
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private aspectRatio: number;
  public camera: Camera; // TODO make private
  private scene: HittableList;
  private maxDepth: number;
  private numSamples: number;
  private prevFrameWeight: number; // for progressive rendering
  private newFrameWeight: number;
  private gammaCorrectionEnabled: boolean;
  private cameraMoving: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d", { willReadFrequently: true })!;
    this.backbuffer = this.context.getImageData(0, 0, this.width, this.height);
    this.aspectRatio = this.width / this.height;

    this.camera = new Camera(90, this.width / this.height, 1);
    this.camera.lookfrom = new Point3(5, 2, 3);
    this.camera.lookAt(new Point3(0, 0, -1));

    this.scene = this.in1WkndScene(2);

    this.maxDepth = 4;
    this.numSamples = 1;
    this.prevFrameWeight = 0.0;
    this.newFrameWeight = 1.0;
    this.gammaCorrectionEnabled = true;
    this.cameraMoving = false;
  }

  private in1WkndScene(numBalls: number): HittableList {
    var scene = new HittableList();
    for (var a = -numBalls; a < numBalls; a++) {
      for (var b = -numBalls; b < numBalls; b++) {
        var chooseMat = Math.random();
        var center = new Point3(
          2 * a + 2 * Math.random(),
          0.2,
          2 * b + 2 * Math.random()
        );

        if (center.subtract(new Point3(4, 0.2, 0)).length() > 0.9) {
          var sphereMat: Material;
          if (chooseMat < 0.8) {
            // diffuse
            var albedo = Color3.random().mul(Color3.random());
            sphereMat = new Diffuse(albedo);
            scene.add(new Sphere(center, 0.2, sphereMat));
          } else if (chooseMat < 0.95) {
            // metal
            var albedo = Color3.random(0.5, 1);
            var roughness = randomInRange(0, 0.5);
            sphereMat = new Metal(albedo, roughness);
            scene.add(new Sphere(center, 0.2, sphereMat));
          } else {
            // glass
            sphereMat = new Dielectric(1.5);
            scene.add(new Sphere(center, 0.2, sphereMat));
          }
        }
      }
    }

    var groundMat = new Diffuse(new Color3(0.5, 0.5, 0.5));
    var centerMat = new Dielectric(1.5);
    var leftMat = new Diffuse(new Color3(0.4, 0.2, 0.1));
    var rightMat = new Metal(new Color3(0.7, 0.6, 0.5), 0.0);

    scene.add(new Sphere(new Point3(0, -1000, -1), 1000, groundMat));
    scene.add(new Sphere(new Point3(0, 1, 0), 1, centerMat));
    scene.add(new Sphere(new Point3(4, 1, 0), 1, rightMat));
    scene.add(new Sphere(new Point3(-4, 1, -0), 1, leftMat));

    return scene;
  }

  public changeNumBalls(newValue: number) {
    this.scene = this.in1WkndScene(newValue);
  }

  public changeMaxDepth(newDepth: number) {
    this.maxDepth = newDepth;
  }

  public changeHeight(newHeight: number) {
    this.height = newHeight;
    this.canvas.height = newHeight;
    this.width = Math.floor(newHeight * this.aspectRatio);
    this.canvas.width = this.width;
    this.camera.updateAspectRatio(this.width / this.height);
    this.clear();
  }

  public changeFOV(newValue: number) {
    this.camera.updateFOV(newValue);
  }

  public changeNumSamples(newNum: number) {
    this.numSamples = newNum;
  }

  public changeProgressRenderingWindowSize(newWindowLength: number) {
    this.newFrameWeight = 1 / newWindowLength;
    this.prevFrameWeight = 1 - this.newFrameWeight;
  }

  public toggleGammaCorrection() {
    this.gammaCorrectionEnabled = !this.gammaCorrectionEnabled;
  }

  public moveCamera(direction: Vec3, deltaTime: number) {
    this.camera.lookfrom.plusEquals(
      direction.scale(this.camera.moveSpeed * deltaTime)
    );
    this.cameraMoving = true;
  }

  public rotateCamera(deltaU: number, deltaV: number) {
    let currLookAt = this.camera.lookfrom.add(this.camera.lookdir);
    let newLookAt = currLookAt
      .add(this.camera.u.scale(deltaU))
      .add(this.camera.v.scale(-deltaV));

    this.camera.lookAt(newLookAt);
    this.cameraMoving = true;
  }

  public clear() {
    // clear canvas with black
    this.context.clearRect(0, 0, this.width, this.height);
    // flush cleared front buffer into back buffer
    this.backbuffer = this.context.getImageData(0, 0, this.width, this.height);
  }

  // once everything ready, flush the back buffer into the front
  public present() {
    this.context.putImageData(this.backbuffer, 0, 0);
  }

  // write color to position (x,y) of the back buffer
  public writePixel(x: number, y: number, color: Color3): void {
    var index: number = (Math.floor(x) + Math.floor(y) * this.width) * 4;

    // gamma correction
    if (this.gammaCorrectionEnabled) {
      color.r = this.linearToGamma(color.r);
      color.g = this.linearToGamma(color.g);
      color.b = this.linearToGamma(color.b);
    }

    this.backbuffer.data[index] = color.r * 255;
    this.backbuffer.data[index + 1] = color.g * 255;
    this.backbuffer.data[index + 2] = color.b * 255;
    this.backbuffer.data[index + 3] = 1 * 255;
  }

  // progressive rendering
  // accumulate rays over time
  public writePixelProgressive(x: number, y: number, color: Color3): void {
    var index: number = (Math.floor(x) + Math.floor(y) * this.width) * 4;

    var prevR = this.backbuffer.data[index];
    var prevG = this.backbuffer.data[index + 1];
    var prevB = this.backbuffer.data[index + 2];

    // gamma correction
    if (this.gammaCorrectionEnabled) {
      color.r = this.linearToGamma(color.r);
      color.g = this.linearToGamma(color.g);
      color.b = this.linearToGamma(color.b);
    }

    var newR =
      this.prevFrameWeight * prevR + this.newFrameWeight * color.r * 255;
    var newG =
      this.prevFrameWeight * prevG + this.newFrameWeight * color.g * 255;
    var newB =
      this.prevFrameWeight * prevB + this.newFrameWeight * color.b * 255;

    this.backbuffer.data[index] = newR;
    this.backbuffer.data[index + 1] = newG;
    this.backbuffer.data[index + 2] = newB;

    this.backbuffer.data[index + 3] = 1 * 255;
  }

  // approximation of gamma correction using gamma=2
  private linearToGamma(linearValue: number): number {
    return Math.sqrt(linearValue);
  }

  public pixelOffset(pixeldu: Vec3, pixeldv: Vec3): Vec3 {
    var sx = -0.5 + Math.random();
    var sy = -0.5 + Math.random();
    return pixeldu.scale(sx).add(pixeldv.scale(sy));
  }

  public render() {
    var viewportU = this.camera.u.scale(this.camera.viewportWidth);
    var viewportV = this.camera.v.scale(-this.camera.viewportHeight);

    // distance to next pixel
    var pixeldeltaU: Vec3 = viewportU.scale(1 / this.width);
    var pixeldeltaV: Vec3 = viewportV.scale(1 / this.height);

    var viewportUpperLeft = this.camera.lookfrom
      .add(this.camera.lookdir.scale(this.camera.focalLength))
      .subtract(viewportU.scale(0.5))
      .subtract(viewportV.scale(0.5));
    var pixel_00: Point3 = viewportUpperLeft.add(
      pixeldeltaU.add(pixeldeltaV).scale(0.5)
    );

    var pixel_ij: Point3;
    var ray = new Ray(this.camera.lookfrom, new Vec3(0, 0, 0)); // initial dir is a placeholder
    var pixelColor: Color3;
    var numRays = this.numSamples;
    for (var j = 0; j < this.height; j++) {
      pixel_ij = pixel_00.add(pixeldeltaV.scale(j));
      for (var i = 0; i < this.width; i++) {
        pixelColor = new Color3(0, 0, 0);
        pixel_ij.plusEquals(pixeldeltaU);

        ray.dir = pixel_ij.subtract(this.camera.lookfrom);
        pixelColor.plusEquals(
          this.camera.rayColor(ray, this.scene, this.maxDepth)
        );
        for (var sample = 1; sample < numRays; sample++) {
          ray.dir = pixel_ij.subtract(this.camera.lookfrom);
          ray.dir.plusEquals(this.pixelOffset(pixeldeltaU, pixeldeltaV));
          pixelColor.plusEquals(
            this.camera.rayColor(ray, this.scene, this.maxDepth)
          );
        }
        if (this.cameraMoving)
          this.writePixel(i, j, pixelColor.scale(1 / numRays));
        else this.writePixelProgressive(i, j, pixelColor.scale(1 / numRays));
      }
    }
    this.cameraMoving = false;
  }
}
