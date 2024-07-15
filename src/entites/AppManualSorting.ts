import * as THREE from 'three';

import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { App } from '../base/App/App';
import { MainScene } from './scenes/MainScene';

class AppManualSorting extends App<MainScene> {
  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    super({ canvas });

    this.scene.background = new THREE.Color("white");

    if (this.scene.object1.material instanceof THREE.Material === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    if (this.scene.object2.material instanceof THREE.Material === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    this.scene.object1.material.depthWrite = false;
    this.scene.object1.renderOrder = 1;
    this.scene.object2.material.depthWrite = false;
    this.scene.object2.renderOrder = 2;
  }

  protected createCamera(): THREE.PerspectiveCamera {
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 100);
    camera.position.set(10, 10, 10);

    return camera;
  }

  protected createControls(): MapControls {
    const controls = new MapControls(this.camera, this.canvas);
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 500;

    return controls;
  }

  protected createScene() {
    return new MainScene();
  }

  public setOpacity1(value: number) {
    if (this.scene.object1.material instanceof THREE.Material === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    this.scene.object1.material.opacity = value;
  }

  public setOpacity2(value: number) {
    if (this.scene.object2.material instanceof THREE.Material === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    this.scene.object2.material.opacity = value;
  }

  private sphere: THREE.Object3D = new THREE.Mesh(
    new THREE.SphereGeometry(0.5),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );

  protected override render(): void {
    let closestObject: THREE.Object3D = this.scene.object1;
    const lastClosestVertex = new THREE.Vector3();
    [this.scene.object1, this.scene.object2].forEach((object) => {

      const vertices: Array<THREE.Vector3> = [];
      const verticesAmount = object.geometry.attributes.position.count;
      for (let i = 0; i < verticesAmount; i++) {
        const x = object.geometry.attributes.position.getX(i);
        const y = object.geometry.attributes.position.getY(i);
        const z = object.geometry.attributes.position.getZ(i);

        const vertex = new THREE.Vector3(x, y, z);
        vertex.applyMatrix4(object.matrixWorld);
        vertices.push(vertex);
      }

      let closestVertex = vertices[0];
      for (let i = 0; i < vertices.length; i++) {
        if (vertices[i].distanceTo(this.camera.position) < closestVertex.distanceTo(this.camera.position)) {
          closestVertex = vertices[i];
        }
      }

      // if (this.sphere.parent === null) {
      //   this.scene.add(this.sphere);
      // }


      if (lastClosestVertex.distanceTo(this.camera.position) > closestVertex.distanceTo(this.camera.position)) {
        lastClosestVertex.copy(closestVertex);
        closestObject = object;
      }
    });


    this.sphere.position.copy(lastClosestVertex);

    if (closestObject === this.scene.object1) {
      this.scene.object1.renderOrder = 2;
      this.scene.object2.renderOrder = 1;
    } else {
      this.scene.object1.renderOrder = 1;
      this.scene.object2.renderOrder = 2;
    }


    this.effectComposer.render();
  }
}

export { AppManualSorting };
