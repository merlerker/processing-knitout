// knit bed setup
let BED_NEEDLES = 550; // 36 in or 91 cm
let INCHES = 10;
let num_cols = Math.round(BED_NEEDLES * INCHES/36);
let num_rows; // calculated later to make a square
let gauge = 1;

// controls + control states
let gauge_sel, inch_input, grid_button, filename_input, save_button;
let filename = 'output_filename'; // filename user has input
let knit_click = false; // switch telling whether clicks turn cells into purls (black) or knits (white)
let brush_size = 1; // radius of click

let grid = [];
let pad_x = 350; // adjust this to fit grid in window
let pad_y = 50;
let cell_w, cell_h;

let knit_color, purl_color, off_color; 


function setup() {
  createCanvas(windowWidth, windowHeight);

  cell_w = (windowWidth - 2*pad_x) / num_cols;
  cell_h = 0.8 * cell_w; // a 7x7 rectangle of stitches is 8 x 10 mm
  num_rows = Math.round((cell_w * num_cols) / cell_h); // make a square

  knit_color = color(255);
  purl_color = color(0);
  off_color = color(220); // not on needle / in gauge

  let x_pos = pad_y;
  gauge_sel = createSelect();
  gauge_sel.position(x_pos,pad_y);
  gauge_sel.option('1');
  gauge_sel.option('1/2');
  gauge_sel.option('1/3');
  gauge_sel.option('1/4');
  gauge_sel.changed(changeGauge);
  x_pos += 50;

  let input_w = 50;
  inch_input = createInput(INCHES);
  inch_input.position(x_pos, pad_y);
  inch_input.size(input_w);
  inch_input.input(updateInches);
  x_pos += input_w+10;

  grid_button = createButton('Make grid');
  grid_button.position(x_pos, pad_y);
  grid_button.mousePressed(makeGrid);
  x_pos += 120;

  input_w = 150;
  filename_input = createInput(filename);
  filename_input.position(x_pos, pad_y);
  filename_input.size(input_w);
  filename_input.input(updateFilename);
  x_pos += input_w + 10;

  save_button = createButton('Save grid');
  save_button.position(x_pos, pad_y);
  save_button.mousePressed(saveGrid);
  x_pos += 80;

  makeGrid(pad_x, 1.5*pad_y);
}


function draw() {
  background(255);

  // controls labels
  let x_pos = pad_y;
  textAlign(LEFT, TOP);
  fill(0);
  text("press p for purl (black) and k for knit (white), number to change size", x_pos, pad_y*.25);
  text("Gauge:", x_pos, pad_y*.75);
  text("Width (in):", x_pos+50, pad_y*.75);

  drawGrid();
}

function mouseDragged() {
  clickGrid();
  return false;
}

function changeGauge() {
  gauge = 1/eval(gauge_sel.value());
  print(gauge);
}

function updateFilename() {
  filename = filename_input.value();
}

function updateInches() {
  INCHES = inch_input.value();
  num_cols = Math.round(BED_NEEDLES * INCHES/36);
  cell_w = (windowWidth - 2*pad_x) / num_cols;
  cell_h = 0.8 * cell_w; // a 7x7 rectangle of stitches is 8 x 10 mm
  num_rows = Math.round((cell_w * num_cols) / cell_h); // make a square
}

function keyTyped() {
  if (key == 'k') {
    print("clicks will make cells knit (white)");
    knit_click = true;
  }
  if (key == 'p') {
    print("clicks will make cells purls (black)");
    knit_click = false;
  }
  // if key is a number
  if ( /^\d+$/.test(key) ) {
    brush_size = Math.floor(int(key)/2);
    print(`click radius is now ${brush_size}`)
  }
}

function indexGrid(row, col) {
  return row*num_cols + col;
}

function makeGrid(_x, _y) {
  grid = [];
  let start_x = _x || pad_x;
  let start_y = _y || pad_y;
  for (let row=0; row<num_rows; row++) {
    for (let col=0; col<num_cols; col++) {
      // this cell is on a needle if it falls into the gauge
      let on_needle = false;
      if (col % gauge == 0) { on_needle = true; }

      let x0 = col*cell_w + start_x;
      let y0 = row*cell_h + start_y;
      let x1 = x0 + cell_w;
      let y1 = y0 + cell_h;
      let myCell = new KnitCell(on_needle, row, col, x0, y0, x1, y1);
      grid.push(myCell);
    }
  }
}

function drawGrid() {
  for (let i=0; i<grid.length; i++) {
    grid[i].display();
  }
}

function clickGrid() {
  let clicked_r,clicked_c;
  for (let i=0; i<grid.length; i++) {
    // check clicked sets the center cell to the active color, now set surrounding cells
    if (grid[i].checkClicked()) {
      if (brush_size>1) {
        clicked_r = Math.floor(i/num_cols);
        clicked_c = i - clicked_r*num_cols;
        print(`clicked ${clicked_r} ${clicked_c}`)

        // brush size --> larger area for changing the click
        for (let check_r=max(0,clicked_r - brush_size); check_r<min(num_rows,clicked_r+brush_size+1); check_r++) {
          for (let check_c=max(0,clicked_c-brush_size); check_c<min(num_cols,clicked_c+brush_size+1); check_c++) {
            print(`checking ${check_r}, ${check_c}`)
            grid[indexGrid(check_r,check_c)].knit_stitch = knit_click;
          }
        }
      }
      break; // can only click in one spot at a time
    }
  }
}

// turns grid into and array where each entry (row) is a string of k and p
function gridToString() {
  let grid_arr = [];
  for (let row=0; row<num_rows; row++) {
    let row_str = "";
    for (let col=0; col<num_cols; col++) {
      thisCell = grid[indexGrid(row,col)];
      if (thisCell.knit_stitch) { row_str += "k"; }
      else { row_str += "p"; }
    }
    grid_arr.push(row_str);
  }
  return grid_arr;
}

// turns string of k and p in grid (load in)
// stringToGrid(loaded, pad_x, 1.5*pad_y)
function stringToGrid(txt, _x, _y) {
  let grid_arr = [];
  let start_x = _x || pad_x;
  let start_y = _y || pad_y;
  for (let row=0; row<num_rows; row++) {
    for (let col=0; col<num_cols; col++) {
      // this cell is on a needle if it falls into the gauge
      let on_needle = false;
      if (col % gauge == 0) { on_needle = true; }

      let x0 = col*cell_w + start_x;
      let y0 = row*cell_h + start_y;
      let x1 = x0 + cell_w;
      let y1 = y0 + cell_h;
      let myCell = new KnitCell(on_needle, row, col, x0, y0, x1, y1);

      if (txt[row][col]=='p') {
        myCell.knit_stitch = false;
      }
      grid_arr.push(myCell);
    }
  }
  grid = grid_arr;
}

function saveGrid() {
  let writer = new KnitoutWriter(filename, 9, 10, grid, num_rows, num_cols); // carrier1, carrier2, grid, num_rows, num_cols
  writer.write();
}