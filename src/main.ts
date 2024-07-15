
import "./style.css";

import { App } from "./base/App";
import { AppDefault } from "./entites/AppDefault";
import { AppAlphaHash } from "./entites/AppAlphaHash";
import { AppWBOIT } from "./entites/AppWBOIT";
import { AppManualSorting } from "./entites/AppManualSorting";
import { getElement } from "./utils/getElement";
import { AppDepthPeeling } from "./entites/AppDepthPeeling";

const canvas1 = getElement<HTMLCanvasElement>("#canvas-1");
const canvas2 = getElement<HTMLCanvasElement>("#canvas-2");
const canvas3 = getElement<HTMLCanvasElement>("#canvas-3");
const canvas4 = getElement<HTMLCanvasElement>("#canvas-4");
const canvas5 = getElement<HTMLCanvasElement>("#canvas-5");

const appNone = new AppDefault({ canvas: canvas1 });
const appAlphaHash = new AppAlphaHash({ canvas: canvas2 });
const appWBOIT = new AppWBOIT({ canvas: canvas3 });
const appDepthPeeling = new AppDepthPeeling({ canvas: canvas4 });
const appManualSorting = new AppManualSorting({ canvas: canvas5 });

const apps = [
  appNone,
  appAlphaHash,
  appWBOIT,
  appDepthPeeling,
  appManualSorting
];

const setupViewClonning = (app: App) => {
  app.controls.addEventListener("change", () => {
    apps.forEach((otherApp) => {
      if (app.id !== otherApp.id) {
        otherApp.camera.position.copy(app.camera.position);
        otherApp.controls.target.copy(app.controls.target);
      }
    });
  });
}

apps.forEach((app) => {
  setupViewClonning(app);
});

const slider1 = document.querySelector<HTMLInputElement>("#slider-1");
const slider2 = document.querySelector<HTMLInputElement>("#slider-2");

if (slider1 === null || slider2 === null) {
  throw new Error("No slider found");
}

slider1.addEventListener("input", () => {
  apps.forEach((app) => {
    app.setOpacity1(Number(slider1.value));
  });
});

slider2.addEventListener("input", () => {
  apps.forEach((app) => {
    app.setOpacity2(Number(slider2.value));
  });
});


apps.forEach((app) => {
  const opacity1 = Number(slider1.value);
  const opacity2 = Number(slider2.value);

  app.setOpacity1(opacity1);
  app.setOpacity2(opacity2);
});
