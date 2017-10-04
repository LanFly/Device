var dgram = require('dgram');



/**
 * 建立一个UDP服务器并监听指定端口，通过UDP发送数据到指定的目标设备
 * 
 * @param {any} config
 */
function UDP(config) {

	this.config = {
		ready: false,
		description: config.description,
		type: config.type || 'udp4',
		address: config.address || '127.0.0.1',
		port: config.port || 8266,
		remoteAddress: config.remoteAddress,
		remotePort: config.remotePort || 8266,
		reuseAddr: config.reuseAddr || false,
		error: 'Waiting for device connections.'
	};
	this.onData = [];
	this.onListening = function noop(){};
	this.onError = function noop(){};
	this.onClose = function noop(){};

	this.socket = dgram.createSocket({
		type: this.config.type,
		address: this.config.address,
		port: this.config.port,
		reuseAddr: this.config.reuseAddr
	});
	var self = this;
	this.socket.on('listening', function() {
		self.config.ready = true;
		self.config.error = '';
		self.onListening.call(self);
	});
	this.socket.on('close', function() {
		self.config.ready = false;
		self.config.error = 'The connection is closed.';
		self.onClose.call(self);
	});
	this.socket.on('error', function(error) {
		self.config.error = error;
		self.onError.call(self, error);
	});
	this.socket.on('message', function(raw, remoteInfo) {
		if(self.onData.length <= 0) {
			return;
		}

		var i = 0;
		var md = self.onData[i++];
		function handle(data, remote, next){
			if(i < self.onData.length){
				md = self.onData[i++];
			}else{
				md = function noop(){};
			}
			next.call(self, data, remote, function(pre){
				handle(pre || raw, remote, md);
			});
		}
		handle(raw, remoteInfo, md);
	});
}
/**
 * [注册事件监听]
 * open和error只能监听一个，可以多次监听，但只有最后一个会被调用
 * 支持链式调用，data支持洋葱模型的中间件，其典型cb: 
 *   function(data, next){
 *     // data: 从网络接收到的数据，buffer类型。或者从上一个中间件传递的值
 * 	   // do somethings;
 * 	   next();
 * 	   // 你也可以在next(data)中传递一个数据给下一个中间件，注意只对下一个中间件有效
 * 	   // next('foo');
 *   }
 * @data   2017-06-22T10:24:25+0800
 * @param  {[string]}                 type [监听的事件类型，可以是listening、message、close、error]
 * @param  {Function}                 cb   [description]
 * @return {SERIAL device}            [description]
 */
UDP.prototype.on = function (type, cb) {
	if(type == 'listening'){
		this.onListening = cb;
	}else if(type == 'close'){
		this.onClose = cb;
	}else if(type == 'error'){
		this.onError = cb;
	}else if(type == 'message'){
		this.onData.push(cb);
	}
	return this;
}
/**
 * 通过网络向设备发送数据
 * @data   2017-07-13T15:58:07+0800
 * @param  {[buffer]}                 data [要发送的数据，以二进制发送]
 * @param  {Function(error)}          cb   [发送完成回调函数，如果发送错误，参数error表示错误信息]
 */
UDP.prototype.write = function (data, cb) {
	var self = this;
	if(this.config.ready){
		this.socket.send(data, this.config.remotePort, this,config.remoteAddress, function(){
			cb.call(self, null);
		});
	}else{
		cb.call(self, this.config.error);
	}
}
/**
 * 为设备注册自定义驱动，如果驱动名称重复，会覆盖之前的
 * 
 * @param {string} name    驱动的名称，如果重复，会覆盖之前的
 * @param {Function} driver    驱动的具体实现
 * @return this
 */
UDP.prototype.driver = function (name, driver) {
	var self = this;
	this[name] = function () {
		var args = arguments;
		driver.apply(self, args);
	}
	return this;
};
module.exports = UDP;