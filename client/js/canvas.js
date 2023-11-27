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
    mousePos.x = mouse.clientX;
    mousePos.y = mouse.clientY;

    console.log(`(x:${mousePos.x}, y:${mousePos.y})`);
}


export { ctx, mousePos };