const canvasSketch = require('canvas-sketch');
const { drawSVGPath } = require('canvas-sketch-util/penplot');

const settings = {
  dimensions: [4096, 1024]
};

const distance = (a, b) => {
  return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
};

const sketch = () => {
  return ({ context, width, height }) => {
    // background 
    context.fillStyle = '#232934';
    context.fillRect(0, 0, width, height);

    const coors = [] // array of all circle coordinates
    const connected_coors = []; // array of all circles connected by white line
    let networked_neighbours; // array of circles to randomly networked around the connected white line
    const index_range = 70; // distance to search along x axis for valid circle to be connected by white line
    const random_shift = (Math.random() * 2 - 1) * width; // random shift to the sine curve that is forming white line
    const k_neigbours = 3; // number of neighbours to be connected by dark line
    const hops = 2; // number of hops to continue creating connected dark lines
    const incriments = 100; // number of divisions to make a smooth increasing/decreasing stroke width
    const line_width_mult = 4; // maximum line width multipliyer
    const sin_dev = 0.1; // acceptable margin for white line to deaviate from sine function
    const sin_osc = 0.7; // the maxmin of the sin function
    const max_radius = 10; // maxium radius of circles
    const circle_freq = 0.4; // frequncy of circles
    const lesser_link_margin = 0.03; // maximum % of the width that a lesser link can be created
    const sin_x_dist_tollerance = 0.5; // circle not allowed if (dist between y and sin(x))*random > sin_x_dist_tollerance
    /* 
    first we create all circles, to do this we iterate through all the x coordinates and generate a random double between 0 and 1. 
    
    with the random double we create a y coordinate between 0 and the height of the page.

    if y is above 100 pixels above the bottom then 90% of the time (randomly decided) we append the coordinate to the coors array and draw it as white on the page

    the radius of the circle is dictated by the same random variable deciding the heigh of the circle and so is saved alongside the coordinates. higher circles have smaller radius.

    note: circles are only created here, not drawn, they are drawn last so as to appear bolder against the lines created later.
    */

    let x, y, rand_, distance_from_sin;
    // draw circles
    for (let i = 0; i < width - 1; i++) {
      x = i;
      let max_y;
      rand_ = Math.random();
      y = Math.floor((height + 300) * rand_);
      max_y = height - 100
      sin_x = (height / 2) + Math.sin(((x + random_shift) / width) * 2 * Math.PI) * (height / 2) * sin_osc;
      distance_from_sin = Math.abs(y - sin_x);
      if (Math.random() > (1 - circle_freq) && y < max_y && distance_from_sin / y < sin_x_dist_tollerance / Math.random()) {
        coors.push([x, y, rand_]);
      };
    };

    /*
    with these randomly generated circles we decide which ones to join up with a white line. the white line shape is approximiating the sine wave.

    we start the line randomly between 0 - index_range, appending this coor to the connected_coor array

    iterating through all coors we check that the x of the iteration is greater than the x of the last connected_coor, we then take our candidate coors for the next point in the line using the index_range function

    we check candidates are valid. they are only valid if the y coor of the point is within +- sine_margin% of sin(x)

    note: sin(x) is actually a squashed down version so that it oscellates between +-sin_osc rather than +- 1. the sin function is also transformed so that y=0 at the midpoint of the page and has a random shift on the x-axis so that it doesnt always start in the same place

    from the valid candidates a single random coor is selected and appended to the connected_coor array

    with this connected_coor list we can later draw the white line linking them
    */
    let candidate_coors, valid_candidate, last_connected_coor, sine_x;
    connected_coors.push(coors[Math.floor(Math.random() * index_range)])
    coors.forEach((coor, index) => {
      last_connected_coor = connected_coors[connected_coors.length - 1]
      if (coor[0] > last_connected_coor[0]) {
        candidate_coors = coors.slice(index, index + index_range);
        valid_candidate = []
        candidate_coors.forEach(candidate_coor => {
          // sin(x) = midway +- sin(lastcoorx +- const shift expressed as radian) * midway * height_padding
          sin_x = (height / 2) + Math.sin(((last_connected_coor[0] + random_shift) / width) * 2 * Math.PI) * (height / 2) * sin_osc
          if (candidate_coor[1] > sin_x * (1 - sin_dev) && candidate_coor[1] < sin_x * (1 + sin_dev)) {
            valid_candidate.push(candidate_coor)
          };
        })
        if (valid_candidate.length != 0) {
          connected_coors.push(valid_candidate[Math.floor(Math.random() * valid_candidate.length)])
        }
      }
    });

    /*
    with the connected_coors we start looking for the neighrest neighbours to start randomly generating links between coors not on the white line

    for each connected coor we sort all coors in the coors array by their distance to the connected_coor we then take the first k_neihbours as our starting point for the hops.

    networked_neighbours are all the neighbours found from moving x hops away frrom a connected coor

    once we have the first set of n_neighbours around a connected coor we append the n_neigbours to networked_neighbours and start iterating over hops

    for each hop we take the networked_neighbours of the last point examined, at hop 0 this will be k long, at hop 1 this will be k**2 long, at hop 3 this will be k**3 long (assuming infinite circles, when non-infinite this isnt quite true as some circles are invalid connections).

    during a hop we iterate over the networked_neighbours and find the closet neigbours using the same method above. a circle cannot be a neighbour if it is already in networked_neighbours or connected_coors

    valid circles are appended to the networked_neigbours, we do this for each hop giving us a randomly generated list of neigbours to create sublinks on around the connected_coors

    each hop we then again iterate over the growing list of networked_neigbours drawing a lesser connection between them and a random circle within the lesser_link_margin% of the page width

    once a single valid line has been drawn we end this stage, so that only a single line is drawn per networked_neighbour per hop. closer neigbours (networked in earlier) hops will have more chances to create links while further neighbours (netwoked in later hops) will have fewer opportunities to get links


    */
    connected_coors.forEach(connected_coor => {

      let distance_a, distance_b;
      coors.sort((a, b) => {
        distance_a = distance(connected_coor, a);
        distance_b = distance(connected_coor, b);
        return distance_a - distance_b
      })
      // set initial n_neighbours and networked_neighbours to be the same

      networked_neighbours = coors.slice(1, k_neigbours + 1)

      for (let h = 0; h < hops; h++) {

        networked_neighbours.forEach(n => {
          let distance_a, distance_b;

          coors.sort((a, b) => {
            distance_a = distance(n, a);
            distance_b = distance(n, b);
            if (networked_neighbours.includes(a) || networked_neighbours.includes(b) || connected_coors.includes(a) || connected_coor.includes(b)) {
              return -width
            } else {
              return distance_a - distance_b
            }
          })
          networked_neighbours = networked_neighbours.concat(coors.slice(1, k_neigbours + 1))
        })

        networked_neighbours.forEach(i => {
          let line_drawn = false;
          coors.forEach(j => {
            if (distance(i, j) / width < lesser_link_margin && i != j && line_drawn == false) {
              line_drawn = true;
              let line_inc = ((j[2] - i[2]) * line_width_mult / incriments);
              let x_inc = (j[0] - i[0]) / incriments;
              let y_inc = (j[1] - i[1]) / incriments;
              for (let l = 0; l < incriments; l++) {
                context.beginPath();
                context.moveTo(i[0] + (x_inc * l), i[1] + (y_inc * l));
                context.lineTo(i[0] + (x_inc * (l + 1)), i[1] + (y_inc * (l + 1)));
                context.lineWidth = i[2] * (line_width_mult / h) + (line_inc * j);
                context.strokeStyle = "#5e6580"
                context.stroke();
              };
            };
          })
        });
      };
    });

    // iterate through connected circles and draw lines
    let p1, p2, x_inc, y_inc, line_inc;

    for (let i = 0; i < (connected_coors.length - 2); i++) {
      p1 = connected_coors[i];
      p2 = connected_coors[i + 1];
      x_inc = (p2[0] - p1[0]) / incriments;
      y_inc = (p2[1] - p1[1]) / incriments;
      line_inc = ((p2[2] - p1[2]) * line_width_mult / incriments);
      rand_inc = (p2[2] - p1[2]) / incriments;
      for (let j = 0; j < incriments; j++) {
        context.beginPath()
        context.moveTo(p1[0] + (x_inc * j), p1[1] + (y_inc * j));
        context.lineTo(p1[0] + (x_inc * (j + 1)), p1[1] + (y_inc * (j + 1)));
        context.lineWidth = p1[2] * (line_width_mult + 1) + (line_inc * j);
        context.strokeStyle = "#ffffff"
        context.stroke();
      };
    };

    // iterate through all circles and draw them
    coors.forEach(c => {
      context.beginPath();
      context.arc(c[0], c[1], c[2] * max_radius, 0, 2 * Math.PI);
      context.fillStyle = '#ffffff';
      context.fill();
      context.lineWidth = 1;
      context.strokeStyle = '#ffffff';
      context.stroke();
    })
  }
};

canvasSketch(sketch, settings);
