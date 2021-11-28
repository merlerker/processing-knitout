// takes a grid of knitcells and writes to a knitout file

class KnitoutWriter {

    constructor(filename, carrier1, carrier2, grid, num_rows, num_cols) {
        this.filename = filename;
        this.output = createWriter(this.filename + ".k");

        this.carrier1 = carrier1; // lighter color (knits)
        this.carrier2 = carrier2; // darker color (purls)
        this.mode = 1; //0-single color, 1-two color

        if (carrier2 == undefined) {
            this.mode = 0;
        }

        this.grid = grid; // array of KnitCells
        this.grid_str = gridToString(grid); // array where each entry (row) is a string
        this.num_rows = num_rows;
        this.num_cols = num_cols;
    }

    write() {
        this.castOn();
    
        for (let r=0; r<this.grid_str.length; r++) {
            // xfer only if we're using one yarn
            if (this.mode==0) {
                this.xfers(r);
            }
            
            // on even rows we knit left
            if (r%2==0) {
                this.knitL(r);
            }
            // on odd rows we knit right
            else {
                this.knitR(r);
            }
        }
        
        this.bindOff();
        // this.output.flush(); // Writes the remaining data to the file
        this.output.close(); // Finishes the file
    }

    xfers(r) {
        // first row, all needles start on front
        if (r==0) {
          for (let c=0; c<this.num_cols; c++) {
            if (this.grid_str[r].charAt(c)=='p') {
              this.output.print("xfer f" + str(c) + " b" + str(c) + "");
            }
          }
        }
        
        // other rows, swap needles when changing from knit to perl & vv
        else {
            for (let c=0; c<this.num_cols; c++) {
                if (this.grid_str[r].charAt(c)=='k' && this.grid_str[r-1].charAt(c)=='p') {
                    this.output.print("xfer b" + str(c) + " f" + str(c) + "");
                }
                else if (this.grid_str[r].charAt(c)=='p' && this.grid_str[r-1].charAt(c)=='k') {
                    this.output.print("xfer f" + str(c) + " b" + str(c) + "");
                }
          }
        }
      }
      
      
      
    knitL(r) {
        switch(this.mode) {
            // one color
            case 0:
                for (let c=this.num_cols-1; c>=0; c--) {
                    // knit
                    if (this.grid_str[r].charAt(c)=='k') {
                        this.output.print("knit - f" + str(c) + " " + str(this.carrier1) + "");
                    }
                    // pixel is dark, so purl
                    else {
                        this.output.print("knit - b" + str(c) + " " + str(this.carrier1) + "");
                    }
                }
                break;
            // two color
            case 1:
                // each line of pattern makes two passes right/left: 
                // one with this.carrier1: f if k, b if p
                // one with this.carrier2: b if k, f if p
                for (let c=this.num_cols-1; c>=0; c--) {
                    // pixel is light, so knit in front
                    if (this.grid_str[r].charAt(c)=='k') {
                        this.output.print("knit - f" + str(c) + " " + str(this.carrier1) + "");
                    }
                    // pixel is dark, so knit in back
                    else {
                        this.output.print("knit - b" + str(c) + " " + str(this.carrier1) + "");
                    }
                }
                for (let c=this.num_cols-1; c>=0; c--) {
                    // pixel is light, so knit in back
                    if (this.grid_str[r].charAt(c)=='k') {
                        this.output.print("knit - b" + str(c) + " " + str(this.carrier2) + "");
                    }
                    // pixel is dark, so knit in front
                    else {
                        this.output.print("knit - f" + str(c) + " " + str(this.carrier2) + "");
                    }
                }
                break;
        }
    }
    
    
    knitR(r) {
        switch(this.mode) {
            case 0:
                for (let c=0; c<this.num_cols; c++) {
                    // knit
                    if (this.grid_str[r].charAt(c)=='k') {
                        this.output.print("knit + f" + str(c) + " " + str(this.carrier1) + "");
                    }
                    // pixel is dark, so purl
                    else {
                        this.output.print("knit + b" + str(c) + " " + str(this.carrier1) + "");
                    }
                }
                break;

            case 1:
                // each line of pattern make two passes right/left: 
                // one with this.carrier1: f if k, b if p
                // one with this.carrier2: b if k, f if p
                for (let c=0; c<this.num_cols; c++) {
                    // pixel is light, so knit in front
                    if (this.grid_str[r].charAt(c)=='k') {
                    this.output.print("knit + f" + str(c) + " " + str(this.carrier1) + "");
                    }
                    // pixel is dark, so knit in back
                    else {
                    this.output.print("knit + b" + str(c) + " " + str(this.carrier1) + "");
                    }
                }
                for (let c=0; c<this.num_cols; c++) {
                    // pixel is light, so knit in back
                    if (this.grid_str[r].charAt(c)=='k') {
                    this.output.print("knit + b" + str(c) + " " + str(this.carrier2) + "");
                    }
                    // pixel is dark, so knit in front
                    else {
                    this.output.print("knit + f" + str(c) + " " + str(this.carrier2) + "");
                    }
                }
                break;
        }
    }
    
    
    
