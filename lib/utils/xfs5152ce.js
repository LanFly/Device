var base = require('./base');

var utils = {
    /**
     * 把文本转换为科大讯飞xfs5152ce的语音合成命令，使用Unicode编码
     * @param {string} text    待合成的文本
     * @return {Buffer}
     */
    textToVoice: function (text) {
        var unicode = base.stringToUnicode(text);
        return this.generationCommand([0x01, 0x03], unicode)
    },
    generationCommand: function (cmd, data) {
        var command = [0xFD];
        var dataFrame = cmd || [];
        if (arguments.length == 2) {
            dataFrame = dataFrame.concat(data);
        }
        var HLen = Math.floor(dataFrame.length / 256);
        var LLen = dataFrame.length % 256;
        return command.concat([HLen, LLen], dataFrame);
    }
};

module.exports = utils;