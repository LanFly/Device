/**
 * Test writing: 2018-04-22 17:06
 * Test passed
 * 
 * author: LanFly
 * email: bluescode@outlook.com
 * 
 * description: 使用SSD1306自带的绘图函数，没有依赖
 */

var Utils = require('../lib/utils/base');
var SSD1306 = require('../lib/device/ssd1306');
var font = require('oled-font-5x7');

var ssd1306 = new SSD1306({
    description: 'test ssd1306',
    width: 128,
    height: 64,
    address: 0x3c,
    device: '/dev/i2c-1'
});

var render = function (oled, cpu, mem, ip, dateTime) {
    oled.clearDisplay();
    // title标题
    oled.setCursor(0, 0);
    oled.drawRect(0, 0, oled.WIDTH-1, 13, 1, false);
    center(oled, 'System Info', 3);
    oled.drawLine(0, 13, oled.WIDTH-1, 13, 1, false);
    // CPU Info
    oled.setCursor(0, 17);
    oled.writeString(font, 1, 'CPU: ' + cpu.usage + ' ' + cpu.frequency, 1, true, 1, false);
    // memory Info
    oled.setCursor(0, 28);
    oled.writeString(font, 1, 'MEM: ' + mem.usage + ' ' + mem.free, 1, true, 1, false);
    // draw second
    oled.setCursor(105, 19);
    oled.writeString(font, 2, dateTime.second, 1, true, 1, false);
    // separation line
    oled.drawLine(0, 38, oled.WIDTH-1, 38, 1, false);
    // date time
    oled.setCursor(0, 43);
    oled.writeString(font, 1, dateTime.dateTime, 1, true, 1, false);
    // separation line
    oled.drawLine(0, 54, oled.WIDTH-1, 54, 1, false);
    // IP address
    oled.setCursor(0, 57);
    oled.writeString(font, 1, 'IP:' + ip, 1, true, 1, false);
    
    oled.update();
}

function center(oled, text, start) {
    var textWidth = text.length * 7;
    if (textWidth >= oled.WIDTH) {
        oled.setCursor(0, start);
    }else{
        var left = Math.floor((oled.WIDTH - textWidth) / 2);
        oled.setCursor(left, start);
    }
    oled.writeString(font, 1, text, 1, true, 1, false);
}

function monitor(time) {
    var cpu = Utils.getCpuUsage();
    var mem = Utils.getMemUsage();
    var ip = Utils.getIPAddress();
    render(ssd1306.oled, cpu, mem, ip, dateTime());

    setTimeout(function(){
        monitor(time);
    }, time);
}

function dateTime() {
    var now = new Date();
    var obj = {
        week : now.getDay() === 0 ? 7 : now.getDay(),
        year : '' + now.getFullYear(),
        month : now.getMonth() < 9 ? '0' + (now.getMonth() + 1) : '' + (now.getMonth() + 1),
        day : now.getDate() < 10 ? '0' + now.getDate() : '' + now.getDate(),
        hour : now.getHours() < 10 ? '0' + now.getHours() : '' + now.getHours(),
        minute : now.getMinutes() < 10 ? '0' + now.getMinutes() : '' + now.getMinutes(),
        second : now.getSeconds() < 10 ? '0' + now.getSeconds() : '' + now.getSeconds()
    };
    return {
        dateTime: obj.year + '-' + obj.month + '-' + obj.day + ' ' + obj.hour + ':' + obj.minute,
        second: obj.second
    }
}

monitor(1000);