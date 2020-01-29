import { loadData } from './data.js';
import { makeGUI } from './gui.js';
import { SVG } from '../node_modules/@svgdotjs/svg.js/dist/svg.esm.js';
import * as util from './util.js';

const datasets = {};
const params = {
  'dataset': 'partner',
  'scale': 80,
};

(async function main() {
  
  datasets['partner'] = await loadData('./data/FH Technikum Daten 18_19 - Partner.csv');
  datasets['herkunft_studierende'] = await loadData('./data/FH Technikum Daten 18_19 - Herkunftsland Studierende.csv');
  datasets['herkunft_weiterbildungen'] = await loadData('./data/FH Technikum Daten 18_19 - Herkunftsland Weiterbildungen.csv');
  datasets['austausch_mitarbeiter'] = await loadData('./data/FH Technikum Daten 18_19 - Austausch Mitarbeiter.csv');
  datasets['austausch_studierende'] = await loadData('./data/FH Technikum Daten 18_19 - Austausch Studierende.csv');
  
  function polar2cartesian(angle_deg, radius) {
    if (radius == -Infinity) radius = 0;
    let angle = (angle_deg - 90) / 180 * Math.PI;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    };
  }
  
  // draw svg
  function draw() {
    let W = 1000, H = 1000;
    let draw = SVG('svg').size(W, H);
    draw.clear();
    
    let data = datasets[params.dataset];
    console.log(data);
    
    draw.circle(5).center(W/2,H/2);
    
    for (let d of data) {
      // console.log(d);
      let p = polar2cartesian( d.azimuth_deg, (Math.log10(d.distance_km) + 1) * params.scale ) ;
      d.point = p;
      p.x += W/2;
      p.y += H/2;
      // console.log(p);
      // 
      // if (Math.random() < 0.2)
      draw.line(W/2, H/2, p.x, p.y).stroke({width:0.1, color:'black'});
      
      draw.circle(1).center(p.x, p.y); //.fill('red');
      // if (Math.random() < 0.1)
        // draw.text(d.partner).move(p.x+3, p.y+1.5).attr({'font-family': 'system-ui', 'font-size':5, 'opacity':0.5})
    }
      
    // // Scaling Circles (10 / 100 / 1.000 / 10.000)
    // for (let i=scale; i<=400; i+=scale) {
    //   draw.circle().radius(i).center(W/2, H/2).stroke({width:0.3, color:'black'}).fill('none')
    // }
  }
  
  
  function update() {
    draw();
  }
  
  let gui = makeGUI(params, update);
  
  draw();
  
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
