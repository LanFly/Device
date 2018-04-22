var floydSteinberg = require('floyd-steinberg');
var os = require('os');

var utils = {

    /**
     * 判断一个对象是否是空对象
     * @param {Object} obj    要判断的对象
     * @return {Boolean}
     */
    isEmptyObject: function (obj) {
        var t;
        for (t in obj) {
            return false;
        }
        return true;
    },

    iterator: function (context, middleware, data) {
        if (middleware.length <= 0) {
            return;
        }
        var argsLength = arguments.length;
        var self = context;
        var i = 0;
        var md = middleware[i++];
        function handle(temp, next) {
            if (i < middleware.length) {
                md = middleware[i++];
            } else {
                md = function noop() { };
            }
            if (argsLength == 3) {
                next.call(self, temp, function (pre) {
                    handle(pre || data, md);
                });
            } else {
                next.call(self, function () {
                    handle(null, md);
                });
            }
        }
        handle(data, md);
    },

    /**
     * 把字符串转换为Unicode编码，一个字符2字节，高字节在前，低字节在后
     * @param {string} str    待转换的字符串
     * @return {Buffer}
     */
    stringToUnicode: function (str) {
        var i = 0, len = str.length;
        var hex, hhex, lhex;
        var buffer = [];

        for (; i < len; i++) {
            hex = str.charCodeAt(i).toString(16);
            // 高位在前，低位在后
            if (hex.length === 2) {
                buffer.push(+('0x' + hex), 0);
            } else {
                hhex = hex.substr(2, 2);
                lhex = hex.substr(0, 2);
                buffer.push(+('0x' + hhex), +('0x' + lhex))
            }
        }
        return buffer;
    },
    // pngparse doesn't quite have the correct object setup for pixel data
    createImageData: function (image) {
        var buf = new Buffer(image.width * image.height * 4);

        var l = image.data.length;
        var pos = 0;
        for (var y = 0; y < image.height; y++) {
            for (var x = 0; x < image.width; x++) {
                buf.writeUInt32BE(image.getPixel(x, y), pos);
                pos += 4;
            }
        }

        image.data = buf;

        return image;
    },
    imageDataToOLEDBuffer: function (imageData, dither, isCanvas) {
        // post process pixel data returned
        var pimage;
        if (isCanvas) {
            pimage = imageData;
        }else{
            pimage = this.createImageData(imageData);
        }

        var pixels = pimage.data,
            pixelsLen = pixels.length,
            height = pimage.height,
            width = pimage.width,
            alpha = pimage.hasAlphaChannel,
            threshold = 120,
            unpackedBuffer = [],
            depth = 4;

        // create a new buffer that will be filled with pixel bytes (8 bits per) and then returned
        var buffer = new Buffer((width * height) / 8);
        buffer.fill(0x00);

        // if dithering is preferred, run this on the pixel data first to transform RGB vals
        if (dither) {
            floydSteinberg(pimage);
        }

        // filter pixels to create monochrome image data
        for (var i = 0; i < pixelsLen; i += depth) {
            // just take the red value
            var pixelVal = pixels[i + 1] = pixels[i + 2] = pixels[i];

            // do threshold for determining on and off pixel vals
            if (pixelVal > threshold) {
                pixelVal = 1;
            } else {
                pixelVal = 0;
            }

            // push to unpacked buffer list
            unpackedBuffer[i / depth] = pixelVal;

        }

        // time to pack the buffer
        for (var i = 0; i < unpackedBuffer.length; i++) {
            // math
            var x = Math.floor(i % width);
            var y = Math.floor(i / width);

            // create a new byte, set up page position
            var byte = 0,
                page = Math.floor(y / 8),
                pageShift = 0x01 << (y - 8 * page);

            // is the first page? Just assign byte pos to x value, otherwise add rows to it too
            (page === 0) ? byte = x : byte = x + width * page;

            if (unpackedBuffer[i] === 0) {
                // 'off' pixel
                buffer[byte] &= ~pageShift;

            } else {
                // 'on' pixel
                buffer[byte] |= pageShift;
            }
        }
        return buffer;
    },
    /**
     * 获取本机IP地址
     * @return {string} IPv4地址
     */
    getIPAddress: function () {
        var interfaces = os.networkInterfaces();
        for(var iface in interfaces) {
            var netType = interfaces[iface];
            for(var i=0; i<netType.length; i++) {
                if (netType[i].family === 'IPv4' && netType[i].address !== '127.0.0.1') {
                    return netType[i].address;
                }
            }
        }
    },
    /**
     * get cpu usage and frequency CPU负载和频率
     * @return {Object} cpu usage and frequency
     */
    getCpuUsage: function () {
        var loadAvg = os.loadavg();
        var cpus = os.cpus();
        var frequency = cpus[0].speed;
        if (frequency > 999) {
            frequency = (frequency / 1000).toFixed(1) + 'GHz';
        }else{
            frequency += 'MHz';
        }
        var cpu_use = (loadAvg[1] / cpus.length).toFixed(2);
        cpu_use = (+cpu_use) * 100;
        cpu_use = cpu_use.toFixed(0);
        return {
            usage: cpu_use + '%',
            frequency: frequency
        };
    },
    /**
     * get memory usage info 内存使用信息
     * @return {Object} memory usage and free
     */
    getMemUsage: function () {
        var freemem = os.freemem();
        var mem_use = (1 - (freemem / os.totalmem()).toFixed(2)).toFixed(2) * 100 + '%';

        freemem = freemem / 1024 / 1024;
        if (freemem > 999) {
            freemem = (freemem / 1024).toFixed(1) + 'GB';
        }else{
            freemem = parseInt(freemem) + 'MB';
        }
        return {
            usage: mem_use,
            free: freemem
        };
    }
};

module.exports = utils;