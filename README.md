# Realtime Software Raytracing

This is a simple realtime ray tracer following Peter Shirley's [Ray Tracing in One Weekend](https://raytracing.github.io/) series. The implementation is purely written in TypeScript and the rendering is purely written on the CPU (i.e. no graphics APIs). As such, it is extremely inefficient and low resolution, but it can still run in real time!

A live demo is available [here](https://sbobyn.github.io/software-raytracing.ts/)

![Demo gif](./screenshots/1wknd.gif)

# Sample Renders

![Sample Renders](./screenshots/samples.png)

# Features

- pretty closely follows the first 2 books of the Ray Tracing in One Weekend series

  - sphere, quad ray tracing
  - textures
  - lighting
  - BVH
  - more

- additions
  - realtime rendering via the HTML canvas API
  - progressive rendering window when camera is stationary

# To do

- In One Weekend Book 3
- high resolution offline render. Could do it w/o blocking UI on a background thread but need some restructuring
- GPU-based version with WebGL
