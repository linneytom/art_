const canvasSketch = require('canvas-sketch');

const settings = {
    dimensions: [1080, 1080]
};

const toRadians = (degrees) => {
    return degrees * (Math.PI / 180)
};
const toDegrees = (radians) => {
    return (radians * 180) / Math.PI
};
const randRange = (min, max) => {
    return Math.random() * (max - min) + min
};
const unique = (array) => {
    // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
    let seen = Object();
    return array.filter(function (element) {
        return seen.hasOwnProperty(element) ? false : (seen[element] = true);
    })
}

const sketch = () => {
    return ({ context, width, height }) => {
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);
        context.fillStyle = 'black';
        context.lineWidth = 1;
        const line_num = 4;
        const legal_angle_range = [0, 180];


        const drawing = new Drawing(width, height, legal_angle_range);
        const line_ini = drawing.createInitialLine(100, 100, 200, 200);
        line_ini.draw(context);
        for (let i = 1; i < line_num; i++) {
            console.log('iteration: ', i)
            let new_line = drawing.createNewLine();
            console.log(drawing)
            new_line.draw(context);
        }

    };
};

canvasSketch(sketch, settings);

class Drawing {
    constructor(width, height, legal_angle_range = [0, 360]) {
        // list of lines in drawing
        this.lines = [];
        this.width = width;
        this.height = height;
        // dictonary of points:[lines]
        this.points = new Object();
        this.legal_angle_range = legal_angle_range;
        // list of triangles
        this.triangles = [];
    };
    previousLine() {
        return this.lines[this.lines.length - 1];
    };
    createInitialLine(x1, y1, x2, y2) {
        const new_line = new Line(x1, y1, x2, y2)
        this.lines.push(new_line)
        this.points[new_line.p1.pointId()] = [new_line];
        this.points[new_line.p2.pointId()] = [new_line];
        return new_line
    };
    createNewLine() {
        // p1 = p2 of last drawn line
        const legal_triangles = this.getLegalTriangles(); // replace getTriangleCandidatePoints
        let new_line, new_triangle;
        console.log('ran legal triangle search')
        //const candidate_tri_points = this.getTriangleCandidatePoints()
        //const legal_triangle_line = this.legalTriangle(candidate_tri_points);
        if (legal_triangles.length > 0) {
            console.log('legal triangle found')
            new_triangle = legal_triangles[0]
            new_line = legal_triangles[0].getCandidateLine(this);
            this.saveTriangle(new_triangle);
            return new_line;
        }
        else {
            // random line
            // create point within width, height
            const new_line = this.legalRandom();
            this.saveLine(new_line);
            return new_line;
        };
    };
    getCandidateTriangles() {
        const prev_line = this.previousLine();

        let prev_connecting_lines = [], candidate_triangles = [];
        let origin_point, candidate_line;
        // get all points
        // select lines that connect to origin of previous line
        // for each of those lines, if not previous line then append
        this.points[prev_line.p1.pointId()].forEach(line => {
            if (line.Id != prev_line.Id) {
                prev_connecting_lines.push(line)
            }
        }) // findCandidateTriangles
        // for each line originating from previous lines origin (excluding previous line)

        prev_connecting_lines.forEach(line => {
            // origin point != origin point of previous line
            origin_point = (prev_line.p1.Id === line.p2.Id) ? line.p1 : line.p2;
            // candidate line
            candidate_line = new Line(prev_line.p2.x, prev_line.p2.y, origin_point.x, origin_point.y)

            candidate_triangles.push(
                new Triangle(prev_line, line, candidate_line)
            );
        });

        return candidate_triangles;
    }
    getLegalTriangles() {
        const triangles = this.getCandidateTriangles();
        console.log('candidate triangles found: ', triangles)
        let legal_triangles = [];
        triangles.forEach(triangle => {
            if (this.legalTriangle(triangle)) {
                legal_triangles.push(triangle)
            }
        });
        return legal_triangles
    };

    legalTriangle(candidate_triangle) {
        // true 
        // if len > 0
        // && no interpolation
        // && angle acceptable
        // else 
        // false
        const candidate_line = candidate_triangle.getCandidateLine(this);
        if (this.noIntersections(candidate_line)) {
            return true;
        }
        else {
            return false;
        };
    };

    legalRandom() {
        console.log('random line started')
        const prev_line = this.previousLine();
        let illegal = true, candidate_line;
        while (illegal) {
            let candidate_point = new Point(
                Math.round(this.width * Math.random()),
                Math.round(this.height * Math.random())
            );
            candidate_line = new Line(prev_line.p2.x, prev_line.p2.y, candidate_point.x, candidate_point.y)
            if (this.legalAngle(candidate_line) && this.noIntersections(candidate_line)) {
                illegal = false;
            };
        };
        return candidate_line
    };

