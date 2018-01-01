/**
 * Test writing: 2017-10-04 17:08
 * Test passed
 * 
 * author: LanFly
 * email: bluescode@outlook.com
 */

var path = require('path');
var SSD1306 = require('../lib/device/ssd1306');

var ssd1306 = new SSD1306({
    description: 'test ssd1306',
    width: 128,
    height: 64,
    address: 0x3c,
    device: '/dev/i2c-1'
});

var file = path.join(__dirname, 'image/starwars.png');

console.log('start draw PNG: ' + file);

ssd1306.drawPNG(file, false, function(error){
    if (error) {
        console.log(error);
    }else{
        console.log('draw PNG complete');
    }
});