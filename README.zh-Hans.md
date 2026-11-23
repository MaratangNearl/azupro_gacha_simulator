# 蓝色星原：旅谣 观测模拟器

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · **简体中文** · [繁體中文](README.zh-Hant.md)

网站从 `public/` 目录提供静态文件，在浏览器中运行，无需构建或后端。观测次数、获取记录和自选奖励均保存在浏览器中。

## 本地预览

在 Windows PowerShell 中进入仓库目录，然后运行以下命令。无需安装 Node.js 或 Python。

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\preview.ps1
~~~

打开 [http://127.0.0.1:8789/](http://127.0.0.1:8789/)。如需停止预览，请在启动服务器的窗口中按 Ctrl+C。如果端口 8789 已被占用，在命令末尾加上 `-Port 8790`，然后打开 [http://127.0.0.1:8790/](http://127.0.0.1:8790/)。

## Cloudflare 部署

正式站点 [azupro.yohane-aqours.com](https://azupro.yohane-aqours.com) 由 Cloudflare Worker `azupro` 提供。向 [GitHub 仓库](https://github.com/MaratangNearl/azupro_gacha_simulator) 的 `main` 分支推送后，Workers Builds 会自动部署。

| Workers Builds 设置 | 值 |
| --- | --- |
| 生产分支 | `main` |
| 构建命令 | 留空 |
| 部署命令 | `npx wrangler deploy` |
| 根目录 | 仓库根目录 |

[Wrangler 配置](wrangler.jsonc)指定了静态资源目录和自定义域名。[Cloudflare Workers Builds 文档](https://developers.cloudflare.com/workers/ci-cd/builds/)

## 模拟规则

- 弦定观测的各限定角色卡池共享累计观测次数和保底进度。羁点观测的各限定灵子卡池也各自共享同类进度。获得五星时，必为已选卡池的限定角色或灵子。
- 恒常观测累计50次后首次开放常驻五星角色自选奖励，此后每增加200次再开放一次，例如累计250次、450次。
- 始源观测的常驻五星角色池不含佩佩，累计30次后关闭。若前29次未获得五星，第30次必出一名五星角色。
- 单抽和十连均计入保底。连续9次未获得四星或以上时，下一次必得四星或以上。模拟器将四星基础概率设为6%。同稀有度角色随机出现时，各角色概率相同。
- 恒序观测结果按稀有度显示。五星结果视为获得指定的常驻五星灵子。
- 五星获取记录按观测类型统计，限定观测按所选卡池显示。恒常观测已领取的自选角色计入获取记录。重置观测将清除该观测的五星获取记录。
- 角色观测也统计每名四星角色的获取次数。旧版记录会从各观测最近保存的结果中恢复。

## 图片

卡池和限定灵子图片裁自提供的卡池图。角色头像来自 [AzurPromilia.org 角色资料库](https://azurpromilia.org/en)。

## 语言和名称

首次访问时，模拟器按浏览器的语言优先顺序选择受支持的语言。若没有匹配项，则显示英文。从菜单选择的语言将保存在同一浏览器中。

日语使用 Noto Sans JP，简体中文使用 Noto Sans SC，繁体中文使用 Noto Sans TC。网站直接提供按界面用字精简的可变网页字体。[SIL 开源字体许可证](public/assets/fonts/noto-sans-ofl.txt)

- 韩语角色名和稀有度依据提供的[五星名单](https://arca.live/b/azurpromilia/189870943)和[四星名单](https://arca.live/b/azurpromilia/189868077)。
- 日语和简体中文的观测名称依据各地区上线前的官方公告，角色名称参考官方介绍和测试资料。[日语官方直播](https://www.youtube.com/live/W9lqk5hI2VI) · [日语角色介绍](https://x.com/AzurPromilia_JP) · [中国大陆官方公告](https://www.taptap.cn/moment/872553435289881404) · [中国大陆测试版角色资料](https://ap-cbt3.csxylic.com/hero/)
- 繁体中文优先使用当地已公布的名称，部分名称采用简体中文原名的繁体写法。[繁体中文官网](https://azurpromilia.jimi-global.com/) · [繁体中文角色介绍频道](https://www.youtube.com/@AzurPromiliaTC)
- 官方英文观测名称确认前，英文界面使用描述观测类型的名称。角色名优先采用官方英文介绍，未公布的角色名参考社区资料。[东南亚英文官网](https://azurpromilia.playpark.com/en/) · [英文官方账号](https://x.com/AzurPromilia_EN) · [社区角色资料库](https://azurpromilia.org/en)