    legalAngle(candidate_line) {
        const prev_line = this.previousLine();
        const angle_difference = Math.abs(prev_line.angle - candidate_line.angle)
        if (angle_difference == 0) {
            // can never overlap previous line
            return false
        }
        else if (angle_difference >= this.legal_angle_range[0]
            &&
            angle_difference <= this.legal_angle_range[1]) {
            return true
        }
        else {
            return false
        }
    };
    parallel(line_a, line_b) {
        if (line_a.m == line_b.m) {
            return true
        }
        else {
            return false
        };
    };
    illegalIntersectPoint(line_a, line_b) {
        // check lines are not parallel
        // then use cramers rule
        if (this.parallel(line_a, line_b)) {
            return false
        }
        else {
            const x_intersect_num = line_a.c - line_b.c * (line_a.m / line_b.m)
            const x_intersect_den = 1 - (line_a.m / line_b.m)
            const x_intersect = x_intersect_num / x_intersect_den
            const y_intersect = (line_a.m * x_intersect) + line_a.c
            if (x_intersect < 0 && x_intersect > this.width) {

                if (y_intersect < 0 && y_intersect > this.height) {
                    return false
                }
                else {
                    return true
                };
            }
            else {
                return true
            };
        };
    };
    noIntersections(object) {
        let line;
        if (typeof object == 'Triangle') {
            line = object.getCandidateLine(this);
        }
        else {
            line = object;
        };

        const prev_line = this.previousLine();
        let lines = []
        this.lines.forEach(l => {
            if (l.Id != prev_line.Id) {
                lines.push(l);
            }
        });
        lines.forEach(l => {
            if (this.illegalIntersectPoint(l, line)) {
                return false
            }
        })
        return true
    };
    saveLine(line) {
        this.lines.push(line);
        if (line.p1.pointId() in this.points) {
            this.points[line.p1.pointId()].push(line)
        }
        else {
            this.points[line.p1.pointId()] = [line]
        };

        if (line.p2.pointId() in this.points) {
            this.points[line.p2.pointId()].push(line)
        }
        else {
            this.points[line.p2.pointId()] = [line]
        };
        console.log(line.Id, ' saved');
    };
    saveTriangle(triangle) {
        this.saveLine(triangle.getCandidateLine(this));
        this.triangles.push(triangle);
    }



    // check that does not interpoloate with exsiting line
    // check that angle is in range

    // if cant draw triangle then draw random line

    // randomise p2 within boundary range
    // check that does not interpolate with existing line
    // check that angle with p1 lines is in range

    listPointsInLines(lines) {
        let p1s = [], p2s = [];

        lines.forEach(line => {
            p1s.push(line.p1)
            p2s.push(line.p2)
        });

        const all_points = unique(p1s.concat(p2s));

        return all_points;
    };
};
class Triangle {
    constructor(line1, line2, line3) {
        this.lines = [line1, line2, line3];
        this.Id = this.triangleId();
    };
    getCandidateLine(drawing) {
        let existing_lines = [];
        let candidate_line;
        drawing.lines.forEach(line => {
            existing_lines.push(line.Id);
        });
        this.lines.forEach(tri_line => {
            if (existing_lines.indexOf(tri_line.Id) === -1) {
                candidate_line = tri_line;
            }
        });
        return candidate_line;
    }
    triangleId() {
        return this.lines.sort().join('');

    }
};
class Line {
    constructor(x1, y1, x2, y2) {
        this.p1 = new Point(x1, y1);
        this.p2 = new Point(x2, y2);
        this.x_magnitude = Math.abs(x1 - x2);
        this.y_magnitude = Math.abs(y1 - y2);
        this.length_ = Math.sqrt(Math.pow(this.x_magnitude, 2) + Math.pow(this.y_magnitude, 2));
        this.angle = this.getLineAngle();
        this.m = (y2 - y1) / (x2 - x1);
        this.c = y1 - x1 * this.m;
        this.Id = this.lineId();
    };
    draw(context) {
        context.beginPath();
        context.moveTo(this.p1.x, this.p1.y);
        context.lineTo(this.p2.x, this.p2.y);
        context.stroke();
    };
    getLineAngle() {
        return Math.asin(this.y_magnitude / this.length_)
    };
    lineId() {
        // id lead by point that is further to the right
        return Number(this.p1.Id) > Number(this.p1.Id) ? this.p1.Id + this.p2.Id : this.p2.Id + this.p1.Id;
    }
};
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.Id = this.pointId();
    }
    pointId() {
        return String(this.x) + String(this.y);
    }
}
