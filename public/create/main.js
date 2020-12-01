

const timeout = 5000;
const colorPicker = new iro.ColorPicker('#picker', {
    width: 200,
    layoutDirection: 'horizontal'
});
let colorBox;
let colorInfo;
const hexMatch = /^#([0-9A-F]{3}){1,2}$/i;
let oldCol = "#ffffff";
let colorDropper;
let globalGrid;
let _socketId;

const debug = {
    _debug: false,
    get val() { return this._debug },
    get enable() {
        this._debug = true;
        return this._debug;
    },
    get disable() {
        this._debug = false;
        return this._debug;
    }
}

window.onload = function () {
    const socket = io();

    socket.on('start', function (grid) {
        Start(grid)
        pageSetup(grid)
    });
    socket.on('update', function (grid) {
        console.log("content update")
        DrawGrid(grid)
    });
    socket.on("connect", () => {
        _socketId = socket.id;
    });
    colorBox = document.getElementById("colorBox");
    colorInfo = document.getElementById("colorHex");
    colorDropper = document.getElementById("colorDrop");
    colorDropper.checked = false;
    colorPicker.on("color:change", (color) => {
        colorBox.style.backgroundColor = color.hexString;
        colorInfo.value = color.hexString;
    });

    colorInfo.addEventListener('onfocus', (e) => {
        oldCol = e.target.value;
    })

    ColorInfoChange = (event) => {
        let newCol = (event.target.value[0] == '#') ? event.target.value : `#${event.target.value}`;

        if (!hexMatch.test(newCol)) {
            event.target.value = oldCol
        } else {
            oldCol = newCol;
        }

        colorPicker.color.hexString = newCol;
    }


    colorInfo.addEventListener('blur', ColorInfoChange);
    colorInfo.addEventListener('change', ColorInfoChange);

    colorDropper.addEventListener('change', (e) => {
        console.log("dropper " + (e.target.checked) ? "enabled" : "disabled")
    });

    colorPicker.color.hexString = "#ffffff";
    colorInfo.value = colorPicker.color.hexString;
}

function SetMax(field) {
    if (field.valueAsNumber > field.max) {
        field.valueAsNumber = field.max;
    }
}

function pageSetup() {
    let xNum = document.getElementById("x")
    let yNum = document.getElementById("y")
    xNum.max = settings.size
    yNum.max = settings.size
}

function SetVals(x, y) {
    let xNum = document.getElementById("x")
    let yNum = document.getElementById("y")

    xNum.valueAsNumber = x;
    yNum.valueAsNumber = y;
}

async function PostColor(btn) {
    let col = document.querySelector('input[type="color"]')
    let color = colorPicker.color.hexString//col.value
    console.log(color)

    let postdata = {
        x: document.querySelector("#x").valueAsNumber.clamp(0, settings.size),
        y: document.querySelector("#y").valueAsNumber.clamp(0, settings.size),
        color: color,
        socket: _socketId,
    }

    if (debug.val) console.log(postdata)

    if (!btn.disabled && true) {
        console.log("Sending")
        let resp = await fetch("/", {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postdata)
        });
        let data = await resp.json();
        if (debug.val) console.log(data)
    }
    btn.disabled = true;

    setTimeout(() => {
        btn.disabled = false;
    }, timeout)
}


