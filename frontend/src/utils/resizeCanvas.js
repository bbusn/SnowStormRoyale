const resizeCanvas = (canvas) => {
    canvas.width = Math.min(window.innerWidth, 1250);
    canvas.height = Math.min(window.innerHeight, 620);
};

export default resizeCanvas;