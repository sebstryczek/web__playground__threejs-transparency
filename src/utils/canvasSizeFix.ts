const canvasSizeFix = (canvas: HTMLCanvasElement) => {

    const parent = canvas.parentElement;

    if (!parent) {
        return;
    }

    canvas.width = 0;
    canvas.height = 0;
    canvas.style.width = "0";
    canvas.style.height = "0";

    const { width, height } = parent.getBoundingClientRect();

    canvas.width = width;
    canvas.height = height;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

export { canvasSizeFix };