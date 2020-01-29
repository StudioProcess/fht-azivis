import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';

let gui;

export function makeGUI(params, update) {
  gui = new dat.GUI();
  // console.log(params);
  gui.add(params, 'dataset', ['partner', 'herkunft_studierende', 'herkunft_weiterbildungen', 'austausch_mitarbeiter', 'austausch_studierende']).onFinishChange(update);
  gui.add(params, 'scale', 50, 150).onFinishChange(update);
  return gui;
}
