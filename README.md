# TODO

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

## UI

- scenes
  - scene loading
  - random scene
  - scene editor (add / remove objects, lights)
- bounce depth
- number of rays per pixel
- number of reflected rays
- camera settings
  - fov
  - focal length

## Accumulating samples over time

- improve performance by averaging samples over time instead of clearing the canvas every frame
- 'progressive rendering'

## Denoising

- reduce noise / surface acne
- reduce spatio-temporal noise

## Optimizations

- profile code
- reduce memory allocations (lots due to vector implementation)

## Other experiments

- experiment with carmack fast inverse square
- skybox texturing with object reflections
- scene graphs
- .obj loading
- .mtl loading
