# Device.js

--------------

![](https://img.shields.io/badge/version-0.0.1-brightgreen.svg)

用NodeJS驱动硬件。

## 必看

```text
该软件在树莓派3B (Raspbian GNU/Linux 8.0 jessie)上面开发、测试
最新文档和代码请查看https://github.com/LanFly/Device
在除树莓派之外的平台通过npm安装此软件包可能会安装失败
该软件依赖很多第三方软件，并修改了其中的代码，感谢各位大佬的开源
因个人时间有限，且硬件种类繁多，代码中可能有尚未测试到的bug，可以通过下面的联系方式反馈给我并寻求帮助
我会持续集成其它种类的驱动，如有硬件没驱动的同学，可以反馈给我
```

> 报告bug:

 - QQ交流群: 230948257
 - email: [bluescode@outlook.com](mailto:bluescode@outlook.com)
 - issue: [https://github.com/LanFly/Device/issues](https://github.com/LanFly/Device/issues)

> 后续主要更新:

 - 增加更多型号硬件驱动
 - 更容易阅读的文档

> 更新记录:

 v0.0.1:

  - 增加讯飞XFS5152CE文字转语音芯片的驱动
  - 增加SSD1306 OLED屏幕的驱动。
  - 支持在SSD1306屏幕上直接绘制canvas，更友好的图形API(我正在尽量提高刷新率)
  - 包含UART串口、I2C、UDP驱动
  - 包含DHT-11、DHT-22温度湿度传感器驱动

test文件夹下面有测试例子