
var SERIAL = require('./lib/device/serial');
var I2C = require('./lib/device/i2c');
var UDP = require('./lib/device/udp');
var DHTSeries = require('./lib/device/dht');
var XFS5152CE = require('./lib/device/xfs5152ce');
var SSD1306 = require('./lib/device/ssd1306');

function Device(opt) {
	// 通用配置
	var config = {
		model: opt.model || '', // 设备具体型号，例如 dht11
		description: opt.description || 'this device has not description', // 设备描述信息
		interface: opt.interface || '', // 设备接口类型
		address: opt.address || '' // 设备地址
	};
	// 已经集成的设备
	if(config.model !== '') {
		var model = config.model.toLowerCase();
		if(model === 'dht11' || model === 'dht22' || model === 'am2302') {
			var dhtsensor = new DHTSeries(config);
			return dhtsensor;
		}else if(model == 'xfs5152ce') {
			var xfs5152ce = new XFS5152CE(config);
			return xfs5152ce;
		}else if(model == 'ssd1306') {
			var ssd1306 = new SSD1306(config);
			return ssd1306;
		}
	}

	// 通用设备
	var _this = null;
	//---------------------i2c---------------------//
	if(config.interface === 'i2c') {

		_this = new I2C(config);
	}else if(config.interface === 'serial') {

		_this = new SERIAL(config);
	}else if(config.interface === 'udp') {
		
		_this = new UDP(config);
	}

	return _this;
}



module.exports = Device;