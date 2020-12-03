const { createCanvas, loadImage } = require('canvas')

module.exports.RenderGrid = (grid, settings) => {
    const canvas = createCanvas(200, 200)
    const ctx = canvas.getContext('2d')

    for (let i = 0; i < grid.length; i++) {
        let p = grid[i]
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x * settings.scale, p.y * settings.scale, settings.scale, settings.scale);
    }

    return canvas.toDataURL();
}