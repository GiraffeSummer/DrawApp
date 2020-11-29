
let settings
let canvas

function setup() { }

function Start(data) {
  if (typeof canClickPixel === 'undefined') canClickPixel = false;
  settings = data.settings;
  canvas = createCanvas(settings.size * settings.scale, settings.size * settings.scale);

  DrawGrid(data.grid)
}

function mouseClicked() {
  if (!canClickPixel) return;
  let x = Math.floor(mouseX / settings.scale);
  let y = Math.floor(mouseY / settings.scale);

  if (x >= 0 && y >= 0 && x < settings.scale && y < settings.scale) {
    if (colorDropper.checked) {
      let pix =   globalGrid.find(g => { return (g.x === x && g.y === y) })
      if (pix) {
        colorPicker.color.hexString = pix.color;
        colorDropper.checked = false;
      }
    } else {
      SetVals(x, y)
    }
  }
}

function Save() {
  saveCanvas();
}

function DrawGrid(grid) {
  globalGrid = grid;
  for (let i = 0; i < grid.length - 1; i++) {
    let p = grid[i]
    noStroke();
    let c = color(p.color);
    fill(c);
    rect(p.x * settings.scale, p.y * settings.scale, settings.scale, settings.scale)
  }
}

