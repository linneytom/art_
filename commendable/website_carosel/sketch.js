const canvasSketch = require('canvas-sketch');
const { drawSVGPath } = require('canvas-sketch-util/penplot');

const settings = {
  dimensions: [4100, 2048]
};

const toRadians = (degrees) => {
  return degrees / 180 * Math.PI;
};

const randRange = (min, max) => {
  return Math.random() * (max - min) + min
};

const sketch = () => {
  return ({ context, width, height }) => {
    context.fillStyle = '#232934';
    context.fillRect(0, 0, width, height);
    let x, y, rand_;
    const coors = [];
    const connected_coors = [];
    // draw circles
    for (let i = 0; i < width - 10; i++) {
      x = i;
      let max_y;
      rand_ = Math.random();
      y = Math.floor((height) * rand_);
      max_y = height - 100
      if (Math.random() > .8 && y < max_y) {
        coors.push([x, y, rand_]);
        context.beginPath();
        context.arc(x, y, rand_ * 10, 0, 2 * Math.PI);
        context.fillStyle = '#ffffff';
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = '#ffffff';
        context.stroke();
      };
    };
    // get circles to link
    let candidate_coors, valid_candidate, last_connected_coor, sine_x;
    const index_range = 70;
    const random_shift = (Math.random() * 2 - 1) * width;
    // link first circle
    connected_coors.push(coors[0])
    coors.forEach((coor, index) => {
      // if next x has y within some range
      // if x some range in distance
      // draw line between two

      // check that circle is greater to the right than last connected coor
      last_connected_coor = connected_coors[connected_coors.length - 1]
      if (coor[0] > last_connected_coor[0]) {
        // get next 10 coors
        candidate_coors = coors.slice(index, index + index_range);
        valid_candidate = []
        candidate_coors.forEach(candidate_coor => {
          // sin(x) = midway +- sin(lastcoorx +- const shift expressed as radian) * midway * height_padding
          sine_x = (height / 2) + Math.sin(((last_connected_coor[0] + random_shift) / width) * 2 * Math.PI) * (height / 2) * 0.7
          // check candidate within 10% of sin(x)
          if (candidate_coor[1] > sine_x * 0.90 && candidate_coor[1] < sine_x * 1.1) {
            valid_candidate.push(candidate_coor)
          };
        })
        if (valid_candidate.length != 0) {
          connected_coors.push(valid_candidate[Math.floor(Math.random() * valid_candidate.length)])
        }
      }
    });
    // iterate through connected circles and draw lines
    let p1, p2, x_inc, y_inc, line_inc;
    const incriments = 100;
    const line_width_mult = 3;
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
        context.lineWidth = p1[2] * line_width_mult + (line_inc * j)
        context.stroke();
      };
    };

    // find n-neigbours for connected coords with hops
    const k_neigbours = 3;
    const hops = 2;
    const all_networked_neighbours = [];
    // iterate over connected coors
    connected_coors.forEach(connected_coor => {
      // for each coor find k closest neighbours
      // networked_neighbours -> all neighbours somehow connected to coor
      // n_neighbours -> the k n-neighbours for a connected neighbour
      let distance_a, distance_b, networked_neighbours, n_neighbours;
      coors.sort((a, b) => {
        distance_a = Math.sqrt(Math.pow(connected_coor[0] - a[0], 2) + Math.pow(connected_coor[1] - a[1], 2));
        distance_b = Math.sqrt(Math.pow(connected_coor[0] - b[0], 2) + Math.pow(connected_coor[1] - b[1], 2));
        return distance_a - distance_b
      })
      // set initial n_neighbours and networked_neighbours to be the same
      n_neighbours = coors.slice(1, k_neigbours + 1)
      networked_neighbours = n_neighbours
      // for each hop take k closest of most recent neigbours and find their closest k neigbours
      // excluding neighbours that are already connected
      console.log("search initialised with: ");
      console.log("initial point: ", connected_coor);
      console.log("initial neighest neighbours: ", n_neighbours.length)

      for (let h = 0; h <= hops; h++) {
        console.log("starting hop: ", h);

        n_neighbours.forEach(n => {
          console.log("searching for neighbours around: ", n);
          let distance_a, distance_b;

          coors.sort((a, b) => {
            distance_a = Math.sqrt(Math.pow(n[0] - a[0], 2) + Math.pow(n[1] - a[1], 2));
            distance_b = Math.sqrt(Math.pow(n[0] - b[0], 2) + Math.pow(n[1] - b[1], 2));
            if (networked_neighbours.includes(a) || networked_neighbours.includes(b) || connected_coors.includes(a) || connected_coor.includes(b)) {
              console.log("located invalid neighour returning 0")
              return 0
            } else {
              return distance_a - distance_b
            }
          })
          n_neighbours = coors.slice(1, k_neigbours + 1)
          networked_neighbours = networked_neighbours.concat(n_neighbours)
          console.log("located ", n_neighbours.length, " neighbours")
          console.log("saved ", networked_neighbours.length, " neighbours")
          console.log(" ")
        })
        networked_neighbours.forEach(n => {
          context.beginPath();
          context.arc(n[0], n[1], n[2] * 10, 0, 2 * Math.PI);
          context.fillStyle = '#eb4034';
          context.fill();
          context.lineWidth = 1;
          context.strokeStyle = '#eb4034';
          context.stroke();
        })
      }
    })
  };
};

canvasSketch(sketch, settings);
