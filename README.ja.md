# アズールプロミリア 観測シミュレーター

[한국어](README.md) · [English](README.en.md) · **日本語** · [简体中文](README.zh-Hans.md) · [繁體中文](README.zh-Hant.md)

配信する静的ファイルは `public/` にあります。ビルドやバックエンドは不要です。観測回数、獲得履歴、選択報酬はブラウザーに保存されます。

## ローカルでの確認

Windows PowerShell でリポジトリのフォルダーを開き、以下を実行します。Node.js と Python のインストールは不要です。

~~~powershell
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\preview.ps1
~~~

[http://127.0.0.1:8789/](http://127.0.0.1:8789/) を開きます。停止するには、サーバーを起動したウィンドウで Ctrl+C を押します。ポート 8789 が使用中の場合は、コマンドの末尾に `-Port 8790` を追加して [http://127.0.0.1:8790/](http://127.0.0.1:8790/) を開きます。

## Cloudflare へのデプロイ

公開サイト [azupro.yohane-aqours.com](https://azupro.yohane-aqours.com) は Cloudflare Worker の `azupro` で配信されています。[GitHub リポジトリ](https://github.com/MaratangNearl/azupro_gacha_simulator) の `main` ブランチにプッシュすると、Workers Builds が自動でデプロイします。

| Workers Builds の設定 | 値 |
| --- | --- |
| 本番ブランチ | `main` |
| ビルドコマンド | 空欄 |
| デプロイコマンド | `npx wrangler deploy` |
| ルートディレクトリ | リポジトリのルート |

[Wrangler の設定](wrangler.jsonc) で静的ファイルの配信先とカスタムドメインを指定しています。[Cloudflare Workers Builds ドキュメント](https://developers.cloudflare.com/workers/ci-cd/builds/)

## シミュレーターの仕様

- 星弦の観測では限定キャラクター同士、絆心の観測では限定アニマ同士で累計観測回数と天井までのカウントを共有します。★5 が出た場合、選択中のピックアップ対象を獲得します。
- 恒常観測の★5キャラクター選択報酬は累計50回で初めて獲得でき、その後は250回、450回と200回ごとに獲得できます。
- 始源の観測の恒常★5プールにはペイペイが含まれず、累計30回で終了します。29回目まで★5が出なければ30回目で確定します。
- 1回観測と10回観測の両方を数えます。★4以上が9回連続で出なかった場合、次の1回で★4以上が確定します。シミュレーターでは★4の基本確率を6%とし、キャラクターがランダムに出る場合、同じレアリティ内で確率は均等です。
- 恒序観測の結果はレアリティで表示します。★5の結果は指定した恒常アニマの獲得として扱います。
- ★5獲得履歴は観測ごとに、限定観測では選択中のバナーごとに表示します。受け取った選択報酬も恒常観測の履歴に加わります。観測を初期化すると、その観測の★5獲得履歴も消去されます。
- キャラクター観測では、★4キャラクターごとの獲得数も記録します。旧版の記録からは、観測ごとに最後に保存された結果を復元します。

## 画像

バナーと限定アニマの画像は提供されたバナーから切り出しています。キャラクターの顔画像は [AzurPromilia.org キャラクターアーカイブ](https://azurpromilia.org/en) から使用しています。

## 言語と名称

初回アクセス時はブラウザーの言語設定から対応言語を優先順に選びます。対応する言語がない場合は英語で表示します。メニューで選んだ言語は、同じブラウザーで次回も使われます。

日本語には Noto Sans JP、簡体字中国語には Noto Sans SC、繁体字中国語には Noto Sans TC を使用しています。画面で使う文字に絞った可変ウェブフォントをサイトから配信します。[SIL Open Font License](public/assets/fonts/noto-sans-ofl.txt)

- 韓国語のキャラクター名とレアリティは、提供された [★5 一覧](https://arca.live/b/azurpromilia/189870943) と [★4 一覧](https://arca.live/b/azurpromilia/189868077) に従います。
- 日本語と簡体字中国語の観測名は各地域の公式リリース前発表に従います。キャラクター名は公式紹介とテスト版の資料を照合しています。[日本の公式番組](https://www.youtube.com/live/W9lqk5hI2VI) · [日本のキャラクター紹介](https://x.com/AzurPromilia_JP) · [中国の公式案内](https://www.taptap.cn/moment/872553435289881404) · [中国テスト版のキャラクター資料](https://ap-cbt3.csxylic.com/hero/)
- 繁体字中国語では現地で公開された名称を優先し、一部の名称は中国版の表記を繁体字にして使用します。[繁体字版公式サイト](https://azurpromilia.jimi-global.com/) · [繁体字版のキャラクター紹介](https://www.youtube.com/@AzurPromiliaTC)
- 英語では、正式な観測名が確認できるまで観測の種類を表す名称を使用します。キャラクター名は公式紹介を優先し、未公開のものはコミュニティ資料の表記を使用します。[東南アジア公式英語サイト](https://azurpromilia.playpark.com/en/) · [英語公式アカウント](https://x.com/AzurPromilia_EN) · [キャラクターアーカイブ](https://azurpromilia.org/en)
