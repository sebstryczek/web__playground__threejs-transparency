// @ts-ignore Package `three-wboit` has no exported types
import { MeshWboitMaterial } from 'three-wboit';
// @ts-ignore Package `three-wboit` has no exported types
import { WboitPass, WboitUtils } from 'three-wboit';


import * as THREE from 'three';
import { App } from '../base/App';
import { MainScene } from './scenes/MainScene';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';

/**
 * https://github.com/stevinz/three-wboit
 */
class AppWBOIT extends App<MainScene> {
  private wboitPass: WboitPass;

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    super({ canvas });

    canvas.style.backgroundColor = "black";

    this.renderer.autoClear = false;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    if (this.scene.object1.material instanceof THREE.MeshStandardMaterial === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    if (this.scene.object2.material instanceof THREE.MeshStandardMaterial === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    const wboitMaterial = new MeshWboitMaterial() as THREE.MeshBasicMaterial & { weight: number };

    const material1 = wboitMaterial.clone();
    material1.weight = 1;
    material1.side = THREE.DoubleSide;
    material1.color = this.scene.object1.material.color;
    this.scene.object1.material.dispose();
    this.scene.object1.material = material1;

    const material2 = wboitMaterial.clone();
    material2.weight = 1;
    material2.side = THREE.DoubleSide;
    material2.color = this.scene.object2.material.color;
    this.scene.object2.material.dispose();
    this.scene.object2.material = material2;


    const material3 = wboitMaterial.clone();
    material3.weight = 1;
    material3.side = THREE.DoubleSide;
    material3.map = this.scene.mapPlane.material.map;
    material3.opacity = 0.5;
    this.scene.mapPlane.material.dispose();
    this.scene.mapPlane.material = material3;
    this.scene.mapPlane.position.setY(10)
    // WboitUtils.patch(this.scene.mapPlane.material)
    // this.scene.mapPlane.material.opacity = 0.2

    const wboitPass = new WboitPass(this.renderer, this.scene, this.camera, 0xffffff, 1);
    this.wboitPass = wboitPass;
    this.wboitPass.setSize(this.canvas.width, this.canvas.height);

    // this.scene.background = new THREE.Color("white");
  }

  public createRenderPipeline(): void {
    const wboitPass = new WboitPass(this.renderer, this.scene, this.camera);
    wboitPass.setSize(this.canvas.width, this.canvas.height);
    wboitPass.clearColor = new THREE.Color("white");
    this.effectComposer.addPass(wboitPass);

    const copyPass = new ShaderPass(CopyShader);
    this.effectComposer.addPass(copyPass);
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
    this.scene.object1.material.needsUpdate = true;

    if (value === 1) {
      this.scene.object1.material.transparent = false;
    } else {
      this.scene.object1.material.transparent = true;
    }
  }

  public setOpacity2(value: number) {
    if (this.scene.object2.material instanceof THREE.Material === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    this.scene.object2.material.opacity = value;
    this.scene.object2.material.needsUpdate = true;

    if (value === 1) {
      this.scene.object2.material.transparent = false;
    } else {
      this.scene.object2.material.transparent = true;
    }
  }

  protected render(): void {
    this.renderer.clear();
    // this.renderer.render(this.scene, this.camera);
    // this.wboitPass.render(this.renderer);
    this.effectComposer.render();
  }
}

export { AppWBOIT };
