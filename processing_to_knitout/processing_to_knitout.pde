/*
Moire Pattern code from: https://thinkspacestudio.com/tutorials/moire_loops_in_java
*/

Knitout knit;
PImage img;
boolean show_grid;

void setup() {
  size(600,600);
  //size(600,1200); // calendar
  knit = new Knitout(15, 9, 6);
  img = loadImage("penrose.png");
  show_grid = false;
}

/*
// penrose image
void draw() {
  loadPixels();
  background(0);
  image(img,0,0);
  if (show_grid) {
    knit.display();
  }
}
*/

///*
// moire circles
void draw() {
  loadPixels();
  background( 0 );

  noFill();
  stroke( 255 );
  strokeWeight(6);

  int oneThirdWidth = width / 3;
  int twoThirdsWidth = 2 * width / 3;

  // draw the set of concentric circles on the left:
  for( int n = 0; n < twoThirdsWidth; n = n + 30 ) {
    ellipse( oneThirdWidth, height / 2, n, n );
  }

  // draw the set of concentric circles on the right:
  for( int n = 0; n < twoThirdsWidth; n = n + 30 ) {
    ellipse( twoThirdsWidth, height / 2, n, n );
  }
}
//*/

/*
// moire box
int increment = 15;
void draw()
{
  loadPixels();
  background( 255 );
  noFill();
  stroke( 0 );
  strokeWeight(2);

  // loop from left to right:
  for ( int x = 0; x <= width; x = x + increment ) {
    line( mouseX, mouseY, x, 0 ); // draw line to the top
    line( mouseX, mouseY, x, height ); // draw line to the bottom
  }

  // loop from top to bottom::
  for ( int y = increment; y < height; y = y + increment ) {
    line( mouseX, mouseY, 0, y ); // draw line to the left
    line( mouseX, mouseY, width, y ); // draw line to the right
  }
}
*/

/*
// calendar
void drawCal()
{
  PFont.list();
  PFont myFont = createFont("Futura", 48);
  int months = 12;
  int margin = 10;
  float month_w = width-(2*margin);
  float month_h = ((height-margin)/months)-margin;
  
  loadPixels();
  background( 255 );
  noStroke();
  for (int m=1; m<=months; m++) {
    fill(0);
    rect(margin, height-(month_h*m + margin*m), month_w, month_h);
    fill(255);
    textAlign(CENTER, CENTER);
    textFont(myFont);
    textSize(48);
    text(str(m), width/2, height-(month_h*m + margin*m)+(month_h/2));
  }
}

void draw() {
  drawCal();
}
*/

void keyPressed() {
  if (key == '1') {
    knit = new Knitout(15, 9, 6);
  }
  else if (key == '2') {
    knit = new Knitout(15, 9, 10, 6);
  }
  else if (key == 's') {
    knit.write();
  }
}
