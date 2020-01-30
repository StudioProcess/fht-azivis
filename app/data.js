const EARTH_RADIUS = 6371;

function rad(deg) {
  return deg / 180 * Math.PI;
}

function deg(rad) {
  return rad * 180 / Math.PI;
}

// x .. lng,  y .. lat
function azidist( [lat1, lng1], [lat2, lng2] ) {
  let y1 = rad(lat1);
  let x1 = rad(lng1);
  let y2 = rad(lat2);
  let x2 = rad(lng2);

  let dx = x2 - x1;

  let sin = Math.sin, cos = Math.cos, acos = Math.acos, tan = Math.tan, atan2 = Math.atan2;

  let d = EARTH_RADIUS * acos( sin(y1)*sin(y2) + cos(y1)*cos(y2)*cos(dx) );

  let a = Math.PI/2 - atan2( cos(y1)*tan(y2) - sin(y1)*cos(dx), sin(dx) );
  a = (deg(a) + 360) % 360;

  return {
    distance_km: d,
    azimuth_deg: a,
  };
}


async function parseCSV(path) {
  return new Promise(resolve => {
    Papa.parse(path, {
      download: true,
      complete: resolve,
      dynamicTyping: true
    })
  });
}


async function loadCSV(path) {
  let csv = await parseCSV(path);
  let keys = csv.data[0].map( (key, i) => key ? key.toLowerCase().replace(' ', '_') : `column_${i+1}`);

  let obj = csv.data.slice(1).map(arr => {
    let obj = {};
    for (let [i, val] of arr.entries()) {
      obj[ keys[i] ] = val;
    }
    return obj;
  });
  return obj;
}


function addAzidist(obj) {
  let location = obj['geocoordinates'].split(',').map(parseFloat);
  const wien = [48.2, 16.366667];
  let ad = azidist( wien, location );
  // obj['location'] = location;
  obj['distance_km'] = ad.distance_km;
  obj['azimuth_deg'] = ad.azimuth_deg;
}


export async function loadData(path) {
  let data = await loadCSV(path);
  data.map(addAzidist);
  return data;
}
