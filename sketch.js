var video;
var streamReady = false;

// A plain offscreen canvas, exactly the size of the mirror, holding the
// current camera frame already mirrored and cover-cropped to fit. Every
// other function reads from this instead of the raw video — it's the one
// place that has to deal with the camera's native resolution, so nothing
// else has to.
var videoBuf;
var videoBufCtx;

var faceMesh;
var faceDetected = false;

var curvePointX = 0;
var curvePointY = 0;
var pointCount = 0.5;
var diffusion = 0;

var inputText = 'QUERIBLE';
var kerning = 1; // between letters

var fontSize = 12;
var drawRate = 150; // strokes drawn per frame

/* CONFIGURACION */
function setup() {
  var cnv = createCanvas(490, 740);
  cnv.parent('canvas');
  background(255);

  videoBuf = document.createElement('canvas');
  videoBuf.width = width;
  videoBuf.height = height;
  videoBufCtx = videoBuf.getContext('2d');

  video = createCapture(VIDEO);
  // Kept off-screen without display:none — a display:none video can have
  // its frame decoding throttled by the browser, which made the idle
  // reflection look paused instead of live.
  video.style('opacity', '0');
  video.style('position', 'absolute');
  video.style('pointer-events', 'none');
  // Left at its native stream resolution (e.g. 640px) this element was wider
  // than a phone viewport and, being position:absolute outside .layout,
  // wasn't clipped by anything — the actual cause of the mobile horizontal
  // scroll. Shrinking the box (not display:none/visibility:hidden, which
  // throttle decoding) removes it from the page's scrollable area.
  video.style('top', '0');
  video.style('left', '0');
  video.style('width', '1px');
  video.style('height', '1px');
  video.elt.addEventListener('loadedmetadata', function () {
    streamReady = true;
  });

  faceMesh = ml5.faceMesh(modelLoaded);

  textFont('Times');
  textSize(fontSize);
  textAlign(LEFT, CENTER);
}

// Draws the current camera frame into videoBuf: cover-cropped to fill the
// mirror exactly (no stretching) and mirrored (like an actual mirror).
// Uses the video's real native resolution directly via the raw canvas API,
// sidestepping p5's own video-element pixel handling entirely.
function updateVideoBuffer() {
  var vw = video.elt.videoWidth;
  var vh = video.elt.videoHeight;
  if (!vw || !vh) return;

  var coverScale = Math.max(width / vw, height / vh);
  var sw = width / coverScale;
  var sh = height / coverScale;
  var sx = (vw - sw) / 2;
  var sy = (vh - sh) / 2;

  videoBufCtx.save();
  videoBufCtx.translate(width, 0);
  videoBufCtx.scale(-1, 1);
  videoBufCtx.drawImage(video.elt, sx, sy, sw, sh, 0, 0, width, height);
  videoBufCtx.restore();
}

function modelLoaded() {
  // detectStart runs its own continuous loop in the background,
  // decoupled from p5's draw() — detection is too slow to redo every frame.
  faceMesh.detectStart(video, gotFaces);
}

function gotFaces(results) {
  faceDetected = !!(results && results.length > 0);
}

/* VISUALIZACION */
function draw() {
  if (!streamReady) return;

  updateVideoBuffer();

  if (!faceDetected) {
    // videoBuf is already mirrored and cropped to exactly fill the canvas.
    drawingContext.drawImage(videoBuf, 0, 0, width, height);
    return;
  }

  textSize(fontSize);

  var word = inputText.toUpperCase();
  var x = 0;
  var y = 0;
  var counter = 0;

  // One bulk read of the mirrored frame per generative pass, instead of
  // hundreds of individual reads.
  var frame = videoBufCtx.getImageData(0, 0, width, height).data;

  for (var j = 0; j < drawRate; j++) {

    // Sample straight from videoBuf: since it's already mirrored and
    // cropped to canvas coordinates, whatever colour is at (x, y) here is
    // exactly what the plain reflection shows at that same screen spot.
    var px = constrain(floor(x), 0, width - 1);
    var py = constrain(floor(y), 0, height - 1);
    var idx = (py * width + px) * 4;
    var c = color(frame[idx], frame[idx + 1], frame[idx + 2], frame[idx + 3]);

    noStroke();
    push();
    translate(x, y);

    var letter = word.charAt(counter);
    fill(c);
    text(word, 0, 0);
    var letterWidth = textWidth(letter) + kerning;
    // for the next letter ... x + letter width
    x += letterWidth;

    // Wrap back to the left at a fresh random height once the walk runs
    // off the right edge — otherwise x only ever increases, and once it
    // hits the edge it stays pinned there, leaving whole rows (especially
    // near the bottom) with barely a chance of ever being visited.
    if (x >= width) {
      x = 0;
      y = random(0, height);
    }

    // How far each stroke can wander from the letter it just drew.
    diffusion = 30;

    beginShape();
    curveVertex(x, y);
    curveVertex(x, y);

    for (var i = 0; i < pointCount; i++) {
      var rx = int(random(-diffusion, diffusion));
      curvePointX = constrain(x + rx, 0, width - 1);
      var ry = int(random(-diffusion, diffusion));
      curvePointY = constrain(y + ry, 0, height - 1);
      curveVertex(curvePointX, curvePointY);
    }
    curveVertex(curvePointX, curvePointY);

    pop();
    endShape();

    x = curvePointX;
    y = curvePointY;
  }
}

/* COMANDOS POR TECLADO */
function keyReleased() {
  if (keyCode == DELETE || keyCode == BACKSPACE) {
    clear();
    background(255);
  }
}
