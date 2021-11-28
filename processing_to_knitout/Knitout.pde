class Knitout {
  static public final int FULL_GAUGE = 1; // every 1 needle
  static public final int HALF_GAUGE = 2;
  
  int mode; //0-single color, 1-two color
  int gauge;
  int carrier1; // lighter color
  int carrier2; // darker color
  int cols; //needles
  int rows; //rows of knits
  int cell_w; //pixel width of a knit
  int cell_h; //pixel heigh of a knit
  int knit_pad = 2; // padding rows of knits to add at top/bottom
  float threshold = 180; // above threshold (white) = knit, below threshold (black) = purl
  
  String[] pattern; //keep track of the pattern
    
  PrintWriter output;
  
  public Knitout(int gauge, int c, float w_in) {
    mode = 0;
    //gauge = machine_gauge; //stitches per inch
    int machine_gauge = 15; // needles per inch
    carrier1 = c;
    cols = ceil(machine_gauge*w_in); //num of needles (round up)
    cell_w = cell_h = int(width/cols);
    rows = ceil(height/cell_h);
    cell_h = int(height/rows); //correct the cell_h after rounding
    
    pattern = new String[rows+knit_pad*2];
    
    //float width_in = cols/gauge;
    //float height_in = rows/gauge;
  }
  
  public Knitout(int machine_gauge, int c1, int c2, float w_in) {
    mode = 1;
    gauge = machine_gauge; //needles per inch
    carrier1 = c1;
    carrier2 = c2;
    cols = ceil(gauge*w_in); //num of needles (round up)
    cell_w = cell_h = int(width/cols);
    rows = ceil(height/cell_h);
    cell_h = int(height/rows); //correct the cell_h after rounding
    
    pattern = new String[rows+knit_pad*2];
  }
  
  void display() {

  }
  
  
  ///////////////////////////////////////////////////////////
  // PATTERN
  ///////////////////////////////////////////////////////////
  
  
  // generates pattern as a string array of k (knits) and p (purls)
  private void generatePattern() {
    for (int r=0; r<pattern.length; r++) {
      String row = "";
      if (r<knit_pad || r>=(pattern.length-knit_pad)){
        row = stringRepeat("k", cols);
      }
      else {
        for (int c=0; c<cols; c++) {
          // pixel is light, so knit
          if (avg_color(r,c)>threshold) {
            row += "k";
          }
          // pixel is dark, so purl
          else {
            row += "p";
          }
        }
      }
      pattern[r] = row;
    }
  }
    
  
  
  private float avg_color(int row, int col) {
    int[] coords = get_cell_bounds(row, col);
    float total_brightness = 0;
    int pixel_ct = (coords[2]-coords[0])*(coords[3]-coords[1]);
    
    // go through every pixel in the cell and get the color
    for (int x=coords[0]; x<coords[2]; x++) {
      for (int y=coords[1]; y<coords[3]; y++) {
        //color c = get(x,y);
        
        //int loc = x*y; // this is wrong but fun
        int loc = x + y * width;
        color c = pixels[loc];
        //println(hex(c));
        total_brightness += brightness(c);
      }
    }
    
    return total_brightness/pixel_ct;
  }
  
  
  
  private int[] get_cell_bounds(int row, int col) {
    int[] coords = new int[4];
    coords[0] = col*cell_w; //x0
    coords[1] = row*cell_h; //y0
    coords[2] = min((col+1)*cell_w, width); //x1
    coords[3] = min((row+1)*cell_h, height); //y1
    return coords;
  }
  
  private String stringRepeat(String s, int times) {
    return new String(new char[times]).replace("\0", s);
  }
  
  
  ///////////////////////////////////////////////////////////
  // WRITE KNIT
  ///////////////////////////////////////////////////////////
  
  
  void write() {
    generatePattern();
    println(pattern);
    output = createWriter("knitout_test.k");
    castOn();
    
    for (int r=0; r<pattern.length; r++) {
      // xfer only if we're using one yarn
      if (mode==0) {
        xfers(r);
      }
      
      // on even rows we knit left
      if (r%2==0) {
        knitL(r);
      }
      // on odd rows we knit right
      else {
        knitR(r);
      }
    }
    
    bindOff();
    output.flush(); // Writes the remaining data to the file
    output.close(); // Finishes the file
  }
  
    
  private void xfers(int r) {
    // first row, all needles start on front
    if (r==0) {
      for (int c=0; c<cols; c++) {
        if (pattern[r].charAt(c)=='p') {
          output.println("xfer f" + str(c) + " b" + str(c));
        }
      }
    }
    
    // other rows, swap needles when changing from knit to perl & vv
    else {
      for (int c=0; c<cols; c++) {
        if (pattern[r].charAt(c)=='k' && pattern[r-1].charAt(c)=='p') {
          output.println("xfer b" + str(c) + " f" + str(c));
        }
        else if (pattern[r].charAt(c)=='p' && pattern[r-1].charAt(c)=='k') {
          output.println("xfer f" + str(c) + " b" + str(c));
        }
      }
    }
  }
  
  
  
  private void knitL(int r) {
    switch(mode) {
      case 0:
        for (int c=cols-1; c>=0; c--) {
          // knit
          if (pattern[r].charAt(c)=='k') {
            output.println("knit - f" + str(c) + " " + str(carrier1));
          }
          // pixel is dark, so purl
          else {
            output.println("knit - b" + str(c) + " " + str(carrier1));
          }
        }
        break;
      case 1:
        // each line of pattern make two passes right/left: 
        // one with carrier1: f if k, b if p
        // one with carrier2: b if k, f if p
       for (int c=cols-1; c>=0; c--) {
          // pixel is light, so knit in front
          if (pattern[r].charAt(c)=='k') {
            output.println("knit - f" + str(c) + " " + str(carrier1));
          }
          // pixel is dark, so knit in back
          else {
            output.println("knit - b" + str(c) + " " + str(carrier1));
          }
        }
        for (int c=cols-1; c>=0; c--) {
          // pixel is light, so knit in back
          if (pattern[r].charAt(c)=='k') {
            output.println("knit - b" + str(c) + " " + str(carrier2));
          }
          // pixel is dark, so knit in front
          else {
            output.println("knit - f" + str(c) + " " + str(carrier2));
          }
        }
        break;
    }
  }
  
  
  private void knitR(int r) {
    switch(mode) {
      case 0:
        for (int c=0; c<cols; c++) {
          // knit
          if (pattern[r].charAt(c)=='k') {
            output.println("knit + f" + str(c) + " " + str(carrier1));
          }
          // pixel is dark, so purl
          else {
            output.println("knit + b" + str(c) + " " + str(carrier1));
          }
        }
        break;
      case 1:
        // each line of pattern make two passes right/left: 
        // one with carrier1: f if k, b if p
        // one with carrier2: b if k, f if p
       for (int c=0; c<cols; c++) {
          // pixel is light, so knit in front
          if (pattern[r].charAt(c)=='k') {
            output.println("knit + f" + str(c) + " " + str(carrier1));
          }
          // pixel is dark, so knit in back
          else {
            output.println("knit + b" + str(c) + " " + str(carrier1));
          }
        }
        for (int c=0; c<cols; c++) {
          // pixel is light, so knit in back
          if (pattern[r].charAt(c)=='k') {
            output.println("knit + b" + str(c) + " " + str(carrier2));
          }
          // pixel is dark, so knit in front
          else {
            output.println("knit + f" + str(c) + " " + str(carrier2));
          }
        }
        break;
    }
  }
    
  
  
  // knit a couple normal rows
  private void castOn() {
    output.println(";!knitout-2");
    output.println(";;Carriers: 1 2 3 4 5 6 7 8 9 10");
    output.println("inhook " + str(carrier1));
    
    // tuck left
    for (int needle=cols-1; needle>0; needle-=2) {
      output.println("tuck - f" + str(needle) + " " + str(carrier1));
    }
    // tuck right
    for (int needle=0; needle<cols; needle+=2) {
      output.println("tuck + f" + str(needle) + " " + str(carrier1));
    }
    output.println("releasehook " + str(carrier1));
    
    switch(mode) {
      case 0:
        //output.println("x-stitch-number 63");
        output.println("x-stitch-number 68");
        break;
      case 1:
        output.println("inhook " + str(carrier2));
        // both knit left
        for (int c=cols-1; c>=0; c--) {
            output.println("knit - f" + str(c) + " " + str(carrier2));
        }
        for (int c=cols-1; c>=0; c--) {
            output.println("knit - f" + str(c) + " " + str(carrier1));
        }
        // both knit right, alternating front and back
        for (int c=0; c<cols; c++) {
          // even stitches on the front
          if (c%2 == 0) {
            output.println("knit + f" + str(c) + " " + str(carrier2));
          }
          // odd stitches on the back
          else {
            output.println("knit + b" + str(c) + " " + str(carrier2));
          }
        }
        for (int c=0; c<cols; c++) {
          // even stitches on the back
          if (c%2 == 0) {
            output.println("knit + b" + str(c) + " " + str(carrier1));
          }
          // odd stitches on the front
          else {
            output.println("knit + f" + str(c) + " " + str(carrier1));
          }
        }
        output.println("releasehook " + str(carrier2));
        output.println("x-stitch-number 63");
        break;
      }
    }
  
  
  // bind off
  private void bindOff() {
    output.println("outhook " + str(carrier1));
    
    if (mode==1) {
      output.println("outhook " + str(carrier2));
    }
  }
}
