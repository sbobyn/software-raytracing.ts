import { Color3 } from "./color.js";
import { Ray } from "./ray.js";
import { Vec3, Point3 } from "./vector.js";
import { Camera } from "./camera.js";
import { HittableList } from "./hittable.js";
import { Sphere } from "./sphere.js";

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
    this.scene.add(new Sphere(new Point3(0, 0, -1), 0.5));
    this.scene.add(new Sphere(new Point3(0, -100.5, -1), 100));
  }

  public changeHeight(newHeight: number) {
    this.height = newHeight;
    this.canvas.height = newHeight;
    this.width = Math.floor(newHeight * this.aspectRatio);
    this.canvas.width = this.width;
    this.viewportHeight = 2.0;
    this.viewportWidth = this.viewportHeight * (this.width / this.height);
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
        pixel_ij.plusEquals(pixeldeltaU);
        ray.dir = pixel_ij.subtract(this.camera.lookfrom);
        pixelColor = this.camera.rayColor(ray, this.scene);
        this.writePixel(i, j, pixelColor);
      }
    }
  }
}
