import { loadData } from './data.js';
import * as gui from './gui.js';
import { SVG } from '../node_modules/@svgdotjs/svg.js/dist/svg.esm.js';
import * as util from './util.js';

export const config = {
  W: 410, // mm
  H: 276, // mm
  LAYERS: 10,
  DIGITS_AFTER_COMMA: {
    'distance_km': 1,
    'geocoordinates': 3,
    'azimuth_deg': 1,
    'elevation': 0,
  },
};

export let params = {
  'layer': 0,
  'bg_color': '#ffffff',
  'save_svg': () => { save(); },
  'redraw': () => { draw(); },
  'layer_0': {
    'enabled': true,
    'dataset': 'partner',
    'filter': '',
    'scale': 80,
    'fixed_dist': 3,
    'use_fixed_dist': 0,
    'color': '#000000',
    'font_size': 5,
    'lines': false,
    'strokeWidth': 0.1,
    'lines_opacity': 1,
    'labels': true,
    'field': 'land',
    'labels_tx': 5,
    'labels_ty': 0,
    'labels_opacity': 1.0,
    'labels_anchor': 'start',
    'azimuth': 'exact',
    'center': false,
    'center_size': 5,
    'dots': true,
    'dots_size': 5,
  }
};

function mm2pt(mm) { return mm / 25.4 * 72; }

function polar2cartesian(angle_deg, radius) {
  if (radius == -Infinity) radius = 0;
  let angle = (angle_deg - 90) / 180 * Math.PI;
  return {
    x: radius * Math.cos(angle),
    y: radius * Math.sin(angle),
  };
}

export function updateBG() {
  document.querySelector('svg').style.backgroundColor = params.bg_color;
}

function interp(min, max, a) { return min + (max-min) * a; }


let label_field_controller = [];

export function draw_layer(n) {
  console.log('update layer ' + n);
  let draw = svg.findOne('#layer_' + n);
  draw.clear();
  let _params = params['layer_' + n];
  
  let data = datasets[_params.dataset];
  const rotation_offset = data[0].azimuth_deg; // save rotation of first element after sorting (i.e. most to the north).
  
  // setup lebel field selection in ui
  let fields = Object.keys(data[0]);
  if (!label_field_controller[n]) label_field_controller[n] = gui.label_field_controller[n];
  label_field_controller[n] = label_field_controller[n].options(fields).onFinishChange(() => {draw_layer(n)});
  
  if (!_params.enabled) return;
  
  if (_params.center) {
    draw.circle(_params.center_size).center(W/2, H/2).fill(_params.color);
  }
  
  // apply filter
  if (_params.filter) {
      // function takes all fields as arguments
      const args = fields.concat('return ' + _params.filter + ';');
      const filter_fn = new Function(...args);
      console.log(args);
      console.log(filter_fn);
      try {
        data = data.filter( x => filter_fn(...Object.values(x)) ); // call filter_fn with values of current data point
      } catch (e) {
        console.warn(`Error in filter (${_params.filter}):`, e);
      }
  }
  
  for ( let [i, d] of data.entries() ) {
    // console.log(d);
    let rotation_deg = _params.azimuth == 'uniform' ? rotation_offset + (360 / data.length) * i : d.azimuth_deg;
    
    let log_dist = (Math.log10(d.distance_km) + 1)
    let distance = interp(log_dist, _params.fixed_dist, _params.use_fixed_dist) * _params.scale; // interpolate between a fixed (log-)dist and the true one
    
    let p = polar2cartesian( rotation_deg, distance ) ;
    p.x += W/2;
    p.y += H/2;
    // console.log(p);
    // 
    // if (Math.random() < 0.2)
    if (_params.lines) {
      draw.line(W/2, H/2, p.x, p.y).stroke({ width:_params.strokeWidth, color:_params.color, opacity:_params.lines_opacity });
    }
  
    if (_params.dots) {
      //draw.circle(_params.dots_size).center(p.x, p.y).fill(_params.color);
      let dotElement = "●";
      let dotText = draw.text(dotElement).move(p.x, p.y).attr({ 
        'font-size':_params.dots_size, 'fill':_params.color, 'opacity':_params.labels_opacity });
        dotText.attr({ 'transform': `rotate(${rotation_deg - 90} ${p.x} ${p.y})` });
    }
    
    // if (Math.random() < 0.1)
    if (_params.labels) {
      let caption = fields.includes(_params.field) ? d[_params.field] : d[fields[0]];
      if (caption === null) caption = ""; // hide null values
      
      if (_params.field in config.DIGITS_AFTER_COMMA) {
        if (_params.field == 'geocoordinates') {
          caption = caption.split(',').map(parseFloat).map(x => x.toFixed(config.DIGITS_AFTER_COMMA['geocoordinates'])).join(',');
        } else {
          caption = parseFloat(caption).toFixed( config.DIGITS_AFTER_COMMA[_params.field] )
        }
      }

      else 
      caption = "" + caption; // make sure it's a string
      let text = draw.text(caption).move(p.x, p.y).attr({ 'font-size':_params.font_size, 'fill':_params.color, 'opacity':_params.labels_opacity });
      text.attr({ 'transform': `rotate(${rotation_deg - 90} ${p.x} ${p.y}) translate(${_params.labels_tx} ${_params.labels_ty})` });
      text.attr({ 'text-anchor':_params.labels_anchor });
    }
    
  }
    
  // // Scaling Circles (10 / 100 / 1.000 / 10.000)
  // for (let i=scale; i<=400; i+=scale) {
  //   draw.circle().radius(i).center(W/2, H/2).stroke({width:0.3, color:'black'}).fill('none')
  // }
}

