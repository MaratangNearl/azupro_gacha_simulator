# Azur Promilia Observation Simulator

[한국어](README.md) · **English** · [日本語](README.ja.md) · [简体中文](README.zh-Hans.md) · [繁體中文](README.zh-Hant.md)

The site serves static files from `public/` and runs in the browser without a build step or backend. Pull totals, acquisition history, and selector rewards are stored in the browser.

## Local preview

Open Windows PowerShell in the repository and run the following command. Node.js and Python are optional.

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\preview.ps1
~~~

Open [http://127.0.0.1:8789/](http://127.0.0.1:8789/). Press Ctrl+C in the server window to stop it. If port 8789 is in use, append `-Port 8790` and open [http://127.0.0.1:8790/](http://127.0.0.1:8790/).

## Cloudflare deployment

The production site [azupro.yohane-aqours.com](https://azupro.yohane-aqours.com) runs on Cloudflare Worker `azupro`. Workers Builds automatically deploys pushes to the [GitHub repository](https://github.com/MaratangNearl/azupro_gacha_simulator)'s `main` branch.

| Workers Builds setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | Leave blank |
| Deploy command | `npx wrangler deploy` |
| Root directory | Repository root |

The [Wrangler configuration](wrangler.jsonc) specifies the static assets directory and custom domain. [Cloudflare Workers Builds documentation](https://developers.cloudflare.com/workers/ci-cd/builds/)

## Simulator rules

- Limited character banners share a pull total and pity counter with one another. The same applies to limited Anima banners. A 5-star pull always gives the active banner's featured character or Anima.
- Standard Character Observation grants a 5-star selector after 50 total pulls, then every 200 additional pulls at 250, 450, and so on.
- Beginner Observation excludes Peipei from its standard 5-star pool and closes after 30 pulls. If the first 29 pulls yield no 5-star, the 30th is guaranteed to give one.
- Single pulls and ten-pulls both count toward the guarantee. After nine consecutive pulls without a 4-star or higher, the next pull guarantees one. The simulator assumes a 6% base 4-star rate. Random characters of the same rarity have equal rates.
- Standard Anima results show rarity. A 5-star result represents the standard Anima you chose as your target.
- The 5-star collection reflects the active observation. Limited observations show the active banner's record. Claimed selectors count toward Standard Character Observation. Resetting an observation clears its 5-star acquisition history.
- Character observations also record each 4-star character's copies. Older 4-star counts are recovered from the latest saved results.

## Images

Banner and limited Anima art is cropped from the supplied images. Character portraits come from the [AzurPromilia.org character archive](https://azurpromilia.org/en).

## Language and terminology

On the first visit the simulator uses the first supported language in your browser preferences, with English as the fallback. A language selected from the menu is saved for future visits in that browser.

Japanese uses Noto Sans JP, Simplified Chinese uses Noto Sans SC, and Traditional Chinese uses Noto Sans TC. The site serves variable web fonts subset to the text used in the interface. [SIL Open Font License](public/assets/fonts/noto-sans-ofl.txt)

- Korean names and rarities follow the supplied [5-star list](https://arca.live/b/azurpromilia/189870943) and [4-star list](https://arca.live/b/azurpromilia/189868077).
- Japanese and Simplified Chinese observation names follow the official pre-launch announcements. Character names use official profiles and beta materials. [Japanese stream](https://www.youtube.com/live/W9lqk5hI2VI) · [Japanese character profiles](https://x.com/AzurPromilia_JP) · [Chinese announcement](https://www.taptap.cn/moment/872553435289881404) · [Chinese beta roster](https://ap-cbt3.csxylic.com/hero/)
- Traditional Chinese uses local published names where available. Other terms use traditional forms of the mainland names. [Traditional Chinese official site](https://azurpromilia.jimi-global.com/) · [Traditional Chinese character channel](https://www.youtube.com/@AzurPromiliaTC)
- English observation labels describe the banner types pending official English names. Character names use official English introductions where available and community spellings for other characters. [Official Southeast Asia site](https://azurpromilia.playpark.com/en/) · [Official English account](https://x.com/AzurPromilia_EN) · [Community character archive](https://azurpromilia.org/en)
