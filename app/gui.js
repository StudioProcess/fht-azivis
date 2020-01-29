import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';
import * as main from './main.js';

let gui;

export function makeGUI(params, update) {
  gui = new dat.GUI();
  // console.log(params);
  gui.add(params, 'dataset', ['partner', 'herkunft_studierende', 'herkunft_weiterbildungen', 'austausch_mitarbeiter', 'austausch_studierende']).onFinishChange(update);
  gui.add(params, 'scale', 50, 150).onFinishChange(update);
  gui.addColor(params, 'color').onFinishChange(update);
  gui.addColor(params, 'bg_color').onChange(main.updateBG);
  gui.add(params, 'strokeWidth', 0.1, 3, 0.1).onFinishChange(update);
  return gui;
}
