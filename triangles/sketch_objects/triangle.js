import Line from "./line";
import Point from "./point";
import Drawing from "./drawing";
import Utils from "../../utils";

export default class Triangle {
    constructor(line1, line2, line3) {
        this.lines = this.sortLines(line1, line2, line3);
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
    };
    sortLines(line1, line2, line3) {
        // sorts lines by length longest to shortest
        let lines = [line1, line2, line3];
        return lines.sort((a, b) => {
            if (a.length_ < b.length_) {
                return 1;
            }
            else if (a.length_ > b.length_) {
                return -1;
            }
            else {
                return 0;
            };
        });
    };
    triangleId() {
        // concatinated lineIds ordered by their length from longest to shortest
        let component_line_ids = [];

        this.lines.forEach(line => {
            component_line_ids.push(line.Id)
        });
        return component_line_ids.join("");
    };
};