var SERIAL = require('./serial');
var xfsUtils = require('../utils/xfs5152ce');

function XFS5152CE(config) {
    var address = config.address || '';
    var baudRate = config.baudRate || 9600;
	var serial = new SERIAL({
		description: config.description,
		model: 'xfs5152ce',
		interface: 'serial',
		baudRate: baudRate,
		address: address
	});
	serial.volume = 3;
	serial.busy = true;
	serial.voiceQueue = [];
	serial.on('open', function(next){
		this.busy = false;
		next();
	});
	serial.on('error', function(error, next){
		this.config.error = error;
		next();
	});
	// 注册数据处理中间件，洋葱模型，next(data)可选传递参数给后面的中间件
	serial.on('data', function(data, next){
		var cmd = {
			busy: 0x4E,
			free: 0x4F,
			error: 0x45,
			correct: 0x41,
			work: 0x4A
		};
		
		// 处理芯片的工作状态中间件，芯片回传的状态数据一定为1个字节
		if(data.length === 1){
			if(data[0] == cmd.busy){
				this.busy = true;
			}else if(data[0] == cmd.error){
				this.config.error = new Error('your frame data is out of order');
				console.log(this.config.error);
			}else if(data[0] == cmd.correct){
				this.config.error = null;
			}else if(data[0] == cmd.free){
				this.busy = false;
				// 芯片处于空闲状态，并且队列不为空，自动发送队列命令
				if(this.voiceQueue.length > 0){
					var voice = this.voiceQueue.shift();
					this.write(voice.voice, voice.cb);
					this.busy = true;
				}
			}else if (data[0] == cmd.work) {
				this.busy = false;
				// 芯片处于空闲状态，并且队列不为空，自动发送队列命令
				if (this.voiceQueue.length > 0) {
					var voice = this.voiceQueue.shift();
					this.write(voice.voice, voice.cb);
					this.busy = true;
				}
			}
		}

		// 调用下一个中间件
		next();
	});
	serial.driver('setVolume', function (vol) {
		if (isNaN(vol)) {
			return false;
		}
		if (vol < 1 || vol > 10) {
			return false;
		}
		this.volume = vol;
	});
	serial.driver('getVolume', function () {
		return this.volume;
	});
	// 注册 语音合成 驱动
	serial.driver('say', function(text, imed, cb){
		var imediately, callback;
		var voice = xfsUtils.textToVoice('[v' + this.volume + ']' + text);

		// 判断参数个数，后2个参数可省略
		if(arguments.length === 1){
			imediately = false;
			callback = function noop(){};
		}else if(arguments.length === 2){
			if(typeof imed === 'function'){
				callback = imed;
				imediately = false;
			}else{
				imediately = imed;
				callback = function noop(){};
			}
		}else{
			imediately = imed;
			callback = cb;
		}
		// 如果需立即朗读 或者 队列为空并且处于空闲状态，则发送朗读命令
		if(imediately || (this.voiceQueue.length <= 0 && !this.busy)){
			this.write(voice, callback);
			// 正在朗读，状态设为忙
			this.busy = true;
		// 正在朗读中，进入队列等待
		}else if(this.busy){
			this.voiceQueue.push({
				voice: voice,
				cb: callback
			});
		// 处于空闲状态，但是队列不为空，则按照先来后到朗读
		}else{
			this.voiceQueue.push({
				voice: voice,
				cb: callback
			});
			var preVoice = this.voiceQueue.shift();
			this.write(preVoice.voice, preVoice.cb);
			this.busy = true;
		}
	});
	serial.driver('sleep', function (cb) {
		var frame = xfsUtils.generationCommand([0x88]);
		var callback = cb || function () {};
		this.busy = true;
		this.write(frame, callback);
	});
	serial.driver('wakeup', function (cb) {
		var frame = xfsUtils.generationCommand([0xFF]);
		var callback = cb || function () {};
		this.write(frame, callback);
	});
	serial.driver('voiceLength', function () {
		return this.voiceQueue.length;
	});
	serial.driver('isBusy', function () {
		return this.busy;
	});
	return serial;
}

module.exports = XFS5152CE;
