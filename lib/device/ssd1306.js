var ssd1306 = require('oled-ssd1306-i2c');
var ssdUtils = require('../utils/ssd1306');

/**
 * 创建一个ssd1306为主控的OLED显示设备
 * 
 * @param {Object} config 
 */
function SSD1306(config) {
	this.config = {
		width: config.width || 128,
		height: config.height || 64,
		address: config.address || 0x3C,
		device: config.device || '/dev/i2c-1',
		microview: config.microview || false,
		model: 'ssd1306',
		description: config.description,
		interface: 'i2c',
		ready: false
	};
	this.oled = new ssd1306({
		width: this.config.width,
		height: this.config.height,
		address: this.config.address,
		device: this.config.device,
		microview: this.config.microview
	});
	this.config.ready = true;
}
/**
 * 将canvas的像素点绘制到屏幕上，注意，目前不支持彩色
 * 
 * @param {canvas} canvas    要绘制的canvas
 * @param {Object} config    配置从canvas中要绘制的矩形区域
 */
SSD1306.prototype.drawCanvas = function (canvas, config) {
	var sx = 0;
	var sy = 0;
	var sw = this.config.width;
	var sh = this.config.height;
	if (config) {
		sx = config.sx || 0;
		sy = config.sy || 0;
		sw = config.sw || this.config.width;
		sh = config.sh || this.config.height;
	}
	// 把canvas转换为OLED的像素点格式
	var oledBuffer = ssdUtils.canvasToOLEDBuffer(canvas, false, {
		sx: sx,
		sy: sy,
		sw: sw,
		sh: sh
	});
	// 设置OLED屏幕像素映射的buffer
	this.oled.buffer = oledBuffer;
	// 刷新屏幕
	this.oled.update();
}
/**
 * 将PNG图片绘制到屏幕上，只支持PNG图片
 * 
 * @param {string} filename    PNG图片的路径
 * @param {Boolean} dither    是否启动抖动算法，建议不启用
 * @param {Function} callback    绘制完后的回调函数，第一个参数是error
 */
SSD1306.prototype.drawPNG = function (filename, dither, callback) {
	var self = this;
	ssdUtils.pngToOLEDBuffer(filename, dither, function(error, buffer){
		if(error){
			callback(error);
		}else{
			self.oled.buffer = buffer;
			self.oled.update();
			callback(null);
		}
	});
}


module.exports = SSD1306;