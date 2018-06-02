var DHTSensor = require('node-dht-sensor');
var Rx = require('rx-lite');

// 大于，condi < value
Rx.Observable.prototype.max = function (condi) {
    var input = this;
    return Rx.Observable.create(function (observe) {
        var handle = input.subscribe(
            function (value) {
                if (value > condi) {
                    observe.onNext(value);
                }
            },
            function (error) {
                observe.onError(error);
            },
            function(value) {
                observe.onCompleted(value);
            }
        );
        return function () {
            handle.dispose();
        }
    });
};
// 小于，value < condi
Rx.Observable.prototype.min = function (condi) {
    var input = this;
    return Rx.Observable.create(function (observe) {
        var handle = input.subscribe(
            function (value) {
                if (value < condi) {
                    observe.onNext(value);
                }
            },
            function (error) {
                observe.onError(error);
            },
            function(value) {
                observe.onCompleted(value);
            }
        );
        return function () {
            handle.dispose();
        }
    });
};
// 等于，value == condi
Rx.Observable.prototype.when = function (condi) {
    var input = this;
    return Rx.Observable.create(function (observe) {
        var handle = input.subscribe(
            function (value) {
                if (value == condi) {
                    observe.onNext(value);
                }
            },
            function (error) {
                observe.onError(error);
            },
            function(value) {
                observe.onCompleted(value);
            }
        );
        return function () {
            handle.dispose();
        }
    });
};
// 大于left并且小于right，left < value < right
Rx.Observable.prototype.between = function (left, right) {
    var input = this;
    return Rx.Observable.create(function (observe) {
        var handle = input.subscribe(
            function (value) {
                if (value > left && value < right) {
                    observe.onNext(value);
                }
            },
            function (error) {
                observe.onError(error);
            },
            function(value) {
                observe.onCompleted(value);
            }
        );
        return function () {
            handle.dispose();
        }
    });
};
/**
 * 订阅观察者，返回订阅对象(subscription)
 * @param {function} onsuccess 读取成功的订阅函数(subscribe)
 * @param {function} onerror 读取失败的订阅函数(subscribe)
 */
Rx.Observable.prototype.then = function (onsuccess, onerror) {
	var input = this;
	if (typeof onsuccess === 'function') {
		return input.subscribe(
			function (value) {
				onsuccess(value);
			},
			function (error) {
				if (typeof onerror === 'function') {
					onerror(error);
				}
			},
			function (value) {
				onsuccess(value);
			}
		);
	}
};
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
		if (error) {
			self.error = error;
		}
		cb.call(self, error, temperature, humidity);
	});
}
/**
 * 返回一个观察者对象(Observable)，可使用then观察(subscribe)
 * @param {number} time 刷新传感器数值的间隔，单位：毫秒
 * @param {string} type 观察的数据类型，t: 温度，h: 湿度，为空同时观察温度和湿度
 */
DHTSeries.prototype.observe = function (time, type) {
	var self = this;
	time = time || 2000;
	return Rx.Observable.create(function (observe){
		var handle;
		var update = function () {
			self.fetch(function (e, t, h) {
				if (e) {
					observe.onError(e);
				}else{
					handle = setTimeout(update, time);
					if (type === 't') {
						observe.onNext(t);
					}else if (type === 'h') {
						observe.onNext(h);
					}else{
						observe.onNext({
							t: t,
							h: h
						});
					}
				}
			});
		};
		update();
		return function () {
			clearTimeout(handle);
		}
	});
}
module.exports = DHTSeries;