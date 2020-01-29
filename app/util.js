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
export function saveCanvas(selector) {
  let canvas = document.querySelector(selector || 'canvas');
  let link = document.createElement('a');
  let timestamp = new Date().toISOString();
  link.download = timestamp + '.png';
  link.href = canvas.toDataURL();
  link.style.display = 'none';     // Firefox
  document.body.appendChild(link); // Firefox
  link.click();
  document.body.removeChild(link); // Firefox
}


export function saveText(str, ext = '.txt', mime = 'text/plain') {
  let link = document.createElement('a');
  let timestamp = new Date().toISOString();
  link.download = timestamp + ext;
  link.href = URL.createObjectURL(new Blob([str], {type: mime}));
  link.style.display = 'none';     // Firefox
  document.body.appendChild(link); // Firefox
  link.click();
  document.body.removeChild(link); // Firefox
}


export function saveSVGText(str) {
  return saveText(str, '.svg', 'image/svg+xml');
}
