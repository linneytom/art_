import Point from "./point";
import Line from "./line";
import Triangle from "./triangle";
import Utils from "../../utils";

export default class Drawing {
    // contains drawing logic & execution
    constructor(width, height, legal_angle_range = [0, 360]) {
        // list of lines in drawing
        this.lines = [];
        this.width = width;
        this.height = height;
        // dictonary of points:[lines]
        // i hate the inconsisity but this is semi useful
        this.points = new Object();
        this.legal_angle_range = legal_angle_range;
        // list of triangles
        this.triangles = [];
    };
    // ****** UTILS ******
    previousLine() {
        return this.lines[this.lines.length - 1];
    };
    listPointsInLines(lines) {
        let p1s = [], p2s = [];

        lines.forEach(line => {
            p1s.push(line.p1)
            p2s.push(line.p2)
        });

        const all_points = unique(p1s.concat(p2s));

        return all_points;
    };

    // ****** LINE CREATION ******
    createNewLine(limiter) {
        // this kicks everything off!
        // p1 = p2 of last drawn line
        const legal_triangles = this.getLegalTriangles(); // replace getTriangleCandidatePoints
        let new_line, new_triangle;
        //const candidate_tri_points = this.getTriangleCandidatePoints()
        //const legal_triangle_line = this.legalTriangle(candidate_tri_points);
        if (legal_triangles.length > 0) {
            new_triangle = legal_triangles[0]
            new_line = legal_triangles[0].getCandidateLine(this);
            this.saveTriangle(new_triangle);
            return new_line;
        }
        else {
            // random line
            // create point within width, height
            const new_line = this.legalRandom(limiter);
            this.saveLine(new_line);
            return new_line;
        };
    };
    legalRandom(limiter) {
        // this quickly becomes stupid after more than 10 lines
        // need to find a way to smartly sample available space
        const prev_line = this.previousLine();
        let counter = 0;
        let illegal = true, candidate_line, legal_intersection;
        while (illegal && counter < limiter) {
            let candidate_point = new Point(
                // round points so that they are finite in the drawing space
                Math.round(this.width * Math.random()),
                Math.round(this.height * Math.random())
            );
            candidate_line = new Line(prev_line.p2.x, prev_line.p2.y, candidate_point.x, candidate_point.y)
            legal_intersection = this.noIllegalIntersections(candidate_line);
            if (legal_intersection) {
                illegal = false;
            };
            if (counter == limiter) {
                candidate_point = undefined
            }
            counter++;
        };
        return candidate_line
    };
    createInitialLine() {

        const x1 = Math.round(this.width * Math.random());
        const y1 = Math.round(this.height * Math.random());
        const x2 = Math.round(this.width * Math.random());
        const y2 = Math.round(this.height * Math.random());

        const new_line = new Line(x1, y1, x2, y2)
        this.lines.push(new_line)
        this.points[new_line.p1.pointId()] = [new_line];
        this.points[new_line.p2.pointId()] = [new_line];
        return new_line
    };

    // ****** CANDIDATE TRIANGLE CREATION ******
    getLegalTriangles() {
        const triangles = this.getCandidateTriangles();
        let legal_triangles = [];
        triangles.forEach(triangle => {
            if (this.legalTriangle(triangle)) {
                legal_triangles.push(triangle)
            }
        });
        return legal_triangles
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
    };

    // ****** CANDIDATE TRIANGLE EVALUATION ******
    legalTriangle(candidate_triangle) {
        // true 
        // if len > 0
        // && no interpolation
        // && angle acceptable
        // else 
        // false
        const candidate_line = candidate_triangle.getCandidateLine(this);
        if (candidate_line === undefined) {
            // no non-existing candidate lines=
            return false;
        };

        if (this.noIllegalIntersections(candidate_line)) {
            // non intersecting non existing line found
            return true;
        }
        else {
            // candidate line intersects existing line
            return false;
        };
    };

    // ****** CANDIDATE LINE EVALUATION ******
    parallel(line_a, line_b) {
        if (line_a.m == line_b.m) {
            return true
        }
        else {
            return false
        };
    };
    intersectionPoint(line_a, line_b) {
        // check lines are not parallel

        if (this.parallel(line_a, line_b)) {
            return undefined
        }

        // get intersection point of infinite lines
        // x = (c_b - c_a) / (m_a - m_b)

        const x_intersect_num = line_b.c - line_a.c
        const x_intersect_den = line_a.m - line_b.m
        const x_intersect = Math.round(x_intersect_num / x_intersect_den)
        const y_intersect = Math.round(line_a.m * x_intersect + line_a.c)

        return new Point(x_intersect, y_intersect);
    };
    illegalIntersectPoint(point, existing_line) {
        // intersection points are only allowed in two cases
        // 1. exist outside drawing space (described by height & width)
        // 2. exist on finite lines
        // 3. occur on a point

        if (this.points.hasOwnProperty(point.Id)) {
            // intersect point exists
            return false;
        };


        if (Utils.between(point.x, 0, this.width) && Utils.between(point.y, 0, this.height)) {
            // intersection happens within draw space so check if on finite line
            let existing_x_min = (existing_line.p1.x > existing_line.p2.x) ? existing_line.p2.x : existing_line.p1.x
            let existing_x_max = (existing_line.p1.x < existing_line.p2.x) ? existing_line.p2.x : existing_line.p1.x
            let existing_y_min = (existing_line.p1.y > existing_line.p2.y) ? existing_line.p2.y : existing_line.p1.y
            let existing_y_max = (existing_line.p1.y < existing_line.p2.y) ? existing_line.p2.y : existing_line.p1.y
            if (Utils.between(point.x, existing_x_min, existing_x_max) && Utils.between(point.y, existing_y_min, existing_y_max)) {
                // intersection happens within finite line
                return true;
            }
            else {
                // intersection happens within draw boundry but not on finite line
                return false;
            }
        }
        else {
            // intersection occurs outside boundry
            return false;
        };
    };
    noIllegalIntersections(line) {
        // gets all lines, intersection points are only allowed in two cases
        // 1. exist outside drawing space (described by height & width)
        // 2. occur on a point

        // find all intersections
        // evaluate all intersections
        let intersects_at;
        let no_illegal_intersections = true;
        this.lines.forEach(l => {
            // this needs a listed true=false mechanic!!!!!
            intersects_at = this.intersectionPoint(l, line);
            if (intersects_at !== undefined) {
                // lines are not parallel
                if (this.illegalIntersectPoint(intersects_at, l)) {
                    no_illegal_intersections = false;
                };
            };
        });
        // no illegal intersections found
        return no_illegal_intersections;
    };

    // ****** SAVE DRAWING COMPONENTS ******
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
    };
    saveTriangle(triangle) {
        this.saveLine(triangle.getCandidateLine(this));
        this.triangles.push(triangle);
    };
};