# oneDevice.js

用NodeJS驱动硬件。

心塞塞的，device被占用了，只能叫onedevice了。这感觉。。。。。。🙄

--------------

![](https://img.shields.io/badge/version-0.0.3-brightgreen.svg) ![](https://img.shields.io/badge/test-passing-brightgreen.svg)

<h2 style="color: #2493fb;">这是什么？</h2>

这是一个旨在用NodeJS驱动硬件的驱动包。开箱即用、完善的文档、持续更新、友好的API。用树莓派打造自己的智能家居。

<h4 style="color: #2493fb;">最近更新</h4>

> <span style="color: red;">v0.0.3</span> @ 2018-06-02 22:56

 - 使用RxJS，更抽象更简单易用的API


<h4 style="color: #2493fb;">报告bug</h4>

 - QQ交流群: 230948257
 - email: [bluescode@outlook.com](mailto:bluescode@outlook.com)
 - issue: [https://github.com/LanFly/Device/issues](https://github.com/LanFly/Device/issues)


<h4 style="color: #2493fb;">后续主要更新</h4>

 - 增加更多型号硬件驱动
 - 更抽象的API，一句话完成条件监控、动作触发
 - 更容易阅读的文档


test文件夹下面有测试例子，这些都在我的`Linux raspberrypi 4.4.34-v7+ Raspbian GNU/Linux 8.0 (jessie)`下面测试通过。

<h2 style="color: #2493fb;">必看</h2>

```text
0. 树莓派需要先安装BCM2835
1. 该软件在树莓派3B (Raspbian GNU/Linux 8.0 jessie)上面开发、测试
2. 最新文档和代码请查看https://github.com/LanFly/Device
3. 在除树莓派之外的平台通过npm安装此软件包可能会安装失败
4. 该软件依赖很多第三方软件，并修改了其中的代码，感谢各位大佬的开源
5. 因个人时间有限，且硬件种类繁多，代码中可能有尚未测试到的bug，可以通过下面的联系方式反馈给我并寻求帮助
6. 我会持续集成其它种类的驱动，如有硬件没驱动的同学，可以反馈给我
7. i2c包的作者已经N年不更新了，里面有个bug，pull request也不处理。使用ssd1306的时候可能会有点问题，自己改一行代码就行了。
```

## 开始

可以引入所有的模块，也可以单独使用某一个模块。

1. 引入所有模块

 ```js
 var Device = require('onedevice');
 ```

2. 引入某一个模块

 ```js
 var XFS5152CE = require('onedevice/lib/device/xfs5152ce');
 ```

#### 用法：

```js
new Device(option);
```

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

```js
var Device = require('onedevice');

var xfs5152ce = new Device({
    description: 'xfs5152ce module',
    model: 'xfs5152ce',
    baudRate: 9600,
    address: '/dev/ttyUSB0'
});
```

上面返回一个串口驱动的实例，`address`参数是串口的地址。为什么是串口驱动？因为我们用的是串口方式驱动芯片的。你需要等待串口打开成功才能使用芯片。

```js
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

```js
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

XFS5152CE驱动实例实现了以下函数:

##### function: say(text, imediately, callback)

@params {String} text: 必需。要朗读的文本。可以带上文本控制标记

@params {Boolean} imediately: 可选。是否立即朗读。如果为true，会中断当前正在朗读的指令。

@params {function} callback: 可选。发送朗读指令成功的回调。

尽快朗读文本。驱动实现了语音指令缓存，上位机可以连续的多次调用朗读函数，然后去处理其它任务。驱动会按照先后顺序，自动朗读完所有语音指令。如果imediately为true，则会停止正在朗读的所有文本，转而立即朗读text。

##### function: setVolume(volume)

@params {integer} volume: 设置朗读的音量。对正在朗读的文本无效。

设置朗读的音量。可选值为1到10之间的整数。包含1和10。1位最小音量，10为最大音量。默认音量为3。设置音量后仅对后面的语音指令有效，对正在朗读的文本不影响。后面优化成实时设置音量。

##### function: getVolume()

@return {integer}

返回朗读的音量。

##### function: sleep(callback)

@params {function} callback: 进入省电模式成功后的回调

让芯片进入省电模式。发送省电指令后，芯片立即停止当前所有指令，此时芯片的工作电流为5mA。

##### function: wakeup(callback)

@params {function} callback: 退出省电模式成功后的回调

让芯片恢复到待合成模式。进入待合成模式时，驱动会自动朗读当前未朗读的文本。

##### function: voiceLength()

@return {integer}

返回当前未朗读的语音合成指令数。每调用一次say函数，就会增加一个语音合成指令数量。

##### function: isBusy()

@return {boolean}

返回芯片是否正在朗读文本。

##### function: on(type, callback)

@params {string} type: 监听的事件类型，可以是data、open、error

@params {function} callback: 当事件触发时需要执行的函数

注册指定事件的回调，当事件发生时会执行回调函数。可以链式调用。采用和express相似的洋葱模型。

事件类型不同，callback回调的参数也不同:

> data: function(data, next)
>   data是接收到的数据。也可能是上一个中间件中调用next(data)传递过来的data
> 
> open: function(next)
>   
> error: function(error, next)
>   error是发生错误时的信息。

------------------------------------------

### DHT11、DHT22、AM2302系列设备

这些设备比较简单，使用单总线的方式，只需要一根数据线和树莓派相连。剩下2根是电源线，分别连接正极和负极。也可以不使用电源线，只使用一根数据线完成数据的读取、发送，并且从数据线上获取设备所需要的电源。具体请另行查阅单总线的寄生电路。

```js
var dht11 = new Device({
    model: 'dht11',
    description: 'dht11 sensor',
    address: 4
});
```

address是传感器的数据线连接在树莓派GPIO的编号。采用BCM GPIO编号。


```js
dht11.fetch(function(error, temperature, humidity){
    if (error) {
        console.log(error.message);
    }else{
        console.log('温度: ' + temperature + ' 湿度: ' + humidity);
    }
});
```

读取传感器数据比较简单。注意：DHT11采样周期是1s，建议连续读取数值至少间隔1s以上，否则可能会引起错误。DHT22采样周期2s，建议连续读取数值至少间隔2s以上。

dht系列传感器现在增加RxJS。使用`observe`可返回`观察者`对象。

```js
// 观察dht11传感器的数值，间隔2秒观察一次
var observable = dht11.observe(2000);
```

`observable`是可订阅的，使用`then`订阅，订阅后返回`subscription`，表示进行中的执行。

```js
var subscription = observable.then(function(value){
    // 读取传感器数值成功的订阅函数
    console.log(value);
    // 每隔2秒这个订阅函数会执行一次，因为在observe中我们指定了2秒
    // subscription可以使用dispose停止订阅，停止订阅后，这个订阅函数将不会再执行
    subscription.dispose();
}, function(error){
    // 读取传感器数值失败的订阅函数
    console.log(error);
    // 读取失败后会自动停止订阅
});
```

使用RxJS，我们可以轻松的组合各种条件`操作符`，这可以让我们的逻辑更直观。

```js
// observe可以指定观察数据类型，t 表示温度，h 表示湿度，如果不传，则温度和湿度都观察

var subscription = dht11.observe(2000, 't').max(28).then(function(value){
    console.log('好热啊！当前温度是: ', value);
});

var subscription1 = dht11.observe(2000, 'h').min(20).then(function(value){
    console.log('好干燥啊！当前湿度是: ', value);
});
```

max、min 就是`操作符`。操作符可链式组合，并且有先后顺序，他们就像一节一节管道一样被依次连接。

max 表示大于(value > max)，上面的结果就是当温度大于28的时候，将会执行订阅函数。

min 表示小于(value < min)，结果是当湿度小于20的时候，将会执行订阅函数。

除此之外，还有其它的操作符。如 `等于 when(condi)`、`区间 between(left, right)`。此外，observable还包含RxJS的所有可用操作符。

----------------------------------------

### SSD1306 OLED显示屏

适合市面上常见的以SSD1306为主控的小型OLED显示屏，分辨率在128*128以内。大于128*128分辨率的未测试，底层驱动使用的是`oled-ssd1306-i2c`npm包，它能驱动的都可以驱动。

```js
var ssd1306 = new Device({
    description: 'ssd1306',
    width: 128,
    height: 64,
    address: 0x3c,
    device: '/dev/i2c-1'
});
```

width、height分别表示分辨率的宽和高。address是i2c的从机地址，这个因硬件设备有所不同，大家自己了解清楚。device是i2c设备接在树莓派上的接口地址，这个也是因人而异。对于SPI接口的OLED，目前还没有集成驱动，后续会加上。

现在，我要如何控制屏幕显示的内容？

##### 1. 让显示屏显示内容，有3种方法，最简单的一种是直接显示一张PNG图片。

```js
ssd1306.drawPNG('path/to/image.png', false, function(error){
    if (error) {
        console.log(error);
    }else{
        console.log('显示PNG图片完成');
    }
});
```

注意，只能为PNG图片。为达到最理想的显示效果，PNG图片的分辨率最好和OLED屏幕的分辨率一致。OLED是只有单色的，不支持彩色，所以显示的时候图片会自动转换为单色图片，然后再显示。有色值的像素点在屏幕上会被点亮，透明的像素点会被熄灭。

##### 2. 图片是静态的，我想要由程序实时绘制屏幕该怎么办呢？这个也很简单，使用canvas就好了。

```js
var Canvas = require('canvas');

var canvas = new Canvas(128, 64);
var ctx = canvas.getContext('2d');

ctx.fillStyle = '#FFF';
ctx.fillText("Hello world", 0, 0);
// 上面5行代码应该不需要解释吧。都是canvas操作
// 结果就是在canvas上会在左上角显示一行白色的'hello world'文字

// 然后把canvas的内容显示到屏幕上
ssd1306.drawCanvas(canvas);
```

这时你应该能在屏幕上看到'hello world'文字了。drawCanvas函数会把canvas上的像素点一一对应到屏幕上绘制(当然也支持只绘制指定部分的canvas)。所以，你的canvas显示什么，屏幕就会显示什么。通过程序不断的更新canvas，然后在合适的时机调用drawCanvas函数刷新屏幕，你就可以控制屏幕了。

使用canvas的好处不需要我解释了，学习成本低，完善的API文档，大量的教程，和各种强大的canvas库。

需要注意的是，为了达到最理想的显示效果，canvas的分辨率最好和屏幕的分辨率一致，并且使用单色绘制canvas，建议用#FFF。因为无论如何，你的OLED都是单色的屏幕，无法显示彩色。虽然有彩色的OLED，但目前还没集成驱动。后续会集成更大尺寸的彩色LCD、TFT屏幕驱动。这是个巨大的工程，希望有懂这方面的软硬件工程师协助我。

> 在node中使用canvas需要先安装。API和在浏览器HTML5中的canvas稍微有点区别。请自行查阅资料安装并使用。

##### 3. 我不想安装node-canvas，同时又要程序实时绘制屏幕怎么办？也简单，使用内置的简易图形API绘制。

前面说了，这是基于`oled-ssd1306-i2c`封装的。它自身已经提供了一套简易的图形API用于操作屏幕。比如常见的绘制像素，直线，矩形，圆，文字等。使用这个的好处是不需要安装node-canvas，没有依赖。轻便、简单。怎么用？

它的所有API都挂载在驱动实例的`oled`属性上。例如:

```js
ssd1306.oled.drawLine(1, 1, 128, 64, 1);
```

上面使用自带的API绘制一条从(1, 1) 到 (128, 64) 的直线。oled属性就是`oled-ssd1306-i2c`的实例。更多API请自行查阅它的文档。

目前node驱动SSD1306屏幕有个缺点，就是刷新率太低，在我的树莓派3B上最高也就10帧。使用Python能达到30帧流畅。如果使用C++，则可以很容易达到60帧。我正在努力尝试提高它的刷新率。

#### SSD1306 API:

##### function: drawCanvas(canvas, config)

@params {Canvas} canvas: 要绘制的node-canvas。

@params {Object} config: 可选。配置要绘制的canvas的区域。默认从左上角开始绘制和屏幕一样大的区域。它有下列几个属性：
```js
{
    sx: 开始绘制的点的横坐标。
    sy: 开始绘制的点的纵坐标
    sw: 要绘制的矩形的宽度
    sh: 要绘制的矩形的高度
}
```

复制canvas的像素，一一对应到屏幕上并显示。通过ctx.getImageData函数获取canvas的像素信息。绘制前，会处理掉canvas的彩色像素。建议使用#FFF颜色进行绘制。有颜色的像素会被点亮，其余会被关闭。

##### function: drawPNG(filename, dither, callback)

@params {string} filename: 要绘制的PNG图片路径

@params {boolean} dither: 可选。是否启用抖动算法处理图片像素，默认为false。

@params {function} callback: 绘制图片完成时的回调。如果绘制错误，回调函数通过参数传递error。成功时为null。

在屏幕上绘制PNG图片。为达到最理想的显示效果，PNG图片最好是单色的，背景透明。通过`pngparse`npm包处理图片的像素信息。抖动算法使用的是`floyd-steinberg`npm包。



##### function: showSystemInfo(second)

@params {Number} second: 刷新屏幕的间隔时间，单位秒。如果不传，或传0，则只显示一次。否则会自动每隔几秒刷新一次。

显示系统信息，在屏幕上显示CPU、内存的统计信息，以及IP地址、时间。如果指定了一个时间，则会自动每隔几秒刷新。


##### function: stopSystemInfo()

停止刷新系统信息


-----------------------------------------
## 通用性设备API
-----------------------------------------

### UART串口设备

串口使用非常普遍，也非常简单。创建一个串口设备很容易。在树莓派上面使用串口最简单的方式就是某宝买一个USB转串口，例如常见的使用ch340芯片的STC下载器，只需要10块钱包邮，免驱，还自带3.3V和5V电源接口，非常方便。

```js
var stc89c52rc = new Device({
    description: 'stc89c52rc',
    interface: 'serial',
    address: '/dev/ttyUSB0',
    baudRate: 9600
});
```

上面是使用USB转串口和单片机的串口引脚相连，单片机设置好波特率，树莓派和单片机之间就可以互相传输数据。串口是基于`serialport`这个非常受欢迎的npm包封装的。串口设备的`serial`属性是`serialport`的实例，该属性下面有所有它的方法和属性。可自行查阅它的文档。

串口驱动实例有下面这些方法:

##### function: on(type, callback)

请参考XFS5152CE部分API文档

##### function: write(data, callback)

@params {buffer || array} data: 要发送的数据。可以是buffer或者是array，当然也可以是字符串，以二进制流发送。

@params {function} callback: 发送数据成功后的回调。如果发送错误，则通过参数传递error。

向串口设备发送数据。发送时以二进制流发送。

##### function: driver(name, driver)

@params {string} name: 驱动的名字

@params {function} driver: 实现驱动的方法

未通用设备注册自定义驱动。实际就是向实例中添加一个属性名为name的driver函数。这样实例便可以直接调用这个函数。只不过driver函数的运行时this指向该实例。例如xfs5152ce就是通过创建通用串口设备，然后注册驱动函数实现的。
```js
serial.driver('say', function(text, imed, cb){
    ......
}
```

-----------------------------------------

### I2C总线设备

I2C设备稍复杂点，因为它是一对多的。数据的读取和发送都是通过主机控制。树莓派自带I2C接口，所以不需要其它硬件就可以使用。很多模块也是使用i2c协议的，例如常见的AT24C02 CMOS EEPROM存储器就是使用I2C的典型。单片机教程中经常使用该例子进行I2C操作的学习。

```js
var i2c = new Device({
    description: 'test i2c',
    interface: 'i2c',
    address: 0x3c,
    device: '/dev/i2c-1'
});
```

注意i2c通用设备的address地址不是指i2c的物理接口地址，而是指的从机的逻辑地址。device才是指接口的物理接口地址。i2c驱动是基于`i2c`这个非常受欢迎的npm包封装的。实例的i2c属性就是`i2c`的实例，它拥有所有的方法和属性，可以自行查阅i2c的文档。SSD1306就是通过创建通用i2c设备，然后通过寄存器操作驱动屏幕。

i2c实例有以下方法:

##### function: driver(name, driver)

参考上面的driver文档。

因为i2c方法太多，这里就没有进行封装了，可以通过i2c属性访问各函数。

-----------------------------------------

### UDP网络设备

有些更高级的模块使用网络进行数据传输。例如ESP 8266 WiFi模块，可以将串口的数据通过WiFi以UDP或TCP协议发送出去。这个就好玩了，通过将8266和单片机串口相连，可以很容易的让单片机实现网络连接。让单片机去采集数据，通过网络发送给树莓派，或者树莓派发送控制命令，远程遥控单片机。8266模块使用UDP是最简单的方法。

```js
var esp = new Device({
    description: 'stc89c52rc-wifi',
    interface: 'udp',
    type: 'udp4',
    address: '127.0.0.1',
    port: 8266,
    remoteAddress: '192.168.1.80',
    remotePort: 8266,
    reuseAddr: false
});
```

使用udp需要配置在本地监听服务器的地址和端口，同时也要指定对方的IP地址和端口。一般给8266模块配置固定IP。

UDP驱动实例有以下方法:

##### function: on(type, callback)

@params {string} type: 事件类型。可以取值为: listening、close、error、message。

@params {function} callback: 事件发生时的回调。不同的事件类型有不同的参数。具体如下:
```text
@type: listening 当本地监听服务器启动后发生
    没有参数

@type: close 当本地监听服务器关闭后发生
    没有参数

@type: error 当监听服务器发生错误时发生
    callback(error)

@type: message 当服务器接受到数据时发生
    callback(data, remote, next)
    
    data是接收到的数据。buffer类型。
    remote是node dgram的内置对象。请参考node文档。
    next请参考上面xfs5152ce驱动的文档。
```

##### function: write(data, callback)

@params {buffer} data: 要发送的数据。

@params {function} callback(error): 发送数据成功或失败后的回调。

##### function: driver(name, driver)

参考上面的driver文档。

-------------------------------------------

还有很多不完善的地方，无论是API设计到代码组织，都需要好好思考。后续会增加更多驱动和完善通用性驱动的功能。大部分驱动都是以通用性设备作为基础，然后按照硬件要求的数据格式进行传输，达到让硬件工作的方式。所以有必要完善好通用性驱动的功能。

更友好的API文档也是后续要做的事。

总之，这只是开始。

大家用的开心就好，反正也是给我自己用的。


----------------------------------------------------

<h2 style="color: #2493fb;">change log</h2>

> v0.0.3 @ 2018-06-02 22:56

 - 使用RxJS，更抽象更简单易用的API

> v0.0.2 @ 2018-04-22 17:19

 - SSD1306新增showSystemInfo函数，用于监控系统信息。
 - 直接调用showSystemInfo即可在屏幕上面显示内存、CPU统计信息、IP、时间。
 - stopSystemInfo函数用于停止刷新系统监控信息。
 - 增加GPIO引脚参考图，用于查阅树莓派引脚编号和功能。

> v0.0.1 @ 2018-01-01 23:27

 - 增加讯飞XFS5152CE文字转语音芯片的驱动
 - 增加SSD1306 OLED屏幕的驱动。
 - 支持在SSD1306屏幕上直接绘制canvas，更友好的图形API(我正在尽量提高刷新率)
 - 包含UART串口、I2C、UDP驱动
 - 包含DHT-11、DHT-22温度湿度传感器驱动