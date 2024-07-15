import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { App } from '../base/App/App';
import { MainScene } from './scenes/MainScene';
import { DepthPeelingRenderPass } from '../base/DepthPeeling/DepthPeelingRenderPass';

/**
 * https://github.com/ingun37/threejs-depth-peeling-demo
 */
class AppDepthPeeling extends App<MainScene> {
  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    super({ canvas });

    DepthPeelingRenderPass.patch(this.scene.object1);
    DepthPeelingRenderPass.patch(this.scene.object2);

    this.scene.background = new THREE.Color("white");
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

  public override createRenderPipeline(): void {
    const renderPass = new DepthPeelingRenderPass(this.scene, this.camera);
    this.effectComposer.addPass(renderPass);
  }
}

export { AppDepthPeeling };
