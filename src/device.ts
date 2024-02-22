import { Color3 } from "./color.js";
import { Ray } from "./ray.js";
import { Vec3, Point3 } from "./vector.js";

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

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d", { willReadFrequently: true })!;
    this.backbuffer = this.context.getImageData(0, 0, this.width, this.height);
    this.aspectRatio = this.width / this.height;
    this.viewportHeight = 2.0;
    this.viewportWidth = this.viewportHeight * (this.width / this.height);
  }

  public changeHeight(newHeight: number) {
    this.height = newHeight;
    this.canvas.height = newHeight;
    this.width = Math.floor(newHeight * this.aspectRatio);
    this.canvas.width = this.width;
    this.viewportHeight = 2.0;
    this.viewportWidth = this.viewportHeight * (this.width / this.height);
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

  private hitSphere(center: Point3, radius: number, ray: Ray): number {
    var oc: Vec3 = ray.orig.subtract(center);
    var a = ray.dir.dot(ray.dir);
    var b = 2 * oc.dot(ray.dir);
    var c = oc.dot(oc) - radius ** 2;
    var discr = b ** 2 - 4 * a * c;

    if (discr < 0) return -1.0;

    return (-b - Math.sqrt(discr)) / (2.0 * a);
  }

  private rayColor(ray: Ray) {
    var spherePos = new Point3(0, 0, -1);
    var t = this.hitSphere(spherePos, 0.5, ray);
    if (t > 0) {
      var N: Vec3 = ray.at(t).subtract(spherePos).normalized();
      var Ncolor: Color3 = new Color3(N.x + 1, N.y + 1, N.z + 1);
      return Ncolor.scale(0.5);
    }

    var unitDir = ray.dir.normalized();
    var a: number = 0.5 * (unitDir.y + 1);
    return Color3.WHITE.scale(1 - a).add(Color3.SKY_BLUE.scale(a));
  }

  public render() {
    // camera
    var focalLength: number = 1.0;
    var cameraPos = new Point3(0, 0, 0);

    var viewportU = new Vec3(this.viewportWidth, 0, 0);
    var viewportV = new Vec3(0, -this.viewportHeight, 0);

    var pixeldeltaU: Vec3 = viewportU.scale(1 / this.width);
    var pixeldeltaV: Vec3 = viewportV.scale(1 / this.height);

    var viewportUpperLeft: Vec3 = cameraPos
      .subtract(new Vec3(0, 0, focalLength))
      .subtract(viewportU.scale(0.5))
      .subtract(viewportV.scale(0.5));
    var pixel_00: Point3 = viewportUpperLeft.add(
      pixeldeltaU.add(pixeldeltaV).scale(0.5)
    );

    var pixel_ij: Point3;
    var ray = new Ray(cameraPos, new Vec3(0, 0, 0)); // initial dir is a placeholder
    var pixelColor: Color3;
    for (var j = 0; j < this.height; j++) {
      pixel_ij = pixel_00.add(pixeldeltaV.scale(j));
      for (var i = 0; i < this.width; i++) {
        pixel_ij.plusEquals(pixeldeltaU);
        ray.dir = pixel_ij.subtract(cameraPos);
        pixelColor = this.rayColor(ray);
        this.writePixel(i, j, pixelColor);
      }
    }
  }
}
