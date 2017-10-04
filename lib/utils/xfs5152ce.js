var base = require('./base');

var utils = {
    /**
     * 把文本转换为科大讯飞xfs5152ce的语音合成命令，使用Unicode编码
     * @param {string} text    待合成的文本
     * @return {Buffer}
     */
    textToVoice: function (text) {
        var data = base.stringToUnicode(text);
        var length = data.length + 2;
        var HLen = Math.floor(length / 256);
        var LLen = length % 256;
        data.unshift(0xFD, HLen, LLen, 0x01, 0x03);
        return data;
    }
};

module.exports = utils;