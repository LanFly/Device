var base = require('../utils/base');
var SerialPort = require("serialport");

//------------------------串口设备----------------------------//
/**
 * 创建一个串口设备
 * @data  2017-06-21T18:25:45+0800
 * @param {string}                 address  [串口设备的地址]
 * @param {number}                 baudRate [串口设备的波特率]
 * @param {any}                    config   [配置参数]
 */
function SERIAL(config) {
	this.config = {
		description: config.description,
		interface: 'serial',
		address: config.address || '',
		baudRate: config.baudRate || 9600,
		ready: false
	};
	this.RXDcb = []; // 串口设备接收数据事件
	this.OPENcb = []; // 串口设备打开回掉
	this.ERRORcb = []; // 串口设备发生错误回掉
	this.serial = new SerialPort(this.config.address, {
		baudRate: this.config.baudRate,
		parser: SerialPort.parsers.raw
	});

	// 注册串口接收数据事件
	var self = this;
	this.serial.on('data', function(raw) {
		if(self.RXDcb.length <= 0) {
			return;
		}
		base.iterator(self, self.RXDcb, raw);
		console.log('[debug] receive data :', raw);
	});
	this.serial.on('open', function(){
		self.config.ready = true;
		base.iterator(self, self.OPENcb);
		console.log('[debug] open');
	});
	this.serial.on('error', function(error){
		self.config.ready = false;
		base.iterator(self, self.ERRORcb, error);
		console.log('[debug] error: ', error);
	});
}

/**
 * 注册串口事件监听
 * open和error只能监听一个，可以多次监听，但只有最后一个会被调用
 * 支持链式调用，data支持洋葱模型的中间件，其典型cb: 
 *   function(data, next){
 *     // data: 从串口接收到的数据，buffer类型。或者从上一个中间件传递的值
 * 	   // do somethings;
 * 	   next();
 * 	   // 你也可以在next(data)中传递一个数据给下一个中间件，注意只对下一个中间件有效
 * 	   // next('foo');
 *   }
 * @data   2017-06-22T10:24:25+0800
 * @param  {string}                 type [监听的事件类型，可以是data、open、error]
 * @param  {Function}               cb   [回调函数]
 * @return {SERIAL device}               [description]
 */
SERIAL.prototype.on = function(type, cb) {
	if(type == 'data'){
		this.RXDcb.push(cb);
	}else if(type == 'open'){
		this.OPENcb.push(cb);
	}else if(type == 'error'){
		this.ERRORcb.push(cb);
	}
	// 以支持链式调用
	return this;
}
/**
 * 向串口设备发送数据
 * @data   2017-06-21T18:27:36+0800
 * @param  {string}                 data [要发送的数据]
 * @param  {function}               cb   [发送完成的回掉函数]
 * @return {type}                   [无返回值]
 */

SERIAL.prototype.write = function(data, cb) {
	var self = this;
	this.serial.write(data, function(error){
		cb.call(self, error);
	});
}
/**
 * 为设备注册自定义驱动，如果驱动名称重复，会覆盖之前的
 * 
 * @param {string} name    驱动的名称，如果重复，会覆盖之前的
 * @param {Function} driver    驱动的具体实现
 * @return this
 */
SERIAL.prototype.driver = function (name, driver) {
	var self = this;
	this[name] = function () {
		var args = arguments;
		driver.apply(self, args);
	}
	return this;
};
module.exports = SERIAL;
