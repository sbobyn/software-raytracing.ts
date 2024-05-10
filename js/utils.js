export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}
// returns float between min (inclusive) and max (exclusive)
export function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}
// random int between 0 (inclusive) and max (exlusive)
export function randomInt(max) {
    return Math.floor(Math.random() * max);
}
