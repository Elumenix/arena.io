const myCanvas = document.getElementById("mainCanvas");
const ctx = myCanvas.getContext("2d");
const mousePos = {};
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;


/*ctx.fillStyle = "red";
ctx.fillRect(20, 20, 140, 100);*/


/*window.onresize = () => {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 140, 100);
}*/


myCanvas.onmousemove = (mouse) => {
    mousePos.x = mouse.clientX - ctx.canvas.width / 2;
    mousePos.y = mouse.clientY - ctx.canvas.height / 2;

    /*if (mousePos.x === NaN) {
        mousePos.x = 0;
    }

    if (mousePos.y === NaN) {
        mousePos.y = 0;
    }
    console.log(`(x:${mouse.clientX}, y:${mouse.clientY})`);*/
}


export { ctx, mousePos };