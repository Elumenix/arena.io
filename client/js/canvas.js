const myCanvas = document.getElementById("mainCanvas");
const ctx = myCanvas.getContext("2d");
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;


ctx.fillStyle = "red";
ctx.fillRect(20, 20, 140, 100);


window.onresize = () => {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, 140, 100);
}


export { ctx };