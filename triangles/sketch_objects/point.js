import Utils from "../../utils";

export default class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.Id = this.pointId();
    }
    pointId() {
        return String(this.x) + String(this.y);
    }
}