import * as dat from '../node_modules/dat.gui/build/dat.gui.module.js';
import * as main from './main.js';

let gui;
export let label_field_controller = [];

let layers = [];

function addLayer() {
  const n = layers.length;
  const f = gui.addFolder('layer ' + n); f.open();
  layers.push(f);
  
  const params = main.params['layer_' + n];
  const update = main.update;
  
  f.add(params, 'enabled').onFinishChange(update);
  f.add(params, 'dataset', ['partner', 'herkunft_studierende', 'herkunft_weiterbildungen', 'austausch_mitarbeiter', 'austausch_studierende']).onFinishChange(update);
  f.add(params, 'scale', 20, 150).onFinishChange(update);
  f.add(params, 'azimuth', ['exact', 'uniform']).onFinishChange(update);
  f.add(params, 'fixed_dist', 0).onFinishChange(update);
  f.add(params, 'use_fixed_dist', 0, 1, 0.01).onFinishChange(update);
  f.addColor(params, 'color').onFinishChange(update);
  
  let g;
  g = f.addFolder('lines'); g.open();
  g.add(params, 'lines').onFinishChange(update);
  g.add(params, 'strokeWidth', 0.1, 3, 0.1).onFinishChange(update);
  g.add(params, 'lines_opacity', 0.0, 1, 0.01).onFinishChange(update);
  
  g = f.addFolder('labels'); g.open();
  g.add(params, 'labels').onFinishChange(update);
  label_field_controller[n] = g.add(params, 'field', []);
  g.add(params, 'font_size', 1.0).onFinishChange(update);
  g.add(params, 'labels_anchor', ['start', 'middle', 'end']).onFinishChange(update);
  g.add(params, 'labels_tx').onFinishChange(update);
  g.add(params, 'labels_ty').onFinishChange(update);
  g.add(params, 'labels_opacity', 0.0, 1.0, 0.01).onFinishChange(update);
  
  g = f.addFolder('dots'); g.open();
  g.add(params, 'center').onFinishChange(update);
  g.add(params, 'center_size', 0).onFinishChange(update);
  g.add(params, 'dots').onFinishChange(update);
  g.add(params, 'dots_size', 0).onFinishChange(update);
}

function setActiveLayer(val) {
  for (let layer of layers) layer.hide();
  layers[val].show();
}

export function makeGUI() {
  gui = new dat.GUI();
  
  let list = Array(main.config.LAYERS).fill().map((_, i) => i);
  gui.add(main.params, 'layer', list).onFinishChange(setActiveLayer);
  gui.addColor(main.params, 'bg_color').onChange(main.updateBG);
  
  for (let i=0; i<main.config.LAYERS; i++) { addLayer(); }
  setActiveLayer(main.params['layer']);
  
  // gui.add(params, 'redraw');
  gui.add(main.params, 'save_svg');

  return gui;
}
