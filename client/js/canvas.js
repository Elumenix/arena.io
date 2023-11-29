const myCanvas = document.getElementById("mainCanvas");
const ctx = myCanvas.getContext("2d");
const mousePos = {};
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
let leftButtonDown = false;


/*ctx.fillStyle = "red";
ctx.fillRect(20, 20, 140, 100);*/

const mouseMovement = (mouse) => {

    if (leftButtonDown) {
        mousePos.x = mouse.clientX - ctx.canvas.width / 2;
        mousePos.y = mouse.clientY - ctx.canvas.height / 2;
    }
    else {
        mousePos.x = 0;
        mousePos.y = 0;
    }
}


// Tracks whether the left button is held down
myCanvas.addEventListener('mousemove', mouseMovement);
myCanvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left button
        leftButtonDown = true;
        mouseMovement(event);
    }
});
myCanvas.addEventListener('mouseup', (event) => {
    if (event.button === 0) { // Left button
        leftButtonDown = false;
        mouseMovement(event);
    }
});


export { ctx, mousePos };