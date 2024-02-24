export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// returns float between min (inclusive) and max (exclusive)
export function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
