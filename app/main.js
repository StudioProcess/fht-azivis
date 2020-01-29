import { loadData } from './data.js';
import { makeGUI } from './gui.js';
import { SVG } from '../node_modules/@svgdotjs/svg.js/dist/svg.esm.js';
import * as util from './util.js';

const config = {
  W: 410, // mm
  H: 276, // mm
};

const params = {
  'dataset': 'partner',
  'scale': 80,
  'color': '#000000',
  'bg_color': '#ffffff',
  'font_size': 5,
  'lines': true,
  'strokeWidth': 0.1,
  'lines_opacity': 1,
  'labels': true,
  'labels_tx': 2,
  'labels_ty': 0,
  'labels_opacity': 0.5,
  'save_svg': () => { util.saveSVGText( SVG('svg').svg() ); },
  'redraw': () => { draw(); },
  'azimuth': 'exact',
  'center': true,
  'center_size': 5,
  'dots': true,
  'dots_size': 1,
};

const datasets = {};

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



// draw svg
function draw() {
  let W = mm2pt(config.W), H = mm2pt(config.H);
  let draw = SVG('svg').size(W + 'pt', H + 'pt');
  draw.viewbox(0, 0, W, H); // now we can specify all values in pt, but don't have to write 'pt' all the time
  draw.attr({ 'font-family':'GT America Mono', 'font-weight':500 });
  draw.clear();
  updateBG();
  
  let data = datasets[params.dataset];
  data.sort( (a,b) => a.azimuth_deg - b.azimuth_deg ); // sort by azimuth
  const rotation_offset = data[0].azimuth_deg; // save rotation of first element after sorting (i.e. most to the north).
  console.log(data);
  
  if (params.center) {
    draw.circle(params.center_size).center(W/2, H/2);
  }
  
  for ( let [i, d] of data.entries() ) {
    // console.log(d);
    let rotation_deg = params.azimuth == 'uniform' ? rotation_offset + (360 / data.length) * i : d.azimuth_deg;
    let p = polar2cartesian( rotation_deg, (Math.log10(d.distance_km) + 1) * params.scale ) ;
    d.point = p;
    p.x += W/2;
    p.y += H/2;
    // console.log(p);
    // 
    // if (Math.random() < 0.2)
    if (params.lines) {
      draw.line(W/2, H/2, p.x, p.y).stroke({ width:params.strokeWidth, color:params.color, opacity:params.lines_opacity });
    }
  
    if (params.dots) {
      draw.circle(params.dots_size).center(p.x, p.y).fill(params.color);
    }
    
    // if (Math.random() < 0.1)
    if (params.labels) {
      let text = draw.text(d.land).move(p.x, p.y).attr({ 'font-size':params.font_size, 'fill':params.color, 'opacity':params.labels_opacity });
      text.attr({ 'transform': `rotate(${rotation_deg - 90} ${p.x} ${p.y}) translate(${params.labels_tx} ${params.labels_ty})` })
    }
    
  }
    
  // // Scaling Circles (10 / 100 / 1.000 / 10.000)
  // for (let i=scale; i<=400; i+=scale) {
  //   draw.circle().radius(i).center(W/2, H/2).stroke({width:0.3, color:'black'}).fill('none')
  // }
}


(async function main() {
  
  datasets['partner'] = await loadData('./data/FH Technikum Daten 18_19 - Partner.csv');
  datasets['herkunft_studierende'] = await loadData('./data/FH Technikum Daten 18_19 - Herkunftsland Studierende.csv');
  datasets['herkunft_weiterbildungen'] = await loadData('./data/FH Technikum Daten 18_19 - Herkunftsland Weiterbildungen.csv');
  datasets['austausch_mitarbeiter'] = await loadData('./data/FH Technikum Daten 18_19 - Austausch Mitarbeiter.csv');
  datasets['austausch_studierende'] = await loadData('./data/FH Technikum Daten 18_19 - Austausch Studierende.csv');
  
  draw();
  
  let gui = makeGUI(params, draw);
  
  document.addEventListener('keydown', e => {
    // console.log(e);
    if (e.key == 'f') {
      util.toggleFullscreen();
    }
    else if (e.key == 's') {
      util.saveSVGText( SVG('svg').svg() );
    }
  });
  
})();
