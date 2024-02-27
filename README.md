# TODO

## UI

- scenes
  - scene loading
    - random ball scene
    - textured random ball scene
    - cornell box
    - in one weekend pt 2 scene
    - bouncing balls
      - motion blur
  - scene editor
    - add/remove objects, lights
    - move objects
    - apply materials
    - material editor
    - click on objects
      - drag and move
      - open material editor
  - move lights
- camera settings
  - defocus blur toggle / distance
- BVH - toggle visualization of BVH

## Ray tracing in one weekend

### Part 1

- defocus blur / depth of field
  - 2 implementation options
    - slow but accurate: physically simulate by sampling ray origins
    - fast but inaccurate: apply a post processing blur convolution
      - cast ray to find distance to first intersection, blur things not on the camera plane
      - use a shader

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

## Post Processing Effects

Certain properties are expensive to brute force simulate (defocus blur, motion blur,)

- can get similar visual results using simple post processing effects

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
- value tables
  - pre compute values to avoid recomputing all the time

## Other experiments

- experiment with carmack fast inverse square
- skybox texturing with object reflections
- scene graphs
- .obj loading
- .mtl loading
