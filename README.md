# TODO

## UI

- bounce depth
- gamma correction toggle
- anti aliasing toggle
- scenes
  - scene loading
  - random scene
  - scene editor (add / remove objects, lights)
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

## Accumulating samples over time

- improve performance by averaging samples over time instead of clearing the canvas every frame
- 'progressive rendering'

## Denoising

- reduce noise / surface acne
- reduce spatio-temporal noise

## Optimizations

- profile code
- reduce memory allocations (lots due to vector implementation)
- remove recursion
- parallelize pixel computations
- replace vector math with fast impl

## Other experiments

- experiment with carmack fast inverse square
- skybox texturing with object reflections
- scene graphs
- .obj loading
- .mtl loading
