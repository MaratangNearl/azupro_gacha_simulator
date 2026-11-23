# 藍色星原：旅謠 觀測模擬器

[한국어](README.md) · [English](README.en.md) · [日本語](README.ja.md) · [简体中文](README.zh-Hans.md) · **繁體中文**

網站從 `public/` 目錄提供靜態檔案，直接在瀏覽器中執行，無須建置或後端服務。觀測次數、獲得紀錄和自選獎勵都儲存在瀏覽器中。

## 本機預覽

在 Windows PowerShell 中切換到儲存庫資料夾，執行以下指令。無須安裝 Node.js 或 Python。

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\preview.ps1
~~~

開啟 [http://127.0.0.1:8789/](http://127.0.0.1:8789/)。在啟動伺服器的視窗按 Ctrl+C 即可停止預覽。若連接埠 8789 已被占用，請在指令末尾加上 `-Port 8790`，再開啟 [http://127.0.0.1:8790/](http://127.0.0.1:8790/)。

## Cloudflare 部署

正式網站 [azupro.yohane-aqours.com](https://azupro.yohane-aqours.com) 由 Cloudflare Worker `azupro` 提供。推送到 [GitHub 儲存庫](https://github.com/MaratangNearl/azupro_gacha_simulator) 的 `main` 分支後，Workers Builds 會自動部署。

| Workers Builds 設定 | 值 |
| --- | --- |
| 正式環境分支 | `main` |
| 建置指令 | 留空 |
| 部署指令 | `npx wrangler deploy` |
| 根目錄 | 儲存庫根目錄 |

[Wrangler 設定檔](wrangler.jsonc)指定了靜態資源目錄和自訂網域。[Cloudflare Workers Builds 文件](https://developers.cloudflare.com/workers/ci-cd/builds/)

## 模擬規則

- 弦定觀測的各限定角色卡池共用累計觀測次數與保底進度。羈點觀測的各限定靈子卡池也各自共用同類進度。獲得五星時，必為已選卡池的限定角色或靈子。
- 恆常觀測累計50次後首次開放常駐五星角色自選獎勵，此後每增加200次再開放一次，例如累計250次、450次。
- 始源觀測的常駐五星角色池不含佩佩，累計30次後關閉。若前29次未獲得五星，第30次必定獲得一名五星角色。
- 單抽和十連都計入保底。連續9次未獲得四星以上時，下一次必得四星以上。模擬器將四星基礎機率設為6%。同稀有度角色隨機出現時，各角色的機率相同。
- 恆序觀測結果按稀有度顯示。五星結果視為獲得指定的常駐五星靈子。
- 五星獲得紀錄依觀測類型統計，限定觀測依所選卡池顯示。恆常觀測已領取的自選角色會計入獲得紀錄。重設觀測會清除該觀測的五星獲得紀錄。
- 角色觀測也會記錄每名四星角色的獲得次數。舊版紀錄會從各觀測最近儲存的結果還原。

## 圖片

卡池和限定靈子圖片裁自提供的卡池圖。角色頭像來自 [AzurPromilia.org 角色資料庫](https://azurpromilia.org/en)。

## 語言和名稱

首次造訪時，模擬器會依照瀏覽器設定的語言順序選擇支援的語言。若沒有相符項目，則顯示英文。從選單選擇的語言會儲存在同一個瀏覽器中。

日文使用 Noto Sans JP，簡體中文使用 Noto Sans SC，繁體中文使用 Noto Sans TC。網站直接提供依介面用字精簡的可變網頁字型。[SIL 開放字型授權](public/assets/fonts/noto-sans-ofl.txt)

- 韓文角色名稱與稀有度依照提供的[五星名單](https://arca.live/b/azurpromilia/189870943)與[四星名單](https://arca.live/b/azurpromilia/189868077)。
- 日文與簡體中文觀測名稱依照各地區上市前的官方公告，角色名稱參考官方介紹與測試版資料。[日文官方直播](https://www.youtube.com/live/W9lqk5hI2VI) · [日文角色介紹](https://x.com/AzurPromilia_JP) · [中國大陸官方公告](https://www.taptap.cn/moment/872553435289881404) · [中國大陸測試版角色資料](https://ap-cbt3.csxylic.com/hero/)
- 繁體中文優先採用當地已公布的名稱，部分名稱採用簡體中文原名的繁體寫法。[繁體中文官方網站](https://azurpromilia.jimi-global.com/) · [繁體中文角色介紹頻道](https://www.youtube.com/@AzurPromiliaTC)
- 在確認官方英文觀測名稱前，英文介面以描述觀測類型的名稱顯示。角色名稱優先採用官方英文介紹，未公布的名稱參考社群資料。[東南亞英文官方網站](https://azurpromilia.playpark.com/en/) · [英文官方帳號](https://x.com/AzurPromilia_EN) · [社群角色資料庫](https://azurpromilia.org/en)
