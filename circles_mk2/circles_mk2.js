const canvasSketch = require('canvas-sketch');
const random = require('canvas-sketch-util/random');
const math = require('canvas-sketch-util/math');

const settings = {
  dimensions: [1080, 1080]
};

const toRadians = (degrees) => {
  return degrees / 180 * Math.PI;
};

const randRange = (min, max) => {
  return Math.random() * (max - min) + min
};

const rgbToHex = (rgb) => {
  // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
  const componentToHex = (c) => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };
  return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
};

const randomColour = () => {

  const random255 = () => {
    return Math.round(randRange(50, 200));
  }
  const rgb = [random255(), random255(), random255()];
  return rgb

};

const findMax = (c) => {
  var max_of_c = Math.max.apply(Math, c);
  return max_of_c;
};

const findLargestDiff = (c) => {

}

const sketch = () => {
  return ({ context, width, height }) => {

    // grid layout
    const nrows = 3;
    const ncols = 3;
    const square_height = height / nrows;
    const square_width = width / ncols;

    // rectangle vars
    const rectangle_components = 800;
    const rect_radius = 250 / findMax([nrows, ncols]);
    const rect_draw_probability = .5;
    const rect_y_scaler = 25 / findMax([nrows, ncols]);
    const rect_x_scaler = 15 / findMax([nrows, ncols]);

    // inner fill vars angle is 90 lenghts are rect_radius
    const square_size = Math.sqrt(rect_radius ** 2 + rect_radius ** 2)


    for (r = 0; r < nrows; r++) {
      for (c = 0; c < ncols; c++) {
        let random_colour = randomColour();
        let primary_colour = findMax(random_colour);

        context.fillStyle = rgbToHex(random_colour);
        context.fillRect(square_width * c, square_height * r, square_width * (1 + c), square_height * (1 + r));


        console.log(random_colour);
        const rect = new Rectangles(rectangle_components, rect_radius, rect_x_scaler, rect_y_scaler, rect_draw_probability, square_width, square_height, random_colour, primary_colour, r, c);
        rect.draw(context);

        //const square = new Square(square_width, square_height, Math.random() * 360, square_size, random_colour, r, c);
        //square.draw(context);

        //const rect_2 = new Rectangles(rectangle_components, rect_radius / 10, rect_x_scaler, rect_y_scaler / 2, rect_draw_probability, square_width, square_height, random_colour, primary_colour, r, c);
        //rect_2.draw(context);
      }
    }
  };
};

canvasSketch(sketch, settings);

class Square {
  constructor(width, height, rotation, size, colour, r, c) {
    this.rotation = rotation;
    this.size = size;
    this.colour = colour;
    this.r = r;
    this.c = c;
    this.x_center = (width * this.c) + (width * .5);
    this.y_center = (height * this.r) + (height * .5);
  }
  draw(context) {
    context.save();
    context.translate(this.x_center, this.y_center);
    context.rotate(toRadians(this.rotation));
    context.beginPath();
    context.fillStyle = rgbToHex(this.colour);
    context.rect(-this.size * .5, -this.size * .5, this.size, this.size);
    context.fill();
    context.restore();
    console.log(this.x_center - this.size * .5, this.y_center - this.size * .5, this.x_center + this.size * .5, this.y_center + this.size * .5);
  }
}

class Rectangles {
  constructor(rectangle_components, radius, x_scaler, y_scaler, draw_probability, width, height, colour, primary_colour, r, c) {
    this.rectangle_components = rectangle_components;
    this.radius = radius;
    this.x_scaler = x_scaler;
    this.y_scaler = y_scaler;
    this.draw_probability = draw_probability;
    this.width = width;
    this.height = height;
    this.colour = colour;
    this.primary_colour = primary_colour;
    this.r = r;
    this.c = c;

    this.angle = 360 / this.rectangle_components;
    this.x_center = (this.width * c) + (this.width * .5);
    this.y_center = (this.height * r) + (this.height * .5);
  };
  draw(context) {
    console.log(this.y_center);
    console.log(this.r);
    let running_angle, x, y, randomised_primary;

    context.save();
    context.translate(this.x_center, this.y_center);
    // randomise sine save offset here
    for (let i = 0; i < this.rectangle_components; i++) {
      let randomised_colour = [];

      context.save();
      running_angle = this.angle * i
      context.rotate(toRadians(running_angle));

      x = randRange(1 - this.x_scaler, 1 + this.x_scaler);
      y = randRange((1 - this.y_scaler) * .5, 1 + this.y_scaler);
      //y = this.y_scaler * Math.sin(i / this.rectangle_components) + randRange(-5, 5); // sin wave using angle + offshift randomly for circle? plus transitory shock!!!
      context.scale(x, y);
      if (Math.random() <= this.draw_probability) {

        randomised_primary = Math.round(this.primary_colour * Math.random());

        this.colour.forEach(i => {
          if (i == this.primary_colour) {
            randomised_colour.push(randomised_primary);
          }
          else {
            randomised_colour.push(i);
          }
        });
        context.fillStyle = rgbToHex(randomised_colour);
        context.beginPath();
        context.rect(-x * .5, this.radius / y, x * .5, 10);
        context.fill();
      }
      context.restore();
    };
    context.restore();
  };
};

