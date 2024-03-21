import { Color3 } from "./color.js";
import { Perlin } from "./perlin.js";
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
    let xi = Math.floor(this.invScale * point.x);
    let yi = Math.floor(this.invScale * point.y);
    let zi = Math.floor(this.invScale * point.z);

    let isEven = (xi + yi + zi) % 2 == 0;
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
    let image = new Image();
    image.onload = () => {
      this.width = image.width;
      this.height = image.height;
      let tempCanvas: HTMLCanvasElement = document.createElement("canvas");
      tempCanvas.width = this.width;
      tempCanvas.height = this.height;
      let tempContext: CanvasRenderingContext2D = tempCanvas.getContext("2d")!;
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
      u = Math.abs((u * this.width) % this.width) >> 0;
      v = Math.abs(((1 - v) * this.height) % this.height) >> 0;

      let idx = (u + v * this.width) * 4;

      let r = this.buffer[idx];
      let g = this.buffer[idx + 1];
      let b = this.buffer[idx + 2];

      return new Color3(r / 255.0, g / 255.0, b / 255.0);
    } else {
      return Color3.CYAN; // for debugging
    }
  }
}

export class NoiseTexture implements Texture {
  noise: Perlin;
  scale: number;

  constructor(scale: number) {
    this.noise = new Perlin();
    this.scale = scale;
  }

  value(u: number, v: number, point: Point3): Color3 {
    let s = point.scale(this.scale);
    return Color3.WHITE.scale(
      0.5 * (1.0 + Math.sin(s.z + 10 * this.noise.turb(s)))
    );
  }
}
