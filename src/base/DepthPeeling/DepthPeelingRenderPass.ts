import * as THREE from "three";
import { FullScreenQuad, Pass } from "three/examples/jsm/postprocessing/Pass.js";
// import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";

const DEPTH = 3;

const globalUniforms = {
  uPrevDepthTexture: { value: null } as { value: THREE.Texture | null },
  uReciprocalScreenSize: { value: new THREE.Vector2(1, 1) },
};

const layers: Array<THREE.WebGLRenderTarget> = [];

// const one = new THREE.DataTexture(new Uint8Array([1, 1, 1, 1]), 1, 1);
const one = new THREE.DepthTexture(4, 1);

const quad = new FullScreenQuad(
  new THREE.ShaderMaterial({
    // ...CopyShader,
    ...GammaCorrectionShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  })
);

const resizeLayers = (width: number, height: number, pixelRatio: number) => {
  const w = width * pixelRatio;
  const h = height * pixelRatio;

  globalUniforms.uReciprocalScreenSize.value.set(1 / w, 1 / h);

  layers.forEach((rt) => {
    rt.setSize(w, h);
    rt.depthTexture.dispose();
    rt.depthTexture = new THREE.DepthTexture(w, h);
  });

}

const resizeDepth = (width: number, height: number, pixelRatio: number, depth: number) => {
  while (depth < layers.length) layers.pop()?.dispose();

  const w = width * pixelRatio;
  const h = height * pixelRatio;
  while (layers.length < depth)
    layers.push(
      new THREE.WebGLRenderTarget(w, h, {
        depthTexture: new THREE.DepthTexture(w, h),
      })
    );
}


class DepthPeelingRenderPass extends Pass {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private pixelRatio = 1;

  public static patch(object3D: THREE.Object3D) {
    if (object3D instanceof THREE.Mesh === false) {
      return;
    }

    if (object3D.material instanceof THREE.Material === false) {
      return;
    }

    console.log("patch")

    const clonedMaterial = object3D.material.clone();
    clonedMaterial.blending = THREE.NoBlending;
    clonedMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uReciprocalScreenSize = globalUniforms.uReciprocalScreenSize;
      shader.uniforms.uPrevDepthTexture = globalUniforms.uPrevDepthTexture;
      shader.fragmentShader = `
// --- DEPTH PEELING SHADER CHUNK (START) (uniform definition)
uniform vec2 uReciprocalScreenSize;
uniform sampler2D uPrevDepthTexture;
// --- DEPTH PEELING SHADER CHUNK (END)
        ${shader.fragmentShader}
      `;
      //peel depth
      shader.fragmentShader = shader.fragmentShader.replace(
        /}$/gm,
        `
// --- DEPTH PEELING SHADER CHUNK (START) (peeling)
vec2 screenPos = gl_FragCoord.xy * uReciprocalScreenSize;
float prevDepth = texture2D(uPrevDepthTexture,screenPos).x;
if( prevDepth >= gl_FragCoord.z )
    discard;
// --- DEPTH PEELING SHADER CHUNK (END)
}
        `
      );
    };

    object3D.material = clonedMaterial;
    object3D.material.needsUpdate = true;
  }

  constructor(scene: THREE.Scene, camera: THREE.Camera) {
    super();
    this.scene = scene;
    this.camera = camera;

    this.clear = true;
    this.needsSwap = false;
  }

  render(renderer: THREE.WebGLRenderer) {

    const originalRenderTarget = renderer.getRenderTarget();
    const originalAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    layers.reduceRight((acc, value) => {
      globalUniforms.uPrevDepthTexture.value = acc;
      renderer.setRenderTarget(value);
      renderer.clear();
      renderer.render(this.scene, this.camera);

      return value.depthTexture;
    }, one);

    renderer.setRenderTarget(originalRenderTarget);
    renderer.clear();

    for (const layer of layers) {
      if (quad.material instanceof THREE.ShaderMaterial === false) {
        throw new Error('Material is not an instance of THREE.ShaderMaterial');
      }

      quad.material.uniforms.tDiffuse.value = layer.texture;
      quad.material.needsUpdate = true;
      quad.render(renderer);
    }

    renderer.autoClear = originalAutoClear;
  }

  public setSize(width: number, height: number): void {
    resizeDepth(width, height, this.pixelRatio, DEPTH);
    resizeLayers(width, height, this.pixelRatio);
  }


  private isDeepPeelingNeedsUpdate = true;

  public setupDeepPeeling(renderer: THREE.WebGLRenderer) {
    const { x: width, y: height } = renderer.getSize(new THREE.Vector2());
    this.setSize(width, height);
    // resizeLayers(width, height, renderer.getPixelRatio());
    // resizeDepth(width, height, renderer.getPixelRatio(), AppState.Depth);


    // this.scene.traverse((object3D) => {
    //   console.log("setup")
    //   return;
    //   if (object3D instanceof THREE.Mesh === false) {
    //     return;
    //   }

    //   if (object3D.material instanceof THREE.Material === false) {
    //     return;
    //   }

    //   if (object3D.userData.useDeepPeeling !== true) {
    //     return;
    //   }

    //   const clonedMaterial = object3D.material.clone();
    //   clonedMaterial.blending = THREE.NoBlending;
    //   clonedMaterial.onBeforeCompile = (shader) => {
    //     shader.uniforms.uReciprocalScreenSize = globalUniforms.uReciprocalScreenSize;
    //     shader.uniforms.uPrevDepthTexture = globalUniforms.uPrevDepthTexture;
    //     shader.fragmentShader = `
    // // --- DEPTH PEELING SHADER CHUNK (START) (uniform definition)
    // uniform vec2 uReciprocalScreenSize;
    // uniform sampler2D uPrevDepthTexture;
    // // --- DEPTH PEELING SHADER CHUNK (END)
    // 					${shader.fragmentShader}
    // 				`;
    //     //peel depth
    //     shader.fragmentShader = shader.fragmentShader.replace(
    //       /}$/gm,
    //       `
    // // --- DEPTH PEELING SHADER CHUNK (START) (peeling)
    //   vec2 screenPos = gl_FragCoord.xy * uReciprocalScreenSize;
    //   float prevDepth = texture2D(uPrevDepthTexture,screenPos).x;
    //   if( prevDepth >= gl_FragCoord.z )
    //       discard;
    // // --- DEPTH PEELING SHADER CHUNK (END)
    // }
    // 					`
    //     );
    //   };

    //   object3D.material = clonedMaterial;
    //   object3D.material.needsUpdate = true;
    // });

    this.isDeepPeelingNeedsUpdate = false;
  };
}

export { DepthPeelingRenderPass };