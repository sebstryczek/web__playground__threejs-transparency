import * as THREE from "three";
import { MapControls } from "three/examples/jsm/controls/MapControls.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";

abstract class App<T extends THREE.Scene = THREE.Scene> {
  public readonly id = THREE.MathUtils.generateUUID();

  #canvas: HTMLCanvasElement;
  public get canvas() {
    return this.#canvas;
  }

  #renderer: THREE.WebGLRenderer;
  public get renderer() {
    return this.#renderer;
  }

  #effectComposer: EffectComposer;
  public get effectComposer() {
    return this.#effectComposer;
  }

  #scene: T;
  public get scene() {
    return this.#scene;
  }

  #camera: THREE.PerspectiveCamera;
  public get camera() {
    return this.#camera;
  }

  #controls: MapControls;
  public get controls() {
    return this.#controls;
  }

  #stats: Stats;
  public get stats() {
    return this.#stats;
  }

  constructor({ canvas }: { canvas: HTMLCanvasElement }) {
    this.#canvas = canvas;

    this.#renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      precision: "highp",
      powerPreference: "high-performance",
      // logarithmicDepthBuffer: true,
      preserveDrawingBuffer: true
    });

    this.#effectComposer = new EffectComposer(this.renderer);

    this.#camera = this.createCamera();
    this.#controls = this.createControls();
    this.#scene = this.createScene();
    this.#stats = this.createStats();

    this.updateSize();
    this.createRenderPipeline();

    this.renderer.setAnimationLoop(this.renderLoop);
  }

  protected abstract createCamera(): THREE.PerspectiveCamera;

  protected abstract createControls(): MapControls;

  protected abstract createScene(): T;

  private createStats() {
    this.#stats = new Stats();
    this.#stats.showPanel(0);
    this.#stats.dom.style.position = "absolute";
    this.#stats.dom.style.top = "0";
    this.#stats.dom.style.left = "0";
    this.#canvas.parentElement?.appendChild(this.#stats.dom);

    return this.#stats;
  }

  public createRenderPipeline() {
    const renderPass = new RenderPass(this.scene, this.camera);
    this.effectComposer.addPass(renderPass);

    // ??
    // const outputPass = new OutputPass();
    // this.effectComposer.addPass(outputPass);
  }

  private updateSize() {
    const parent = this.canvas.parentElement;

    if (parent === null) {
      return;
    }

    const { width, height } = parent.getBoundingClientRect();

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.effectComposer.setSize(width, height);
  }

  private renderLoop = () => {
    this.controls.update();
    this.render();
    this.stats.update();
  }

  protected render() {
    // this.renderer.render(this.scene, this.camera);
    this.effectComposer.render()
  }
}

export { App };
