import Point from "./point";
import Utils from "../../utils";

export default class Line {
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
        // uses tan opposite / adacent as y_mag / x_mag returning the angle of the line relative to horanzontal

        if (this.x_magnitude == 0) {
            return Math.PI / 2;
        }
        else {
            return Math.atan(this.y_magnitude / this.x_magnitude);
        }
    };
    lineId() {
        // id lead by point that is further to the right
        return Number(this.p1.x) > Number(this.p2.x) ? this.p1.Id + this.p2.Id : this.p2.Id + this.p1.Id;
    };
};