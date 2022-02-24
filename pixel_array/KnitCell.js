class KnitCell {
    static toggle_delay = 500; // ignore toggles for 10ms after switch

    constructor(on_needle, row, col, x0, y0, x1, y1) {
        this.on = on_needle;
        this.row = row;
        this.col = col;
        this.x0 = x0;
        this.y0 = y0;
        this.x1 = x1;
        this.y1 = y1;
        this.knit_stitch = true; // true for knit, false for purl
        this.toggle_time = millis(); // time of last toggle, for debouncing
    }

    // check if clicked, and toggle color if so
    checkClicked() {
        if ((millis() - this.toggle_time) > KnitCell.toggle_delay) {
            if (this.on) {
                if ((mouseX > this.x0) && (mouseX < this.x1) && (mouseY > this.y0) && (mouseY < this.y1)) {
                    this.toggle_time = millis();
                    this.knit_stitch = knit_click; // set to active color
                    // this.knit_stitch = !this.knit_stitch; // toggle knit
                    return true;
                }
            }
        }
        return false;
    }

    display() {
        if (this.on) {
            if (this.knit_stitch) { fill(knit_color); }
            else { fill(purl_color); }
            strokeWeight(.5);
            stroke(0,0,0,50);
        }
        else {
            fill(off_color);
            noStroke();
        }
        
        rectMode(CORNERS);
        rect(this.x0,this.y0,this.x1,this.y1);
    }
}