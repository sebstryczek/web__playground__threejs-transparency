import * as THREE from 'three';
import { createPlane } from '../../utils/createPlane';

class MainScene extends THREE.Scene {
  #object1: THREE.Mesh;
  public get object1() {
    return this.#object1;
  }

  #object2: THREE.Mesh;
  public get object2() {
    return this.#object2;
  }

  constructor() {
    super();

    this.createLighting();
    const { object1, object2 } = this.createObjects();

    this.#object1 = object1;
    this.#object2 = object2;
  }

  private createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.intensity = 1;
    this.add(ambientLight);

    // const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    // directionalLight.position.set(1, 2, 3);
    // directionalLight.castShadow = true;
    // this.add(directionalLight);
  }

  private createObjects() {
    const object1 = createPlane({
      position: [0, 3, 0],
      size: [10, 10],
      color: 0x0000ff
    });
    object1.material.opacity = 0.1;
    this.add(object1);

    const object2 = createPlane({
      position: [0, 3, 0],
      size: [10, 10],
      color: 0x00ffff
    });
    object2.rotateX(THREE.MathUtils.degToRad(30));
    object2.material.opacity = 0.5;
    this.add(object2);

    const mapPlane = createPlane({
      position: [0, -5, 0],
      size: [100, 100],
      color: 0xffffff
    });

    const mapTexture = new THREE.TextureLoader().load('map.jpg', (texture) => {
      const ratio = texture.image.width / texture.image.height;
      mapPlane.scale.set(ratio, 1, 1);
    });

    mapPlane.material.map = mapTexture;
    this.add(mapPlane);


    return {
      object1,
      object2
    }
  }
}

export { MainScene };
