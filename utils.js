export default class Utils {
    static toRadians(degrees) {
        return degrees * (Math.PI / 180)
    };
    static toDegrees(radians) {
        return (radians * 180) / Math.PI
    };
    static randRange(min, max) {
        return Math.random() * (max - min) + min
    };
    static unique(array) {
        // https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
        let seen = Object();
        return array.filter(function (element) {
            return seen.hasOwnProperty(element) ? false : (seen[element] = true);
        })
    };
    static between(x, min, max) {
        return (x >= min) && (x <= max);
    };
};