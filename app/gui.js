import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';
import * as main from './main.js';

let gui;
export let label_field_controller;

export function makeGUI(params, update) {
  gui = new dat.GUI();
  let g;
  // console.log(params);
  gui.add(params, 'dataset', ['partner', 'herkunft_studierende', 'herkunft_weiterbildungen', 'austausch_mitarbeiter', 'austausch_studierende']).onFinishChange(update);
  gui.add(params, 'scale', 50, 150).onFinishChange(update);
  gui.addColor(params, 'color').onFinishChange(update);
  gui.addColor(params, 'bg_color').onChange(main.updateBG);
  
  // g = gui.addFolder('visualization');
  gui.add(params, 'azimuth', ['exact', 'uniform']).onFinishChange(update);;
  
  g = gui.addFolder('lines'); g.open();
  g.add(params, 'lines').onFinishChange(update);
  g.add(params, 'strokeWidth', 0.1, 3, 0.1).onFinishChange(update);
  g.add(params, 'lines_opacity', 0.0, 1, 0.01).onFinishChange(update);
  
  g = gui.addFolder('labels'); g.open();
  g.add(params, 'labels').onFinishChange(update);
  label_field_controller = g.add(params, 'field', []);

  g.add(params, 'font_size', 1.0).onFinishChange(update);
  g.add(params, 'labels_tx').onFinishChange(update);
  g.add(params, 'labels_ty').onFinishChange(update);
  g.add(params, 'labels_opacity', 0.0, 1.0, 0.01).onFinishChange(update);
  
  g = gui.addFolder('dots'); g.open();
  g.add(params, 'center').onFinishChange(update);
  g.add(params, 'center_size', 0).onFinishChange(update);
  g.add(params, 'dots').onFinishChange(update);
  g.add(params, 'dots_size', 0).onFinishChange(update);
  
  gui.add(params, 'redraw');
  gui.add(params, 'save_svg');

  return gui;
}
