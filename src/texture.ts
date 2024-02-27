import { Color3 } from "./color.js";
import { Point3 } from "./vector.js";

export interface Texture {
  value(u: number, v: number, point: Point3): Color3;
}

export class SolidColor implements Texture {
  constructor(private color: Color3) {}
  value(u: number, v: number, point: Point3): Color3 {
    return this.color;
  }
}

export class CheckerTextureXYZ implements Texture {
  private invScale: number;
  constructor(private c1: Color3, private c2: Color3, scale: number) {
    this.invScale = 1 / scale;
  }

  value(u: number, v: number, point: Point3): Color3 {
    var xi = Math.floor(this.invScale * point.x);
    var yi = Math.floor(this.invScale * point.y);
    var zi = Math.floor(this.invScale * point.z);

    var isEven = (xi + yi + zi) % 2 == 0;
    return isEven ? this.c1 : this.c2;
  }
}

export class CheckerTextureUV implements Texture {
  value(u: number, v: number, point: Point3): Color3 {
    throw new Error("Method not implemented.");
  }
}

export default class ImageTexture implements Texture {
  width: number = 0;
  height: number = 0;
  buffer: Uint8ClampedArray | null = null;

  constructor(filename: string) {
    this.load(filename);
  }

  public load(filename: string): void {
    var image = new Image();
    image.onload = () => {
      this.width = image.width;
      this.height = image.height;
      var tempCanvas: HTMLCanvasElement = document.createElement("canvas");
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      var tempContext: CanvasRenderingContext2D = tempCanvas.getContext("2d")!;
      tempContext.drawImage(image, 0, 0, this.width, this.height);
      this.buffer = tempContext.getImageData(
        0,
        0,
        this.width,
        this.height
      ).data;
    };
    image.src = filename;
  }

  public value(u: number, v: number, point: Point3): Color3 {
    if (this.buffer) {
      var u = Math.abs((u * this.width) % this.width) >> 0;
      var v = Math.abs(((1 - v) * this.height) % this.height) >> 0;

      var idx = (u + v * this.width) * 4;

      var r = this.buffer[idx];
      var g = this.buffer[idx + 1];
      var b = this.buffer[idx + 2];

      return new Color3(r / 255.0, g / 255.0, b / 255.0);
    } else {
      return Color3.CYAN; // for debugging
    }
  }
}

export class NoiseTexture implements Texture {
  value(u: number, v: number, point: Point3): Color3 {
    throw new Error("Method not implemented.");
  }
}
