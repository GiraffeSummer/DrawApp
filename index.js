require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const db = require('monk')(process.env.DB_HOST)
const cors = require('cors')
const { Pixel } = require('./classes')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http);

const port = process.env.PORT || 3000

const pixels = db.get('pixels')
const updates = db.get('updates')
pixels.createIndex('x y')

const responses = {
    id: 0,
    createnew: false,
    structure: {
        id: 0,
        stat: true,
        data: {}
    },
    list: []
}

const settings = {
    size: 100,
    scale: 10,
    get dimensions() {
        return `${this.size}x${this.size}`
    }
}

app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())


app.get('/requests', (req, res) => {
    res.json(responses.list)
})

app.get('/grid', (req, res) => {
    res.json(grid)
})
let grid;

io.on('connection', (socket) => {
    io.emit('start', { grid: grid, settings: settings });
});

app.put('/', (req, res) => {
    let stat = UpdateGrid(req.body.x, req.body.y, req.body.color)
    let ob = JSON.parse(JSON.stringify(responses.structure))
    ob.id = responses.id;
    ob.data = req.body;
    responses.id++;
    responses.list.push(ob);
    updates.insert(ob);
    io.emit('update', grid)
    res.json(ob)
})

http.listen(port, async () => {
    let makeNew = (await pixels.count() < 1 || responses.createnew)
    console.log(makeNew ? "Creating New" : "Loading data")
    if (makeNew) {
        pixels.drop()
        grid = CreateGrid();
        for (let i = 0; i < grid.length; i++) {
            pixels.insert(grid[i]);
        }
    }
    else {
        pixels.find({}, { fields: { _id: 0 } }).then((docs) => {
            grid = docs;
            io.emit('start', { grid: grid, settings: settings });
        })
        updates.find({}, { sort: { id: -1 }, limit: 1 }).then((docs) => {
            docs = docs[0]
            let count = (docs) ? docs.id + 1 : 0;
            responses.id = count;
        })
    }

    console.log(`Example app listening at http://localhost:${port}`)
})

function CreateGrid() {
    let grid = []
    let x = 0;
    let y = 0;
    for (let i = 0; i < settings.size * settings.size; i++) {
        grid[i] = new Pixel(x, y, "#ffffff");
        if (x >= settings.size) {
            y++;
            x = 0;
        } else x++;
    }
    return grid
}
function UpdateGrid(x, y, c) {
    x = x.clamp(0, settings.size)
    y = y.clamp(0, settings.size)
    let index = grid.findIndex(g => {
        if (g.x == x && g.y == y) return g
    })
    console.log("trying update " + index)
    if (index > -1) {
        grid[index].color = c;
        pixels.update({ x: x, y: y }, { $set: { color: c } }).then((a) => {
            
        })
    }
    return (index > -1)
}