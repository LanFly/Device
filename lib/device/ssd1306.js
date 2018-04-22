var font = require('oled-font-5x7');
var baseUtils = require('../utils/base');
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
	ssdUtils.pngToOLEDBuffer(filename, dither, function (error, buffer) {
		if (error) {
			callback(error);
		} else {
			self.oled.buffer = buffer;
			self.oled.update();
			callback(null);
		}
	});
}
/**
 * 显示系统信息，自动刷新
 * @param {Number} second 刷新间隔秒数
 */
SSD1306.prototype.showSystemInfo = function (second) {
	var self = this;

	var center = function (oled, text, start) {
		var textWidth = text.length * 7;
		if (textWidth >= oled.WIDTH) {
			oled.setCursor(0, start);
		} else {
			var left = Math.floor((oled.WIDTH - textWidth) / 2);
			oled.setCursor(left, start);
		}
		oled.writeString(font, 1, text, 1, true, 1, false);
	}
	var dateTime = function () {
		var now = new Date();
		var obj = {
			week: now.getDay() === 0 ? 7 : now.getDay(),
			year: '' + now.getFullYear(),
			month: now.getMonth() < 9 ? '0' + (now.getMonth() + 1) : '' + (now.getMonth() + 1),
			day: now.getDate() < 10 ? '0' + now.getDate() : '' + now.getDate(),
			hour: now.getHours() < 10 ? '0' + now.getHours() : '' + now.getHours(),
			minute: now.getMinutes() < 10 ? '0' + now.getMinutes() : '' + now.getMinutes(),
			second: now.getSeconds() < 10 ? '0' + now.getSeconds() : '' + now.getSeconds()
		};
		return {
			dateTime: obj.year + '-' + obj.month + '-' + obj.day + ' ' + obj.hour + ':' + obj.minute,
			second: obj.second
		}
	}
	var render = function (oled, cpu, mem, ip, dateTime) {
		oled.clearDisplay();
		// title标题
		oled.setCursor(0, 0);
		oled.drawRect(0, 0, oled.WIDTH - 1, 13, 1, false);
		center(oled, 'System Info', 3);
		oled.drawLine(0, 13, oled.WIDTH - 1, 13, 1, false);
		// CPU Info
		oled.setCursor(0, 17);
		oled.writeString(font, 1, 'CPU: ' + cpu.usage + ' ' + cpu.frequency, 1, true, 1, false);
		// memory Info
		oled.setCursor(0, 28);
		oled.writeString(font, 1, 'MEM: ' + mem.usage + ' ' + mem.free, 1, true, 1, false);
		// draw second
		oled.setCursor(105, 19);
		oled.writeString(font, 2, dateTime.second, 1, true, 1, false);
		// separation line
		oled.drawLine(0, 38, oled.WIDTH - 1, 38, 1, false);
		// date time
		oled.setCursor(0, 43);
		oled.writeString(font, 1, dateTime.dateTime, 1, true, 1, false);
		// separation line
		oled.drawLine(0, 54, oled.WIDTH - 1, 54, 1, false);
		// IP address
		oled.setCursor(0, 57);
		oled.writeString(font, 1, 'IP:' + ip, 1, true, 1, false);

		oled.update();
	}

	function monitor(time) {
		var cpu = baseUtils.getCpuUsage();
		var mem = baseUtils.getMemUsage();
		var ip = baseUtils.getIPAddress();
		render(self.oled, cpu, mem, ip, dateTime());

		if (time > 0) {
			self.showSystemInfoHandle = setTimeout(function () {
				monitor(time);
			}, time);
		}
	}
	monitor(+second > 0 ? second * 1000 : 0);
}
/**
 * 停止刷新系统信息
 */
SSD1306.prototype.stopSystemInfo = function () {
	clearTimeout(this.showSystemInfoHandle);
}


module.exports = SSD1306;