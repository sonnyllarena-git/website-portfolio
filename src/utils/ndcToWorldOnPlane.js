import { Plane, Raycaster, Vector2, Vector3 } from 'three';

// A dedicated Raycaster/Plane, separate from any scene's useThree().raycaster
// (which R3F's own pointer-event hit-testing also drives) — reusing that
// shared instance from inside a useFrame would risk contending with pointer
// events mid-frame. Safe to reuse as module-level scratch since every call
// here is synchronous, single-threaded, and fully consumes the result before
// returning.
const scratchRaycaster = new Raycaster();
const scratchNDC = new Vector2();
const scratchPlane = new Plane(new Vector3(0, 0, 1), 0);

// Casts a ray from `camera` through NDC point (x,y in [-1,1]) and returns
// where it crosses the world plane z = planeZ, writing into `out`. Returns
// null (ray parallel to the plane) on the rare case intersectPlane can't
// resolve a point — callers should keep whatever value `out` held before.
export function ndcToWorldOnPlane(ndcX, ndcY, camera, planeZ, out = new Vector3()) {
  scratchNDC.set(ndcX, ndcY);
  scratchRaycaster.setFromCamera(scratchNDC, camera);
  scratchPlane.constant = -planeZ;
  return scratchRaycaster.ray.intersectPlane(scratchPlane, out);
}

// Same, but starting from a real screen pixel + the target canvas's pixel
// size, for converting a DOM measurement (e.g. the navbar/footer's real
// on-screen edges) into a given camera's world space.
export function pixelToWorldOnPlane(px, py, canvasWidth, canvasHeight, camera, planeZ, out = new Vector3()) {
  const ndcX = (px / canvasWidth) * 2 - 1;
  const ndcY = -(py / canvasHeight) * 2 + 1;
  return ndcToWorldOnPlane(ndcX, ndcY, camera, planeZ, out);
}
