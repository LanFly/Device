/**
 * Test writing: 2018-01-01 20:14
 * Test passed
 * 
 * author: LanFly
 * email: bluescode@outlook.com
 */

var Canvas = require('canvas');
var SSD1306 = require('../lib/device/ssd1306');

var ssd1306 = new SSD1306({
    description: 'test ssd1306',
    width: 128,
    height: 64,
    address: 0x3c,
    device: '/dev/i2c-1'
});

var canvas = new Canvas(128, 64);
var ctx = canvas.getContext('2d');

ctx.fillStyle = '#FFF';
ctx.fillText("Hello world", 0, 0);

ssd1306.drawCanvas(canvas);