var base = require('./base');
var pngparse = require('pngparse');

var utils = {

    /**
     * 把canvas中的像素点映射成OLED屏幕的像素点格式
     * @param {Canvas} canvas    要映射的canvas实例
     * @param {Boolean} dither    是否抖动
     * @return {Buffer}
     */
    canvasToOLEDBuffer: function (canvas, dither, config) {
        var sx = config.sx || 0,
            sy = config.sy || 0,
            sw = config.sw,
            sh = config.sh;

        var ctx = canvas.getContext('2d');
        var imageData = ctx.getImageData(sx, sy, sw, sh);

        return base.imageDataToOLEDBuffer(imageData, dither, true);
    },

    /**
     * 将PNG图片转换为OLED屏幕的像素点格式
     * @param {string} pngFileName    png图片的地址
     * @param {Boolean} dither    是否启用抖动算法
     * @param {Function} callback    回调函数，第一个参数是error，第二个是Buffer
     */
    pngToOLEDBuffer: function (pngFileName, dither, callback) {
        // parse png file passed in
        pngparse.parseFile(pngFileName, function (err, imageData) {
            if (err) {
                return callback(err);
            }
            var buffer = base.imageDataToOLEDBuffer(imageData, dither);
            callback(null, buffer);
        });
    }
};

module.exports = utils;