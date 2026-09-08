var video;
var curvePointX = 0;
var curvePointY = 0;
var pointCount = 0.5;
var diffusion = 0;
var streamReady = false;

var inputText = 'QUERIBLE';
var kerning = 1; // between letters

var fontSize = 10;
var drawRate = 740; // strokes drawn per frame

/* CONFIGURACION */
function setup() {
  var cnv = createCanvas(490, 740);
  cnv.parent('canvas');
  background(255);
  // Recibe imagen
  video = createCapture(VIDEO, function() {
    streamReady = true;
  });
  video.size(width*2 * pixelDensity(), height * pixelDensity());
  video.hide();

  textFont('Times');
  textSize(fontSize);
  textAlign(LEFT, CENTER);
}


/* VISUALIZACION */
function draw() {
  if (streamReady) {

  textSize(fontSize);

  var word = inputText.toUpperCase();
  var x = 0;
  var y = 0;
  var counter = 0;

    // translate position (display) to position (image)
    video.loadPixels();

    for (var j = 0; j < drawRate; j++) {

      // Retrieve color from capture device
      var c = color(video.get(x, y));

      noStroke();
      push();
      translate(x, y);

      var letter = word.charAt(counter);
      fill(c);
	    text(word, -width/2 , 0);
	    var letterWidth = textWidth(letter) + kerning;
	    // for the next letter ... x + letter width
	    x += letterWidth;

      // Distancia entre palabras
      diffusion = round(map(width, 0, height, 500, 100));

      beginShape();
      curveVertex(x, y);
      curveVertex(x, y);

      for (var i = 0; i < pointCount; i++) {
        var rx = int(random(-diffusion, diffusion));
        curvePointX = constrain(x + rx, 0, width*2 - 1);
        var ry = int(random(-diffusion, diffusion));
        curvePointY = constrain(y + ry, 0, height*2 - 1);
        curveVertex(curvePointX, curvePointY);
      }
      curveVertex(curvePointX, curvePointY);
      
      pop();
      endShape();

      x = curvePointX;
      y = curvePointY;
    }
  }
}

/* COMANDOS POR TECLADO */
function keyReleased() {
  if (keyCode == DELETE || keyCode == BACKSPACE) {
    clear();
    background(255);
  }
}