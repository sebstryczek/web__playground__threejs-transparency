import * as THREE from 'three';
import { App } from '../base/App';
import { MainScene } from './scenes/MainScene';
import { MapControls } from 'three/examples/jsm/controls/MapControls.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { TAARenderPass } from 'three/examples/jsm/postprocessing/TAARenderPass.js';


// import { EffectComposer, SSAARenderPass } from 'three/examples/jsm/Addons.js';

class AppAlphaHash extends App<MainScene> {
  private state: {
    antialiasing: 'none' | 'ssaa' | 'taa';
  } = {
      antialiasing: 'none',
    };

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    super({ canvas });

    this.scene.background = new THREE.Color("white");

    if (this.scene.object1.material instanceof THREE.Material === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    this.scene.object1.material.alphaHash = true;

    if (this.scene.object2.material instanceof THREE.Material === false) {
      throw new Error('Material is not an instance of THREE.Material');
    }

    this.scene.object2.material.alphaHash = true;


    const gui = new GUI();
    gui.domElement.style.position = 'absolute';
    gui.domElement.style.top = 'unset';
    gui.domElement.style.bottom = '0';
    gui.domElement.style.right = '0';
    this.canvas.parentElement?.appendChild(gui.domElement);

    gui.add(this.state, "antialiasing", {
      none: "none",
      ssaa: "ssaa",
      taa: "taa",
    }).name('Antialiasing').onChange(this.onAntialiasingChanged);
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

  private onAntialiasingChanged = () => {
    this.effectComposer.passes.forEach((pass) => {
      this.effectComposer.removePass(pass);
    });

    switch (this.state.antialiasing) {
      case "none": {
        const renderPass = new RenderPass(this.scene, this.camera);
        this.effectComposer.addPass(renderPass);

        break;
      }
      case "ssaa": {
        const ssaaRenderPass = new SSAARenderPass(this.scene, this.camera);
        ssaaRenderPass.sampleLevel = 6;
        this.effectComposer.addPass(ssaaRenderPass);

        const outputPass = new OutputPass();
        this.effectComposer.addPass(outputPass);
        break;
      }
      case "taa": {
        const taaRenderPass = new TAARenderPass(this.scene, this.camera, 0x000000, 1);
        this.effectComposer.addPass(taaRenderPass);
        taaRenderPass.sampleLevel = 6;

        const outputPass = new OutputPass();
        this.effectComposer.addPass(outputPass);

        break;
      }
    }
  };
}

export { AppAlphaHash };
