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

const mouseMovement = (mouse, type) => {

    // Different types are used because either button or buttons needs to
    // be checked depending on the event that is firing
    if ((mouse.buttons === 1 && type === 0) || (mouse.button === 0 && type === 1) || (mouse.buttons === 0 && type === 2)) {
        mousePos.x = mouse.clientX - ctx.canvas.width / 2;
        mousePos.y = mouse.clientY - ctx.canvas.height / 2;
    }
    else {
        mousePos.x = 0;
        mousePos.y = 0;
    }
}


// Click or move should check for mouse movement
myCanvas.addEventListener('mousemove', (event) => mouseMovement(event, 0));
myCanvas.addEventListener('mousedown', (event) => mouseMovement(event, 1));
myCanvas.addEventListener('mouseup', (event) => mouseMovement(event, 2));


export { ctx, mousePos };