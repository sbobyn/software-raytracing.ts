# TODO

## UI

- gamma correction toggle
- anti aliasing toggle
- scenes
  - scene loading
    - random ball scene
    - textured random ball scene
    - cornell box
    - in one weekend pt 2 scene
  - scene editor
    - add/remove objects, lights
    - move objects
    - apply materials
    - material editor
    - click on objects
      - drag and move
      - open material editor
  - move lights
- number of rays per pixel
- number of reflected rays
- camera settings
  - fov
  - focal length

## Ray tracing in one weekend

### Part 1

- anti-aliasing
- multiple rays per pixel
- basic lighting
- ray scattering
- different materials
  - diffuse
  - metal
  - solid glass
  - hollow glass
- defocus blur

### Part 2

- motion blur
- textures
- BVH
- quads
- emmisive materials
- volumes

### part 3

Survey / intro to advanced techinques

- monte carlo
- scattering
- bases
- sampling

## Lighting

Experiment with different types of lights

- point
- area
- spotlight
- cone

## Progressive Rendering

- accumulate samples across different threads on each frame computation

## Denoising

- reduce noise / surface acne
- reduce spatio-temporal noise

## Optimizations

- profile code
- reduce memory allocations (lots due to vector implementation)
- remove recursion
- parallelize pixel computations
  - CPU multithreading: get N images from N threads and average
  - GPU multithreading: compute each pixel's color in parallel or each ray in parallel
- replace vector math with fast impl

## Other experiments

- experiment with carmack fast inverse square
- skybox texturing with object reflections
- scene graphs
- .obj loading
- .mtl loading
