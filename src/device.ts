import { Color3 } from "./color.js";
import { Ray } from "./ray.js";
import { Vec3, Point3 } from "./vector.js";
import { Camera } from "./camera.js";
import { HittableList } from "./hittable.js";
import { Sphere } from "./sphere.js";
import {
  Dielectric,
  Diffuse,
  DiffuseLight,
  Material,
  Metal,
} from "./material.js";
import { randomInRange } from "./utils.js";
import ImageTexture, {
  CheckerTextureXYZ,
  NoiseTexture,
  SolidColor,
} from "./texture.js";
import { Quad } from "./quad.js";
import { BVHNode } from "./bvh.js";

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
  private maxProgressiveSamples: number;
  private numProgressiveSamples: number;

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

    this.maxDepth = 4;
    this.numSamples = 1;
    this.prevFrameWeight = 0.0;
    this.newFrameWeight = 1.0;
    this.gammaCorrectionEnabled = true;
    this.cameraMoving = false;
    this.maxProgressiveSamples = 30;
    this.numProgressiveSamples = 0;

    this.scene = new HittableList();
    this.scene.add(BVHNode.fromHittableList(this.in1WkndScene(3)));
  }

  changeScene(sceneName: Scene) {
    let scene: HittableList;
    switch (sceneName) {
      case Scene.WkndReduced:
        scene = this.in1WkndScene(3);
        break;
      case Scene.Wknd:
        scene = this.in1WkndScene(10);
        break;
      case Scene.Whitted1980:
        scene = this.whitted1980Scene();
        break;
      // case Scene.Textures:

      case Scene.PerlinLights:
        scene = this.perlinScene();
        break;
      case Scene.CornellEmpty:
        scene = this.emptyCornellBoxScene();
        break;
      // case Scene.Cornell:

      // case Scene.Wknd2:

      default:
        scene = this.in1WkndScene(3);
    }

    this.scene = new HittableList();
    this.scene.add(BVHNode.fromHittableList(scene));
    this.clear();
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
    this.backbuffer = this.context.getImageData(0, 0, this.width, this.height);
    this.clear();
  }

  public changeFOV(newValue: number) {
    this.camera.updateFOV(newValue);
    this.clear();
  }

  public changeNumSamples(newNum: number) {
    this.numSamples = newNum;
  }

  public changeProgressRenderingWindowSize(newWindowLength: number) {
    this.maxProgressiveSamples = newWindowLength;
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
    this.backbuffer.data.fill(0);
  }

  // once everything ready, flush the back buffer into the front
  public present() {
    this.context.putImageData(this.backbuffer, 0, 0);
  }

  // write color to position (x,y) of the back buffer
  public writePixel(x: number, y: number, color: Color3): void {
    let index: number = (Math.floor(x) + Math.floor(y) * this.width) * 4;

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
    let index: number = (Math.floor(x) + Math.floor(y) * this.width) * 4;

    let prevR = this.backbuffer.data[index];
    let prevG = this.backbuffer.data[index + 1];
    let prevB = this.backbuffer.data[index + 2];

    // gamma correction
    if (this.gammaCorrectionEnabled) {
      color.r = this.linearToGamma(color.r);
      color.g = this.linearToGamma(color.g);
      color.b = this.linearToGamma(color.b);
    }

    let newR =
      this.prevFrameWeight * prevR + this.newFrameWeight * color.r * 255;
    let newG =
      this.prevFrameWeight * prevG + this.newFrameWeight * color.g * 255;
    let newB =
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
    let sx = -0.5 + Math.random();
    let sy = -0.5 + Math.random();
    return pixeldu.scale(sx).add(pixeldv.scale(sy));
  }

  public render() {
    if (!this.cameraMoving) {
      this.numProgressiveSamples = Math.min(
        this.numProgressiveSamples + 1,
        this.maxProgressiveSamples
      );
      this.newFrameWeight = 1 / this.numProgressiveSamples;
      this.prevFrameWeight = 1 - this.newFrameWeight;
    } else {
      this.numProgressiveSamples = 0;
    }

    let viewportU = this.camera.u.scale(this.camera.viewportWidth);
    let viewportV = this.camera.v.scale(-this.camera.viewportHeight);

    // distance to next pixel
    let pixeldeltaU: Vec3 = viewportU.scale(1 / this.width);
    let pixeldeltaV: Vec3 = viewportV.scale(1 / this.height);

    let viewportUpperLeft = this.camera.lookfrom
      .add(this.camera.lookdir.scale(this.camera.focalLength))
      .subtract(viewportU.scale(0.5))
      .subtract(viewportV.scale(0.5));
    let pixel_00: Point3 = viewportUpperLeft.add(
      pixeldeltaU.add(pixeldeltaV).scale(0.5)
    );

    let pixel_ij: Point3;
    let ray = new Ray(this.camera.lookfrom, new Vec3(0, 0, 0)); // initial dir is a placeholder
    let pixelColor: Color3;
    let numRays = this.numSamples;
    for (let j = 0; j < this.height; j++) {
      pixel_ij = pixel_00.add(pixeldeltaV.scale(j));
      for (let i = 0; i < this.width; i++) {
        pixelColor = new Color3(0, 0, 0);
        pixel_ij.plusEquals(pixeldeltaU);

        ray.dir = pixel_ij.subtract(this.camera.lookfrom);
        pixelColor.plusEquals(
          this.camera.rayColor(ray, this.scene, this.maxDepth)
        );
        for (let sample = 1; sample < numRays; sample++) {
          ray.dir = pixel_ij.subtract(this.camera.lookfrom);
          ray.dir.plusEquals(this.pixelOffset(pixeldeltaU, pixeldeltaV));
          pixelColor.plusEquals(
            this.camera.rayColor(ray, this.scene, this.maxDepth)
          );
        }
        if (this.cameraMoving)
          this.writePixel(i, j, pixelColor.scaled(1.0 / numRays));
        else this.writePixelProgressive(i, j, pixelColor.scaled(1.0 / numRays));
      }
    }
    this.cameraMoving = false;
  }

  // ---------- Scenes ----------------------------------------

  private whitted1980Scene(): HittableList {
    const scene = new HittableList();

    const groundTexture = new Diffuse(
      new CheckerTextureXYZ(Color3.RED, Color3.YELLOW, 0.5)
    );
    const leftBallTex = new Metal(new SolidColor(Color3.WHITE.scale(0.8)), 0.1);
    const glassTex = new Dielectric(1.5);
    const lightTex = new DiffuseLight(new SolidColor(new Color3(1, 1, 1)));

    scene.add(
      new Quad(
        new Point3(5, 0, 5), // Adjusted position for the light source
        new Vec3(-10, 0, 0),
        new Vec3(0, 0, -10),
        groundTexture
      )
    );
    scene.add(new Sphere(new Point3(2, 10, 7), 2, lightTex));
    scene.add(new Sphere(new Point3(0, 1.5, 0), 1, leftBallTex));
    scene.add(new Sphere(new Point3(1.5, 2.3, 1.3), 1, glassTex));
    scene.add(new Sphere(new Point3(1.5, 2.3, 1.3), -0.9, glassTex));

    this.camera.background = new Color3(0.05, 0.1, 0.25);

    this.camera.updateFOV(90);

    this.camera.lookfrom = new Point3(1.5, 2.4, 4);
    this.camera.lookAt(new Point3(1.5, 2, 1));

    this.maxDepth = 6;

    return scene;
  }

  private emptyCornellBoxScene(): HittableList {
    const scene = new HittableList();

    const red = new Diffuse(new SolidColor(new Color3(0.65, 0.05, 0.05)));
    const white = new Diffuse(new SolidColor(new Color3(0.73, 0.73, 0.73)));
    const green = new Diffuse(new SolidColor(new Color3(0.12, 0.45, 0.15)));
    const light = new DiffuseLight(new SolidColor(new Color3(2, 2, 2)));

    // left
    scene.add(
      new Quad(
        new Point3(-2, 0, 0),
        new Vec3(0, 4, 0),
        new Vec3(0, 0, -4),
        green
      )
    );
    //right
    scene.add(
      new Quad(new Point3(2, 0, -4), new Vec3(0, 4, 0), new Vec3(0, 0, 4), red)
    );
    // ceiling
    scene.add(
      new Quad(
        new Point3(-2, 4, 0), // Adjusted position for the light source
        new Vec3(4, 0, 0),
        new Vec3(0, 0, -4),
        white
      )
    );
    // ceiling light
    scene.add(
      new Quad(
        new Point3(-2, 3.99, 0), // Adjusted position for the light source
        new Vec3(4, 0, 0),
        new Vec3(0, 0, -4),
        light
      )
    );
    // floor
    scene.add(
      new Quad(
        new Point3(2, 0, 0), // Adjusted position for the light source
        new Vec3(-4, 0, 0),
        new Vec3(0, 0, -4),
        white
      )
    );
    // back wall
    scene.add(
      new Quad(
        new Point3(2, 0, -4), // Adjusted position for the light source
        new Vec3(-4, 0, 0),
        new Vec3(0, 4, 0),
        white
      )
    );

    this.camera.background = new Color3(0.01, 0.01, 0.01);

    this.camera.lookfrom = new Point3(0, 2, 6);
    this.camera.lookAt(new Point3(0, 2, 0));

    this.camera.updateFOV(40);

    return scene;
  }

  private simpleLightScene(): HittableList {
    this.camera.background = new Color3(0.001, 0.001, 0.001);
    this.camera.lookfrom = new Point3(26, 3, 6);
    this.camera.lookAt(new Point3(0, 2, 0));
    this.camera.updateFOV(20);

    let scene = new HittableList();

    let perText = new NoiseTexture(4);
    scene.add(new Sphere(new Point3(0, -1000, 0), 1000, new Diffuse(perText)));
    scene.add(new Sphere(new Point3(0, 2, 0), 2, new Diffuse(perText)));

    let difflight = new DiffuseLight(new SolidColor(new Color3(4, 4, 4)));

    scene.add(new Sphere(new Point3(0, 7, 0), 2, difflight));

    scene.add(
      new Quad(
        new Point3(3, 1, -2),
        new Vec3(2, 0, 0),
        new Vec3(0, 2, 0),
        difflight
      )
    );

    return scene;
  }

  private perlinScene(): HittableList {
    this.camera.lookfrom = new Point3(26, 3, 6);
    this.camera.lookAt(new Point3(0, 2, 0));
    this.camera.updateFOV(20);
    this.camera.background = new Color3(0.001, 0.001, 0.001);

    let scene = new HittableList();
    let perText = new NoiseTexture(4);
    let light = new DiffuseLight(new SolidColor(new Color3(4, 4, 4)));
    scene.add(new Sphere(new Point3(0, -1000, 0), 1000, new Diffuse(perText)));
    scene.add(new Sphere(new Point3(0, 2, 0), 2, new Diffuse(perText)));
    scene.add(
      new Quad(
        new Point3(3, 1, -2),
        new Vec3(2, 0, 0),
        new Vec3(0, 2, 0),
        light
      )
    );
    scene.add(new Sphere(new Point3(0, 7, 0), 2, light));

    return scene;
  }

  private simpleQuadsScene(): HittableList {
    this.camera.lookfrom = new Point3(0, 0, 9);
    this.camera.lookAt(new Point3(0, 0, 0));

    let scene = new HittableList();
    // Materials
    const left_red = new Diffuse(new SolidColor(new Color3(1.0, 0.2, 0.2)));
    const back_green = new Diffuse(new SolidColor(new Color3(0.2, 1.0, 0.2)));
    const right_blue = new Diffuse(new SolidColor(new Color3(0.2, 0.2, 1.0)));
    const upper_orange = new Diffuse(new SolidColor(new Color3(1.0, 0.5, 0.0)));
    const lower_teal = new Diffuse(new SolidColor(new Color3(0.2, 0.8, 0.8)));

    // Quads
    scene.add(
      new Quad(
        new Point3(-3, -2, 5),
        new Vec3(0, 0, -4),
        new Vec3(0, 4, 0),
        left_red
      )
    );
    scene.add(
      new Quad(
        new Point3(-2, -2, 0),
        new Vec3(4, 0, 0),
        new Vec3(0, 4, 0),
        back_green
      )
    );
    scene.add(
      new Quad(
        new Point3(3, -2, 1),
        new Vec3(0, 0, 4),
        new Vec3(0, 4, 0),
        right_blue
      )
    );
    scene.add(
      new Quad(
        new Point3(-2, 3, 1),
        new Vec3(4, 0, 0),
        new Vec3(0, 0, 4),
        upper_orange
      )
    );
    scene.add(
      new Quad(
        new Point3(-2, -3, 5),
        new Vec3(4, 0, 0),
        new Vec3(0, 0, -4),
        lower_teal
      )
    );

    return scene;
  }

  private in1WkndScene(numBalls: number): HittableList {
    let scene = new HittableList();
    for (let a = -numBalls; a < numBalls; a++) {
      for (let b = -numBalls; b < numBalls; b++) {
        let chooseMat = Math.random();
        let center = new Point3(
          2 * a + 2 * Math.random(),
          0.2,
          2 * b + 2 * Math.random()
        );

        if (center.subtract(new Point3(4, 0.2, 0)).length() > 0.9) {
          let sphereMat: Material;
          if (chooseMat < 0.8) {
            // diffuse
            let albedo = Color3.random().mul(Color3.random());
            sphereMat = new Diffuse(new SolidColor(albedo));
            scene.add(new Sphere(center, 0.2, sphereMat));
          } else if (chooseMat < 0.95) {
            // metal
            let albedo = Color3.random(0.5, 1);
            let roughness = randomInRange(0, 0.5);
            sphereMat = new Metal(new SolidColor(albedo), roughness);
            scene.add(new Sphere(center, 0.2, sphereMat));
          } else {
            // glass
            sphereMat = new Dielectric(1.5);
            scene.add(new Sphere(center, 0.2, sphereMat));
          }
        }
      }
    }

    // let groundMat = new Diffuse(
    //   new CheckerTextureXYZ(
    //     new Color3(0.2, 0.3, 0.1),
    //     new Color3(0.9, 0.9, 0.9),
    //     0.32
    //   )
    // );
    let groundMat = new Diffuse(new SolidColor(new Color3(0.5, 0.5, 0.5)));
    let centerMat = new Dielectric(1.5);
    // let leftMat = new Diffuse(new SolidColor(new Color3(0.4, 0.2, 0.1)));
    let leftMat = new Diffuse(new ImageTexture("./earthmap.jpg"));
    let rightMat = new Metal(new SolidColor(new Color3(0.7, 0.6, 0.5)), 0.0);

    scene.add(new Sphere(new Point3(0, -1000, -1), 1000, groundMat));
    scene.add(new Sphere(new Point3(0, 1, 0), 1, centerMat));
    scene.add(new Sphere(new Point3(4, 1, 0), 1, rightMat));
    scene.add(new Sphere(new Point3(-4, 1, -0), 1, leftMat));

    this.camera = new Camera(90, this.width / this.height, 1);
    this.camera.lookfrom = new Point3(5, 2, 3);
    this.camera.lookAt(new Point3(0, 0, -1));
    this.camera.background = Color3.SKY_BLUE;

    return scene;
  }
}

export enum Scene {
  WkndReduced,
  Wknd,
  Whitted1980,
  Textures,
  PerlinLights,
  CornellEmpty,
  Cornell,
  Wknd2,
}
