const timeout = 5000;
const colorPicker = new iro.ColorPicker('#picker', {
    width: 200
});

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
        color: color
    }

    console.log(postdata)

    if (!btn.disabled && true) {
        console.log("Sending")
        let resp = await fetch("/", {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postdata)
        });
        let data = await resp.json();
        console.log(data)
    }
    btn.disabled = true;

    setTimeout(() => {
        btn.disabled = false;
    }, timeout)
}


