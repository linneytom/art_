const canvasSketch = require('canvas-sketch');

import Drawing from './sketch_objects/drawing';



const settings = {
  dimensions: [1080, 1080]
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);
    context.fillStyle = 'black';

    const line_num = 10;
    const limiter = 100;
    const line_width = 5;


    const drawing = new Drawing(width, height);
    const line_ini = drawing.createInitialLine();
    context.lineWidth = line_width;
    line_ini.draw(context);
    for (let i = 1; i < line_num; i++) {
      console.log('iteration: ', i)
      let new_line = drawing.createNewLine(limiter);
      new_line.draw(context);
    }

  };
};

canvasSketch(sketch, settings);

