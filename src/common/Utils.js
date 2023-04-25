export default class Utils {

    static randomColor() {
        let color = "0x" + Math.floor(Math.random()*16777215).toString(16);
        return parseInt(color)
    }

    static getRandomInt(min, max) {
        return Math.random() * (max - min) + min;
    }


}