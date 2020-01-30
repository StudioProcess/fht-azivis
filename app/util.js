export function toggleFullscreen() {
  if (document.webkitFullscreenEnabled) { // Chrome, Opera, Safari
    if (!document.webkitFullscreenElement) {
      document.querySelector('body').webkitRequestFullscreen();
    } else { document.webkitExitFullscreen(); }
  } else if (document.mozFullScreenEnabled) { // Firefox
    if (!document.mozFullScreenElement) {
      document.querySelector('body').mozRequestFullScreen();
    } else { document.mozCancelFullScreen(); }
  } else if (document.fullscreenEnabled) { // Standard, Edge
    if (!document.fullscreenElement) {
      document.querySelector('body').requestFullscreen();
    } else { document.exitFullscreen(); }
  }
}


// NOTE: Needs THREE.WebGLRenderer with preserveDrawingBuffer=true
// TODO: Firefox seems to save only the bottom left quadrant of the canvas. This also happens with 'Right-Click/Save Image as...'
export function saveCanvas(selector, timestamp) {
  let canvas = document.querySelector(selector || 'canvas');
  let link = document.createElement('a');
  if (!timestamp) timestamp = new Date().toISOString();
  link.download = timestamp + '.png';
  link.href = canvas.toDataURL();
  link.style.display = 'none';     // Firefox
  document.body.appendChild(link); // Firefox
  link.click();
  document.body.removeChild(link); // Firefox
  return timestamp;
}


export function saveText(str, timestamp, ext = '.txt', mime = 'text/plain') {
  let link = document.createElement('a');
  if (!timestamp) timestamp = new Date().toISOString();
  link.download = timestamp + ext;
  link.href = URL.createObjectURL(new Blob([str], {type: mime}));
  link.style.display = 'none';     // Firefox
  document.body.appendChild(link); // Firefox
  link.click();
  document.body.removeChild(link); // Firefox
  return timestamp;
}


export function saveSVGText(str, timestamp) {
  return saveText(str, timestamp, '.svg', 'image/svg+xml');
}


export function saveSettings(obj, timestamp) {
  return saveText( JSON.stringify(obj, null, 2), timestamp, '.json', 'application/json' );
}


export async function loadSettings(url, target = {}) {
  const response = await fetch(url);
  let obj = {};
  try {
    obj = await response.json();
  } catch (e) {
    console.error(`Error parsing settings file ${url}`, e);
  }
  return Object.assign( target, obj );
}