    // knit a couple normal rows
    castOn() {
        this.output.print(";!knitout-2" + "");
        this.output.print(";;Carriers: 1 2 3 4 5 6 7 8 9 10" + "");
        this.output.print("inhook " + str(this.carrier1) + "");
        
        // tuck left
        for (let needle=this.num_cols-1; needle>0; needle-=2) {
            this.output.print("tuck - f" + str(needle) + " " + str(this.carrier1) + "");
        }
        // tuck right
        for (let needle=0; needle<this.num_cols; needle+=2) {
            this.output.print("tuck + f" + str(needle) + " " + str(this.carrier1) + "");
        }
        this.output.print("releasehook " + str(this.carrier1) + "");
        
        switch(this.mode) {
            case 0:
                //this.output.print("x-stitch-number 63" + "");
                this.output.print("x-stitch-number 68" + "");
                break;
            case 1:
                this.output.print("inhook " + str(this.carrier2) + "");
                
                // both knit left, first yarn 2 (blue) then yarn 1 (red)
                for (let c=this.num_cols-1; c>=0; c--) {
                    this.output.print("knit - f" + str(c) + " " + str(this.carrier2) + "");
                }
                for (let c=this.num_cols-1; c>=0; c--) {
                    this.output.print("knit - f" + str(c) + " " + str(this.carrier1) + "");
                }

                // both knit right, alternating front and back
                // yarn 1 is on top, so start with yarn 2 so they interlock
                for (let c=0; c<this.num_cols; c++) {
                    // even stitches on the front
                    if (c%2 == 0) {
                        this.output.print("knit + f" + str(c) + " " + str(this.carrier2) + "");
                    }
                    // odd stitches on the back
                    else {
                        this.output.print("knit + b" + str(c) + " " + str(this.carrier2) + "");
                    }
                }
                // now yarn 1, on opposite needles
                for (let c=0; c<this.num_cols; c++) {
                    // even stitches on the back
                    if (c%2 == 0) {
                        this.output.print("knit + b" + str(c) + " " + str(this.carrier1) + "");
                    }
                    // odd stitches on the front
                    else {
                        this.output.print("knit + f" + str(c) + " " + str(this.carrier1) + "");
                    }
                }

                // both knit left, alternating front and back the other way
                // now start with yarn 1
                for (let c=this.num_cols-1; c>=0; c--) {
                    // even stitches on the front
                    if (c%2 == 0) {
                        this.output.print("knit - f" + str(c) + " " + str(this.carrier1) + "");
                    }
                    // odd stitches on the back
                    else {
                        this.output.print("knit - b" + str(c) + " " + str(this.carrier1) + "");
                    }
                }
                // now yarn 2
                for (let c=this.num_cols-1; c>=0; c--) {
                    // even stitches on the back
                    if (c%2 == 0) {
                        this.output.print("knit - b" + str(c) + " " + str(this.carrier2) + "");
                    }
                    // odd stitches on the front
                    else {
                        this.output.print("knit - f" + str(c) + " " + str(this.carrier2) + "");
                    }
                }

                // both knit right, first yarn 1 then yarn 2
                for (let c=0; c<this.num_cols; c++) {
                    this.output.print("knit + f" + str(c) + " " + str(this.carrier1) + "");
                }
                for (let c=0; c<this.num_cols; c++) {
                    this.output.print("knit + f" + str(c) + " " + str(this.carrier2) + "");
                }

                this.output.print("releasehook " + str(this.carrier2) + "");
                this.output.print("x-stitch-number 63" + "");
                break;
        }
    }
    
    
    // bind off
    bindOff() {
        this.output.print("outhook " + str(this.carrier1) + "");
        
        if (this.mode==1) {
            this.output.print("outhook " + str(this.carrier2) + "");
        }
    }


}