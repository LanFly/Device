var Device = require('../index');

var dht11 = new Device({
    model: 'dht11',
    address: 4
});

// 同时观察温度和湿度
var subscription = dht11.observe(2000).then(function (value) {
    console.log('temperature: ', value.t);
    console.log('humidity: ', value.h);
    // 停止刷新数值
    // subscription.dispose();
}, function (error) {
    console.log(error);
});

// 只观察温度
var subscription1 = dht11.observe(2000, 't').then(function (value) {
    console.log('temperature: ', value);
    // 停止刷新数值
    // subscription.dispose1();
}, function (error) {
    console.log(error);
});

// 只观察湿度
var subscription2 = dht11.observe(1000, 'h').then(function (value) {
    console.log('humidity: ', value);
    // 停止刷新数值
    // subscription2.dispose();
}, function (error) {
    console.log(error);
});