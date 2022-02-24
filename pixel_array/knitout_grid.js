// knit bed setup
let BED_NEEDLES = 550; // 36 in or 91 cm
let INCHES = 6;
let num_cols = Math.round(BED_NEEDLES * INCHES/36);
let num_rows; // calculated later to make a square
let gauge = 1;

// controls + control states
let gauge_sel, grid_button, filename_input, save_button;
let filename = 'output_filename'; // filename user has input
let knit_click = false; // switch telling whether clicks turn cells into purls (black) or knits (white)

let grid = [];
let pad_x = 350; // adjust this to fit grid in window
let pad_y = 80;
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

  let x_pos = 2*pad_y;
  gauge_sel = createSelect();
  gauge_sel.position(x_pos,pad_y);
  gauge_sel.option('1');
  gauge_sel.option('1/2');
  gauge_sel.option('1/3');
  gauge_sel.option('1/4');
  gauge_sel.changed(changeGauge);
  x_pos += 50;

  grid_button = createButton('Make grid');
  grid_button.position(x_pos, pad_y);
  grid_button.mousePressed(makeGrid);
  x_pos += 120;

  let input_w = 150;
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
  text("press p for purl (black) and k for knit (white)", x_pos, pad_y*.5);
  text("Gauge:", x_pos, pad_y);

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

function keyTyped() {
  if (key == 'k') {
    print("clicks will make cells knit (white)");
    knit_click = true;
  }
  if (key == 'p') {
    print("clicks will make cells purls (black)");
    knit_click = false;
  }
}

function indexGrid(row, col) {
  return row*num_cols + col;
}

function makeGrid(_x, _y) {
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
  for (let i=0; i<grid.length; i++) {
    grid[i].checkClicked();
  }
}

// turns grid into and array where each entry (row) is a string of k and p
function gridToString() {
  let grid_arr = [];
  for (let row=0; row<num_rows; row++) {
    let row_str = "";
    for (let col=0; col<num_cols; col++) {
      thisCell = grid[indexGrid(row,col)];
      if (thisCell.knit_stitch) { row_str += "0"; }
      else { row_str += "1"; }
    }
    grid_arr.push(row_str);
  }
  return grid_arr;
}

function saveGrid() {
  let writer = new KnitoutWriter(filename, 9, 10, grid, num_rows, num_cols); // carrier1, carrier2, grid, num_rows, num_cols
  writer.write();
}