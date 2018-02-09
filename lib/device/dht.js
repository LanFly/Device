var DHTSensor = require('node-dht-sensor');


//------------------------DHT11、22、AM2302系列设备----------------------------//
function DHTSeries(config) {
    // 设备标识 dht11 -> 11, dht22/am2302 -> 22
    var type = config.model === 'dht11' ? 11 : 22;
    var address = config.address || 4;
	this.config = {
		ready: true,
		model: config.model.toLowerCase(),
		description: config.description,
		interface: '1-wire',
		type: type,
		address: address
	};
	this.dht = DHTSensor;
}
DHTSeries.prototype.fetch = function(cb) {
	var self = this;
	this.dht.read(this.config.type, this.config.address, function(error, temperature, humidity){
		if(error){
			self.error = error;
		}
		cb.call(self, error, temperature, humidity);
	});
}

module.exports = DHTSeries;