/**
 * Test writing: 2017-12-24 19:14
 * Test passed
 * 
 * author: LanFly
 * email: bluescode@outlook.com
 * 
 * description: xfs5152基本用法
 */

var path = require('path');
var XFS5152CE = require('../lib/device/xfs5152ce');

var xfs = new XFS5152CE({
    description: 'test xfs5152ce',
    address: '/dev/ttyUSB0',
    baudRate: 9600
});

xfs.on('open', function (next) {
    var that = this;
    this.say('默认音量。[v1]这是最小音量。省电模式');
    setTimeout(function() {
        that.sleep();
        setTimeout(function() {
            that.wakeup();
            that.say('退出省电模式');
        }, 3000);
    }, 3000);
});
xfs.on('error', function (error, next) {
    console.log('error: ', error);
    next();
});
xfs.on('data', function (data, next) {
    console.log('data: ', data);
    next();
});