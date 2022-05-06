const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [1048, 1048]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    const w = width * 0.1;
    const h = height * 0.1;
    const gap = w * 0.1;
    let x, y;

    for (let i = 0; i < 5; i++) {
      x = w * 0.1 + (w + gap) * i;

      for (let j = 0; j < 5; j++) {
        y = h * 0.1 + (h + gap) * j;
        context.beginPath();
        context.rect(x, y, w, h);
        context.stroke();

        if (Math.random() > .5) {
          context.beginPath();
          context.rect(x + 8, y + 8, w - 16, h - 16);
          context.stroke();
        }
      }

    }
  };
};

canvasSketch(sketch, settings);
