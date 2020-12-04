require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const db = require('monk')(process.env.DB_HOST)
const cors = require('cors')
const { Pixel } = require('./classes')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http);
const serverRender = require('./serverRender')
const fs = require('fs')

const port = process.env.PORT || 3000

const pixels = db.get('pixels')
const updates = db.get('updates')
pixels.createIndex('x y')

const responses = {
    id: 0,
    createnew: false,
    structure: {
        id: 0,
        success: true,
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

const sessions = {
    sessions: [],

    push: (o) => { this.sessions.push(o) },
    new: () => {
        return {
            name: "",
            id: "",
            grid: {},
            image: "base64",
            imagePath: `./images/data/${this.id}.png`
        }
    }
}

app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(cors())
app.use(bodyParser.json())

let grid;

app.get('/requests', (req, res) => {
    res.json(responses.list)
})

app.get('/grid', (req, res) => {
    res.json(grid)
})

io.on('connection', (socket) => {
    io.emit('start', { grid: grid, settings: settings });
});

app.get('/image.png', (req, res) => {

    let img = serverRender.RenderGrid(grid, settings)

    const base64Data = img.replace(/^data:image\/png;base64,/, "");

    fs.writeFile("./public/images/data/out.png", base64Data, 'base64', function (err) { });

    res.render('image', { /*grid: grid,*/ settings: settings, img: img, imgUrl: `https://27e846cb8695.ngrok.io/images/data/out.png` });
});

app.put('/', (req, res) => {
    let socketClient = req.body.socket
    let clients = Array.from(io.sockets.sockets.keys());

    //spam prevention
    if (clients.includes(socketClient)) {
        let stat = UpdateGrid(req.body.x, req.body.y, req.body.color)
        let ob = JSON.parse(JSON.stringify(responses.structure))
        ob.id = responses.id;
        ob.data = req.body;
        delete ob.data.socket;
        responses.id++;
        responses.list.push(ob);
        updates.insert(ob)
        io.emit('update', grid)
        res.json(ob)
    } else {
        res.json({ success: false, reason: "Not a valid session" });
    }
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
        if (x == settings.size - 1) {
            y++;
            x = 0;
        } else x++;
    }
    return grid
}
function UpdateGrid(x, y, c) {
    //implement promise
    x = x.clamp(0, settings.size)
    y = y.clamp(0, settings.size)
    let index = grid.findIndex(g => {
        if (g.x == x && g.y == y) return g
    })
    if (index > -1) {
        grid[index].color = c;
        pixels.findOneAndUpdate({ "x": x, "y": y }, { $set: { "color": c } }).then((ab) => { })
    }
    return (index > -1)
}