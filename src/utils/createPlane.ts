import * as THREE from 'three';

const createPlane = ({
  position,
  size,
  color
}: {
  position: THREE.Vector3Tuple,
  size: THREE.Vector2Tuple,
  color: number
}) => {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(...size),
    new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
    })
  );

  plane.position.set(...position);
  plane.rotation.x = THREE.MathUtils.degToRad(-90);

  return plane;
}

export { createPlane };
