import { Color4 } from "./color.js";

export class Device {
  // the back buffer size is equal to the number of pixels
  // to draw on screen (width * height) * 4 (RGBA values)
  private backbuffer: ImageData;
  private context: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d", { willReadFrequently: true })!;
    this.backbuffer = this.context.getImageData(0, 0, this.width, this.height);
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
  public writePixel(x: number, y: number, color: Color4): void {
    // compute stride, >> 0 acts as a floor operator
    var index: number = ((x >> 0) + (y >> 0) * this.width) * 4;

    this.backbuffer.data[index] = color.r * 255;
    this.backbuffer.data[index + 1] = color.g * 255;
    this.backbuffer.data[index + 2] = color.b * 255;
    this.backbuffer.data[index + 3] = color.a * 255;
  }

  public render() {
    for (var i = 0; i < this.width; i++) {
      for (var j = 0; j < this.height; j++) {
        this.writePixel(
          i,
          j,
          new Color4(
            0.8 + 0.1 * ((i + j) % 2),
            0.8 + 0.1 * ((i + j) % 2),
            0.8 + 0.1 * ((i + j) % 2),
            1
          )
        );
      }
    }
  }
}
