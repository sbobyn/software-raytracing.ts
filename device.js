import { Color3 } from "./color.js";
import { Ray } from "./ray.js";
import { Vec3, Point3 } from "./vector.js";
import { Camera } from "./camera.js";
import { HittableList } from "./hittable.js";
import { Sphere } from "./sphere.js";
import { Dielectric, Diffuse, DiffuseLight, Metal, } from "./material.js";
import { randomInRange } from "./utils.js";
import ImageTexture, { CheckerTextureXYZ, NoiseTexture, SolidColor, } from "./texture.js";
import { Quad } from "./quad.js";
import { BVHNode } from "./bvh.js";
var Device = /** @class */ (function () {
    function Device(canvas) {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        this.context = canvas.getContext("2d", { willReadFrequently: true });
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
    Device.prototype.changeScene = function (sceneName) {
        var scene;
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
    };
    Device.prototype.changeMaxDepth = function (newDepth) {
        this.maxDepth = newDepth;
    };
    Device.prototype.changeHeight = function (newHeight) {
        this.height = newHeight;
        this.canvas.height = newHeight;
        this.width = Math.floor(newHeight * this.aspectRatio);
        this.canvas.width = this.width;
        this.camera.updateAspectRatio(this.width / this.height);
        this.clear();
    };
    Device.prototype.changeFOV = function (newValue) {
        this.camera.updateFOV(newValue);
    };
    Device.prototype.changeNumSamples = function (newNum) {
        this.numSamples = newNum;
    };
    Device.prototype.changeProgressRenderingWindowSize = function (newWindowLength) {
        this.maxProgressiveSamples = newWindowLength;
    };
    Device.prototype.toggleGammaCorrection = function () {
        this.gammaCorrectionEnabled = !this.gammaCorrectionEnabled;
    };
    Device.prototype.moveCamera = function (direction, deltaTime) {
        this.camera.lookfrom.plusEquals(direction.scale(this.camera.moveSpeed * deltaTime));
        this.cameraMoving = true;
    };
    Device.prototype.rotateCamera = function (deltaU, deltaV) {
        var currLookAt = this.camera.lookfrom.add(this.camera.lookdir);
        var newLookAt = currLookAt
            .add(this.camera.u.scale(deltaU))
            .add(this.camera.v.scale(-deltaV));
        this.camera.lookAt(newLookAt);
        this.cameraMoving = true;
    };
    Device.prototype.clear = function () {
        // clear canvas with black
        this.context.clearRect(0, 0, this.width, this.height);
        // flush cleared front buffer into back buffer
        this.backbuffer = this.context.getImageData(0, 0, this.width, this.height);
    };
    // once everything ready, flush the back buffer into the front
    Device.prototype.present = function () {
        this.context.putImageData(this.backbuffer, 0, 0);
    };
    // write color to position (x,y) of the back buffer
    Device.prototype.writePixel = function (x, y, color) {
        var index = (Math.floor(x) + Math.floor(y) * this.width) * 4;
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
    };
    // progressive rendering
    // accumulate rays over time
    Device.prototype.writePixelProgressive = function (x, y, color) {
        var index = (Math.floor(x) + Math.floor(y) * this.width) * 4;
        var prevR = this.backbuffer.data[index];
        var prevG = this.backbuffer.data[index + 1];
        var prevB = this.backbuffer.data[index + 2];
        // gamma correction
        if (this.gammaCorrectionEnabled) {
            color.r = this.linearToGamma(color.r);
            color.g = this.linearToGamma(color.g);
            color.b = this.linearToGamma(color.b);
        }
        var newR = this.prevFrameWeight * prevR + this.newFrameWeight * color.r * 255;
        var newG = this.prevFrameWeight * prevG + this.newFrameWeight * color.g * 255;
        var newB = this.prevFrameWeight * prevB + this.newFrameWeight * color.b * 255;
        this.backbuffer.data[index] = newR;
        this.backbuffer.data[index + 1] = newG;
        this.backbuffer.data[index + 2] = newB;
        this.backbuffer.data[index + 3] = 1 * 255;
    };
    // approximation of gamma correction using gamma=2
    Device.prototype.linearToGamma = function (linearValue) {
        return Math.sqrt(linearValue);
    };
    Device.prototype.pixelOffset = function (pixeldu, pixeldv) {
        var sx = -0.5 + Math.random();
        var sy = -0.5 + Math.random();
        return pixeldu.scale(sx).add(pixeldv.scale(sy));
    };
    Device.prototype.render = function () {
        if (!this.cameraMoving) {
            this.numProgressiveSamples = Math.min(this.numProgressiveSamples + 1, this.maxProgressiveSamples);
            this.newFrameWeight = 1 / this.numProgressiveSamples;
            this.prevFrameWeight = 1 - this.newFrameWeight;
        }
        else {
            this.numProgressiveSamples = 0;
        }
        var viewportU = this.camera.u.scale(this.camera.viewportWidth);
        var viewportV = this.camera.v.scale(-this.camera.viewportHeight);
        // distance to next pixel
        var pixeldeltaU = viewportU.scale(1 / this.width);
        var pixeldeltaV = viewportV.scale(1 / this.height);
        var viewportUpperLeft = this.camera.lookfrom
            .add(this.camera.lookdir.scale(this.camera.focalLength))
            .subtract(viewportU.scale(0.5))
            .subtract(viewportV.scale(0.5));
        var pixel_00 = viewportUpperLeft.add(pixeldeltaU.add(pixeldeltaV).scale(0.5));
        var pixel_ij;
        var ray = new Ray(this.camera.lookfrom, new Vec3(0, 0, 0)); // initial dir is a placeholder
        var pixelColor;
        var numRays = this.numSamples;
        for (var j = 0; j < this.height; j++) {
            pixel_ij = pixel_00.add(pixeldeltaV.scale(j));
            for (var i = 0; i < this.width; i++) {
                pixelColor = new Color3(0, 0, 0);
                pixel_ij.plusEquals(pixeldeltaU);
                ray.dir = pixel_ij.subtract(this.camera.lookfrom);
                pixelColor.plusEquals(this.camera.rayColor(ray, this.scene, this.maxDepth));
                for (var sample = 1; sample < numRays; sample++) {
                    ray.dir = pixel_ij.subtract(this.camera.lookfrom);
                    ray.dir.plusEquals(this.pixelOffset(pixeldeltaU, pixeldeltaV));
                    pixelColor.plusEquals(this.camera.rayColor(ray, this.scene, this.maxDepth));
                }
                if (this.cameraMoving)
                    this.writePixel(i, j, pixelColor.scaled(1.0 / numRays));
                else
                    this.writePixelProgressive(i, j, pixelColor.scaled(1.0 / numRays));
            }
        }
        this.cameraMoving = false;
    };
    // ---------- Scenes ----------------------------------------
    Device.prototype.whitted1980Scene = function () {
        var scene = new HittableList();
        var groundTexture = new Diffuse(new CheckerTextureXYZ(Color3.RED, Color3.YELLOW, 0.5));
        var leftBallTex = new Metal(new SolidColor(Color3.WHITE.scale(0.8)), 0.1);
        var glassTex = new Dielectric(1.5);
        var lightTex = new DiffuseLight(new SolidColor(new Color3(1, 1, 1)));
        scene.add(new Quad(new Point3(5, 0, 5), // Adjusted position for the light source
        new Vec3(-10, 0, 0), new Vec3(0, 0, -10), groundTexture));
        scene.add(new Sphere(new Point3(2, 10, 7), 2, lightTex));
        scene.add(new Sphere(new Point3(0, 1.5, 0), 1, leftBallTex));
        scene.add(new Sphere(new Point3(1.5, 2.3, 1.3), 1, glassTex));
        scene.add(new Sphere(new Point3(1.5, 2.3, 1.3), -0.9, glassTex));
        this.camera.background = new Color3(0.05, 0.1, 0.25);
        this.camera.lookfrom = new Point3(1.5, 2.4, 4);
        this.camera.lookAt(new Point3(1.5, 2, 1));
        this.maxDepth = 6;
        return scene;
    };
    Device.prototype.emptyCornellBoxScene = function () {
        var scene = new HittableList();
        var red = new Diffuse(new SolidColor(new Color3(0.65, 0.05, 0.05)));
        var white = new Diffuse(new SolidColor(new Color3(0.73, 0.73, 0.73)));
        var green = new Diffuse(new SolidColor(new Color3(0.12, 0.45, 0.15)));
        var light = new DiffuseLight(new SolidColor(new Color3(2, 2, 2)));
        // left
        scene.add(new Quad(new Point3(-2, 0, 0), new Vec3(0, 4, 0), new Vec3(0, 0, -4), green));
        //right
        scene.add(new Quad(new Point3(2, 0, -4), new Vec3(0, 4, 0), new Vec3(0, 0, 4), red));
        // ceiling
        scene.add(new Quad(new Point3(-2, 4, 0), // Adjusted position for the light source
        new Vec3(4, 0, 0), new Vec3(0, 0, -4), white));
        // ceiling light
        scene.add(new Quad(new Point3(-2, 3.99, 0), // Adjusted position for the light source
        new Vec3(4, 0, 0), new Vec3(0, 0, -4), light));
        // floor
        scene.add(new Quad(new Point3(2, 0, 0), // Adjusted position for the light source
        new Vec3(-4, 0, 0), new Vec3(0, 0, -4), white));
        // back wall
        scene.add(new Quad(new Point3(2, 0, -4), // Adjusted position for the light source
        new Vec3(-4, 0, 0), new Vec3(0, 4, 0), white));
        this.camera.background = new Color3(0.01, 0.01, 0.01);
        this.camera.lookfrom = new Point3(0, 2, 6);
        this.camera.lookAt(new Point3(0, 2, 0));
        this.camera.updateFOV(40);
        return scene;
    };
    Device.prototype.simpleLightScene = function () {
        this.camera.background = new Color3(0.001, 0.001, 0.001);
        this.camera.lookfrom = new Point3(26, 3, 6);
        this.camera.lookAt(new Point3(0, 2, 0));
        this.camera.updateFOV(20);
        var scene = new HittableList();
        var perText = new NoiseTexture(4);
        scene.add(new Sphere(new Point3(0, -1000, 0), 1000, new Diffuse(perText)));
        scene.add(new Sphere(new Point3(0, 2, 0), 2, new Diffuse(perText)));
        var difflight = new DiffuseLight(new SolidColor(new Color3(4, 4, 4)));
        scene.add(new Sphere(new Point3(0, 7, 0), 2, difflight));
        scene.add(new Quad(new Point3(3, 1, -2), new Vec3(2, 0, 0), new Vec3(0, 2, 0), difflight));
        return scene;
    };
    Device.prototype.perlinScene = function () {
        this.camera.lookfrom = new Point3(26, 3, 6);
        this.camera.lookAt(new Point3(0, 2, 0));
        this.camera.updateFOV(20);
        this.camera.background = new Color3(0.001, 0.001, 0.001);
        var scene = new HittableList();
        var perText = new NoiseTexture(4);
        var light = new DiffuseLight(new SolidColor(new Color3(4, 4, 4)));
        scene.add(new Sphere(new Point3(0, -1000, 0), 1000, new Diffuse(perText)));
        scene.add(new Sphere(new Point3(0, 2, 0), 2, new Diffuse(perText)));
        scene.add(new Quad(new Point3(3, 1, -2), new Vec3(2, 0, 0), new Vec3(0, 2, 0), light));
        scene.add(new Sphere(new Point3(0, 7, 0), 2, light));
        return scene;
    };
    Device.prototype.simpleQuadsScene = function () {
        this.camera.lookfrom = new Point3(0, 0, 9);
        this.camera.lookAt(new Point3(0, 0, 0));
        var scene = new HittableList();
        // Materials
        var left_red = new Diffuse(new SolidColor(new Color3(1.0, 0.2, 0.2)));
        var back_green = new Diffuse(new SolidColor(new Color3(0.2, 1.0, 0.2)));
        var right_blue = new Diffuse(new SolidColor(new Color3(0.2, 0.2, 1.0)));
        var upper_orange = new Diffuse(new SolidColor(new Color3(1.0, 0.5, 0.0)));
        var lower_teal = new Diffuse(new SolidColor(new Color3(0.2, 0.8, 0.8)));
        // Quads
        scene.add(new Quad(new Point3(-3, -2, 5), new Vec3(0, 0, -4), new Vec3(0, 4, 0), left_red));
        scene.add(new Quad(new Point3(-2, -2, 0), new Vec3(4, 0, 0), new Vec3(0, 4, 0), back_green));
        scene.add(new Quad(new Point3(3, -2, 1), new Vec3(0, 0, 4), new Vec3(0, 4, 0), right_blue));
        scene.add(new Quad(new Point3(-2, 3, 1), new Vec3(4, 0, 0), new Vec3(0, 0, 4), upper_orange));
        scene.add(new Quad(new Point3(-2, -3, 5), new Vec3(4, 0, 0), new Vec3(0, 0, -4), lower_teal));
        return scene;
    };
    Device.prototype.in1WkndScene = function (numBalls) {
        var scene = new HittableList();
        for (var a = -numBalls; a < numBalls; a++) {
            for (var b = -numBalls; b < numBalls; b++) {
                var chooseMat = Math.random();
                var center = new Point3(2 * a + 2 * Math.random(), 0.2, 2 * b + 2 * Math.random());
                if (center.subtract(new Point3(4, 0.2, 0)).length() > 0.9) {
                    var sphereMat = void 0;
                    if (chooseMat < 0.8) {
                        // diffuse
                        var albedo = Color3.random().mul(Color3.random());
                        sphereMat = new Diffuse(new SolidColor(albedo));
                        scene.add(new Sphere(center, 0.2, sphereMat));
                    }
                    else if (chooseMat < 0.95) {
                        // metal
                        var albedo = Color3.random(0.5, 1);
                        var roughness = randomInRange(0, 0.5);
                        sphereMat = new Metal(new SolidColor(albedo), roughness);
                        scene.add(new Sphere(center, 0.2, sphereMat));
                    }
                    else {
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
        var groundMat = new Diffuse(new SolidColor(new Color3(0.5, 0.5, 0.5)));
        var centerMat = new Dielectric(1.5);
        // let leftMat = new Diffuse(new SolidColor(new Color3(0.4, 0.2, 0.1)));
        var leftMat = new Diffuse(new ImageTexture("./earthmap.jpg"));
        var rightMat = new Metal(new SolidColor(new Color3(0.7, 0.6, 0.5)), 0.0);
        scene.add(new Sphere(new Point3(0, -1000, -1), 1000, groundMat));
        scene.add(new Sphere(new Point3(0, 1, 0), 1, centerMat));
        scene.add(new Sphere(new Point3(4, 1, 0), 1, rightMat));
        scene.add(new Sphere(new Point3(-4, 1, -0), 1, leftMat));
        this.camera = new Camera(90, this.width / this.height, 1);
        this.camera.lookfrom = new Point3(5, 2, 3);
        this.camera.lookAt(new Point3(0, 0, -1));
        this.camera.background = Color3.SKY_BLUE;
        return scene;
    };
    return Device;
}());
export { Device };
export var Scene;
(function (Scene) {
    Scene[Scene["WkndReduced"] = 0] = "WkndReduced";
    Scene[Scene["Wknd"] = 1] = "Wknd";
    Scene[Scene["Whitted1980"] = 2] = "Whitted1980";
    Scene[Scene["Textures"] = 3] = "Textures";
    Scene[Scene["PerlinLights"] = 4] = "PerlinLights";
    Scene[Scene["CornellEmpty"] = 5] = "CornellEmpty";
    Scene[Scene["Cornell"] = 6] = "Cornell";
    Scene[Scene["Wknd2"] = 7] = "Wknd2";
})(Scene || (Scene = {}));
