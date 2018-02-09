# Device.js

--------------

![](https://img.shields.io/badge/version-0.0.1-brightgreen.svg)

用NodeJS驱动硬件。

## 必看

```text
该软件在树莓派3B (Raspbian GNU/Linux 8.0 jessie)上面开发、测试
最新文档和代码请查看https://github.com/LanFly/Device
在除树莓派之外的平台通过npm安装此软件包可能会安装失败
该软件依赖很多第三方软件，并修改了其中的代码，感谢各位大佬的开源
因个人时间有限，且硬件种类繁多，代码中可能有尚未测试到的bug，可以通过下面的联系方式反馈给我并寻求帮助
我会持续集成其它种类的驱动，如有硬件没驱动的同学，可以反馈给我
```

> 报告bug:

 - QQ交流群: 230948257
 - email: [bluescode@outlook.com](mailto:bluescode@outlook.com)
 - issue: [https://github.com/LanFly/Device/issues](https://github.com/LanFly/Device/issues)

> 后续主要更新:

 - 增加更多型号硬件驱动
 - 更容易阅读的文档

> 更新记录:

 v0.0.1:

  - 增加讯飞XFS5152CE文字转语音芯片的驱动
  - 增加SSD1306 OLED屏幕的驱动。
  - 支持在SSD1306屏幕上直接绘制canvas，更友好的图形API(我正在尽量提高刷新率)
  - 包含UART串口、I2C、UDP驱动
  - 包含DHT-11、DHT-22温度湿度传感器驱动

test文件夹下面有测试例子，这些都在我的`Linux raspberrypi 4.4.34-v7+ Raspbian GNU/Linux 8.0 (jessie)`下面测试通过。

## 开始

可以引入所有的模块，也可以单独使用某一个模块。

1. 引入所有模块

 ```nodejs
 var Device = require('device');
 ```

2. 引入某一个模块

 ```nodejs
 var XFS5152CE = require('device/lib/device/xfs5152ce');
 ```

#### 用法：

 > new Device(option);

#### option: Object

`description`: String

此设备的描述。默认值：String('this device has not description')

`model`: String

此设备的具体型号，如果配置了此选项，则根据型号返回对应的硬件驱动实例。如果`device`没有该型号的驱动，则返回null。

目前device集成的驱动型号有：

 - dht11、dht22、am2302: 温湿度传感器，支持这3个型号
 - xfs5152ce: 科大讯飞XFS5152CE文字转语音芯片
 - ssd1306: SSD1306为主控的OLED显示屏，最大分辨率支持 128*128
 - 更多型号后续会持续集成

`interface`: String

此通用设备的通信方式。该选项适用于创建一个自定义设备驱动，或者device没有集成的设备。例如STC89C52RC单片机使用串口跟树莓派通信，则你可以创建一个串口设备，让你能和单片机交换数据，然后自己扩展应用层的逻辑驱动。

对于大部分的传感器或模块，都使用了常见的通信协议，例如：i2c、uart、spi、one-wire。驱动这些设备相对来说简单，因为你无需关心这些协议的原理，只需要处理发送和接受数据。

device集成的科大讯飞驱动就是通过创建uart串口驱动，然后实现say，sleep，setVolume等函数的。

device目前集成的通信协议有:

 - i2c: 同步串行总线
 - serial: 串行数据总线，即常见的串口
 - udp: 通过网络使用udp协议交换数据的设备。例如常见的ESP8266 WiFi模块，可以通过WiFi无线传输数据。也可以使用有线。
 - 后续会持续集成1-wire、SPI等协议。

`address`: String || Int

此设备的物理接口地址或者I2C从机设备的逻辑地址。如果此设备是串口协议的设备，则此字段表示设备在主机上的物理接口地址。例如USB转串口设备，则它的地址可能是字符串`/dev/ttyUSB0`。

如果此设备是使用I2C协议的设备，则它的值表示该I2C设备的逻辑地址。例如SSD1306模块，它的值可能是Int`0x3C`，一般用16进制表示，当然你喜欢也可以用10进制表示。

`device`: String

I2C设备在主机上的物理接口地址。I2C设备用2个地址来标识，第一个是物理接口地址，第二个是I2C从机的逻辑地址。为什么要2个地址？因为树莓派GPIO提供了2个I2C物理接口，device需要知道你的设备跟主机上的哪个接口相连。

它有下面2个可选值:
 
 1. String '/dev/i2c-0'
 2. String '/dev/i2c-1'

你可以使用`i2cdetect`工具来扫描接在总线上的所有I2C设备，并列出他们的逻辑地址。该工具需要先安装才能使用。


### 科大讯飞 XFS5152CE

xfs5152ce这款文字转语言芯片可以使用I2C、SPI、串口等方式通信，使用3.3V即可满足供电，我使用的是某宝上面的xfs5152ce模块，带3W功放，我使用5V电源比较稳定。

这里使用串口通信驱动模块，波特率一般为9600，波特率根据自己的情况设置。

```nodejs
var Device = require('device');

var xfs5152ce = new Device({
    description: 'xfs5152ce module',
    model: 'xfs5152ce',
    baudRate: 9600,
    address: '/dev/ttyUSB0'
});
```

上面返回一个串口驱动的实例，`address`参数是串口的地址。为什么是串口驱动？因为我们用的是串口方式驱动芯片的。你需要等待串口打开成功才能使用芯片。

```nodejs
xfs5152ce.on('open', function(next){
    xfs5152ce.say('你好，科大讯飞！');
    next();
});

xfs5152ce.on('error', function(error, next){
    console.log(error);
    next();
});
```

最好在open回调事件中使用串口功能，在open事件触发后，你就可以发送任意长度的文本给芯片朗读。

say函数会自动维护朗读队列。如果当前的文本没有朗读完，再次调用say函数会放到队列中，朗读完后自动从队列中取出第一个朗读，直到队列中所有的都朗读完。

`open`,`error`,`data`事件都支持中间件，这跟express框架的洋葱模型是差不多的。next方法表示下一个中间件，它支持参数，表示更改传递给下一个中间件的数据，此更改只作用下一个中间件。请看下面例子。

```nodejs
// 假设串口返回的数据是 data === 1
xfs5152ce.on('data', function(data, next){
    console.log('md-1-start: ', data);
    next(data + 1);
    console.log('md-1-end: ', data);
}).on('data', function(data, next){
    console.log('md-2-start: ', data);
    next();
    console.log('md-2-end: ', data);
}).on('data', function(data, next){
    console.log('md-3-start: ', data);
    next();
    console.log('md-3-end: ', data);
});
```

上面的执行结果如下：

```text
md-1-start: 1
md-2-start: 2
md-3-start: 1
md-3-end: 1
md-2-end: 2
md-1-end: 1
```

