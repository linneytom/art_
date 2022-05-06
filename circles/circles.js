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
    return Math.round(randRange(100, 255));
  }
  const rgb = [random255(), random255(), random255()];
  return rgb

};

const findMax = (c) => {
  var max_of_c = Math.max.apply(Math, c);
  return max_of_c;
}

const sketch = () => {
  return ({ context, width, height }) => {

    const random_colour = randomColour();
    const primary_colour = findMax(random_colour);
    context.fillStyle = rgbToHex(random_colour);
    context.fillRect(0, 0, width, height);

    // rectangle vars
    const rectangle_components = 500;
    const rect_radius = 250;
    const rect_draw_probability = .75;
    const rect_y_scaler = 20;
    const rect_x_scaler = 4;


    const rect = new Rectangles(rectangle_components, rect_radius, rect_x_scaler, rect_y_scaler, rect_draw_probability, width, height, random_colour, primary_colour);
    rect.draw(context);

  };
};

canvasSketch(sketch, settings);

class Rectangles {
  constructor(rectangle_components, radius, x_scaler, y_scaler, draw_probability, width, height, colour, primary_colour) {
    this.rectangle_components = rectangle_components;
    this.radius = radius;
    this.x_scaler = x_scaler;
    this.y_scaler = y_scaler;
    this.draw_probability = draw_probability;
    this.width = width;
    this.height = height;
    this.colour = colour;
    this.primary_colour = primary_colour;

    this.angle = 360 / this.rectangle_components;
    this.x_center = this.width * .5;
    this.y_center = this.height * .5;
  };
  draw(context) {

    let running_angle, x, y, current_draw, previous_draw, randomised_primary;

    context.save();
    context.translate(this.x_center, this.y_center);

    for (let i = 0; i < this.rectangle_components; i++) {
      let randomised_colour = [];

      context.save();
      running_angle = this.angle * i
      context.rotate(toRadians(running_angle));

      x = randRange(1 - this.x_scaler, 1 + this.x_scaler);
      y = randRange(1 - (this.y_scaler * .75), 1 + this.y_scaler);
      context.scale(x, y);
      current_draw = Math.random();
      if (current_draw > previous_draw) {

        randomised_primary = Math.round(this.primary_colour * Math.random());

        this.colour.forEach(i => {
          if (i == this.primary_colour) {
            randomised_colour.push(randomised_primary);
          }
          else {
            randomised_colour.push(i);
          }
        });
        console.log(randomised_colour);
        console.log(this.colour);
        context.fillStyle = rgbToHex(randomised_colour);
        context.beginPath();
        context.rect(-x * .5, this.radius / y, x * .5, 10);
        context.fill();
      }
      context.restore();
      previous_draw = current_draw
    };
    context.restore();
  };
};
