import { Color3 } from "./color.js";
import { Ray } from "./ray.js";
import { Vec3, Point3 } from "./vector.js";
import { Camera } from "./camera.js";
import { HittableList } from "./hittable.js";
import { Sphere } from "./sphere.js";
import { Diffuse, Metal } from "./material.js";

export class Device {
  // the back buffer size is equal to the number of pixels
  // to draw on screen (width * height) * 4 (RGBA values)
  private canvas: HTMLCanvasElement;
  private backbuffer: ImageData;
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private aspectRatio: number;
  private viewportHeight: number;
  private viewportWidth: number;
  public camera: Camera; // TODO make private
  private scene: HittableList;
  private maxDepth: number;
  private numSamples: number;
  private prevFrameWeight: number; // for progressive rendering
  private newFrameWeight: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d", { willReadFrequently: true })!;
    this.backbuffer = this.context.getImageData(0, 0, this.width, this.height);
    this.aspectRatio = this.width / this.height;
    this.viewportHeight = 2.0;
    this.viewportWidth = this.viewportHeight * (this.width / this.height);
    this.camera = new Camera();
    this.camera.lookAt(new Point3(0, 0, -1));

    this.scene = new HittableList();
    var groundMat = new Diffuse(new Color3(0.8, 0.8, 0.0));
    var centerMat = new Diffuse(new Color3(0.7, 0.3, 0.3));
    var leftMat = new Metal(new Color3(0.8, 0.8, 0.8), 0.3);
    var rightMat = new Metal(new Color3(0.8, 0.6, 0.2), 0.0);

    this.scene.add(new Sphere(new Point3(0, -100.5, -1), 100, groundMat));
    this.scene.add(new Sphere(new Point3(0, 0, -1), 0.5, centerMat));
    this.scene.add(new Sphere(new Point3(1, 0, -1), 0.5, rightMat));
    this.scene.add(new Sphere(new Point3(-1, 0, -1), 0.5, leftMat));

    this.maxDepth = 2;
    this.numSamples = 1;
    this.prevFrameWeight = 0.0;
    this.newFrameWeight = 1.0;
  }

  public changeMaxDepth(newDepth: number) {
    this.maxDepth = newDepth;
  }

  public changeHeight(newHeight: number) {
    this.height = newHeight;
    this.canvas.height = newHeight;
    this.width = Math.floor(newHeight * this.aspectRatio);
    this.canvas.width = this.width;
    this.viewportHeight = 2.0;
    this.viewportWidth = this.viewportHeight * (this.width / this.height);
    this.clear();
  }

  public changeNumSamples(newNum: number) {
    this.numSamples = newNum;
  }

  public changeProgressRenderingWindowSize(newWindowLength: number) {
    this.newFrameWeight = 1 / newWindowLength;
    this.prevFrameWeight = 1 - this.newFrameWeight;
  }

  public moveCamera(direction: Vec3, deltaTime: number) {
    this.camera.lookfrom.plusEquals(
      direction.scale(this.camera.moveSpeed * deltaTime)
    );
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

  public pixelOffset(pixeldu: Vec3, pixeldv: Vec3): Vec3 {
    var sx = -0.5 + Math.random();
    var sy = -0.5 + Math.random();
    return pixeldu.scale(sx).add(pixeldv.scale(sy));
  }

  public render() {
    // origin at top left
    var viewportU = this.camera.u.scale(this.viewportWidth);
    var viewportV = this.camera.v.scale(-this.viewportHeight);

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
    for (var j = 0; j < this.height; j++) {
      pixel_ij = pixel_00.add(pixeldeltaV.scale(j));
      for (var i = 0; i < this.width; i++) {
        pixelColor = new Color3(0, 0, 0);
        pixel_ij.plusEquals(pixeldeltaU);
        for (var sample = 0; sample < this.numSamples; sample++) {
          ray.dir = pixel_ij.subtract(this.camera.lookfrom);
          if (this.numSamples > 1) {
            // prevents jitter when using one sample per pixel
            // since we don't want a random offset if only taking one sample
            ray.dir.plusEquals(this.pixelOffset(pixeldeltaU, pixeldeltaV));
          }
          pixelColor.plusEquals(
            this.camera.rayColor(ray, this.scene, this.maxDepth)
          );
        }
        this.writePixelProgressive(i, j, pixelColor.scale(1 / this.numSamples));
      }
    }
  }
}