const datasets = {};
const W = mm2pt(config.W);
const H = mm2pt(config.H);
let svg;

function makeSVG() {
  svg = SVG('svg').size(W + 'pt', H + 'pt');
  svg.viewbox(0, 0, W, H); // now we can specify all values in pt, but don't have to write 'pt' all the time
  svg.attr({ 'font-family':'GT America Mono', 'font-weight':500 });
  // draw.clear();
  // updateBG();
  
  for (let i=0; i<config.LAYERS; i++) {
    svg.group().attr({ id:"layer_" + i });
  }
  
  for (let i=0; i<config.LAYERS; i++) {
    draw_layer(i);
  }
}

function save() {
  const ts = util.saveSVGText( SVG('svg').svg() );
  util.saveSettings(params, ts);
}

(async function main() {
  await util.loadSettings('./app/settings.json', params);
  
  // duplicate layer parameters, if necessary
  for (let i=0; i<config.LAYERS; i++) {
    if (!params['layer_' + i]) { // no params for this layer, copy layer 0 (but disabled)
        let _params = Object.assign({}, params['layer_0']);
        _params.enabled = false;
        params['layer_' + i] = _params;
      }
  }
  
  datasets['partner'] = await loadData('./data/FH Technikum Daten 18_19 - Partner.csv');
  datasets['herkunft_studierende'] = await loadData('./data/FH Technikum Daten 18_19 - Herkunftsland Studierende.csv');
  datasets['herkunft_weiterbildungen'] = await loadData('./data/FH Technikum Daten 18_19 - Herkunftsland Weiterbildungen.csv');
  datasets['austausch_mitarbeiter'] = await loadData('./data/FH Technikum Daten 18_19 - Austausch Mitarbeiter.csv');
  datasets['austausch_studierende'] = await loadData('./data/FH Technikum Daten 18_19 - Austausch Studierende.csv');
  
  // sort data
  for (let data of Object.values(datasets))  {
    data.sort( (a,b) => a.azimuth_deg - b.azimuth_deg ); // sort by azimuth
  }
  
  gui.makeGUI();
  makeSVG();
  
  document.querySelector('.dg.main').addEventListener('keydown', e => {
    e.stopPropagation();
  });
  
  document.addEventListener('keydown', e => {
    // console.log(e);
    if (e.key == 'f') {
      util.toggleFullscreen();
    }
    else if (e.key == 's') {
      save();
    }
  });
  
})();
