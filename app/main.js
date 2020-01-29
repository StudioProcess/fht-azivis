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
  'strokeWidth': 0.1,
  'save_svg': () => { util.saveSVGText( SVG('svg').svg() ); },
  'redraw': () => { draw(); },
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
  draw.clear();
  updateBG();
  
  let data = datasets[params.dataset];
  console.log(data);
  
  draw.circle(10).center(W/2, H/2);
  
  for (let d of data) {
    // console.log(d);
    let p = polar2cartesian( d.azimuth_deg, (Math.log10(d.distance_km) + 1) * params.scale ) ;
    d.point = p;
    p.x += W/2;
    p.y += H/2;
    // console.log(p);
    // 
    // if (Math.random() < 0.2)
    draw.line(W/2, H/2, p.x, p.y).stroke({ width:params.strokeWidth, color:params.color });
  
    draw.circle(1).center(p.x, p.y).fill(params.color);
    // if (Math.random() < 0.1)
      // draw.text(d.partner).move(p.x+3, p.y+1.5).attr({'font-family': 'system-ui', 'font-size':5, 'opacity':0.5})
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
    console.log(e);
    if (e.key == 'f') {
      util.toggleFullscreen();
    }
    else if (e.key == 's') {
      util.saveSVGText( SVG('svg').svg() );
    }
  });
  
})();
