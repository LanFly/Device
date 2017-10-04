var i2c = require('i2c');

//------------------------i2c设备----------------------------//

/**
 * 创建并打开i2c设备，创建完成立马能通信
 * 
 * @param {string} address    i2c设备地址
 * @param {string} device     i2c设备在操作系统中的接口地址
 * @param {any} config        配置参数
 */
function I2C(config) {

	this.config = {
		description: config.description,
		interface: 'i2c',
		address: config.address || 0,
		device: ocnfig.device || '/dev/i2c-1',
		ready: true
	};
	this.i2c = new i2c(address, { device: device });
}
/**
 * 为设备注册自定义驱动，如果驱动名称重复，会覆盖之前的
 * 
 * @param {string} name    驱动的名称，如果重复，会覆盖之前的
 * @param {Function} driver    驱动的具体实现
 * @return this
 */
I2C.prototype.driver = function (name, driver) {
	var self = this;
	this[name] = function () {
		var args = arguments;
		driver.apply(self, args);
	}
	return this;
};
module.exports = I2C;