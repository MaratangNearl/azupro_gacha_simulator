# 아주르 프로밀리아 관측 시뮬레이터

**한국어** · [English](README.en.md) · [日本語](README.ja.md) · [简体中文](README.zh-Hans.md) · [繁體中文](README.zh-Hant.md)

배포 디렉터리는 `public/`입니다. 빌드 단계나 백엔드 없이 브라우저에서 동작하며, 관측 횟수와 획득 기록, 선택 보상은 해당 브라우저에 저장됩니다.

## 로컬 테스트

Windows PowerShell에서 작업 폴더로 이동한 후 실행합니다. Node.js나 Python 설치가 필요 없습니다.

```powershell
Set-Location 'E:\works\azupro'
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\preview.ps1
```

[http://127.0.0.1:8789/](http://127.0.0.1:8789/)을 열고, 종료할 때는 서버를 실행한 창에서 `Ctrl+C`를 누릅니다. 8789번 포트를 사용 중이면 실행 명령 끝에 `-Port 8790`을 붙이고 [http://127.0.0.1:8790/](http://127.0.0.1:8790/)을 엽니다.

## Cloudflare 배포

Cloudflare Worker `azupro`의 프로덕션 사이트는 [azupro.yohane-aqours.com](https://azupro.yohane-aqours.com)입니다. [GitHub 저장소](https://github.com/MaratangNearl/azupro_gacha_simulator)의 `main`은 Workers Builds에 연결되어 있으며, 푸시할 때마다 자동으로 배포됩니다.

### Workers Builds 설정

| 설정 | 값 |
| --- | --- |
| Production branch | `main` |
| Build command | 비워둠 |
| Deploy command | `npx wrangler deploy` |
| Root directory | 저장소 루트 |

[Wrangler 설정](wrangler.jsonc)에서 정적 자산 폴더 `public/`과 기존 사용자 지정 도메인을 지정합니다. [Cloudflare Workers Builds 문서](https://developers.cloudflare.com/workers/ci-cd/builds/)

## 시뮬레이션 규칙

- 운명과 인연 관측은 각각 같은 종류의 한정 배너끼리 누적 관측과 천장 진행도를 공유합니다. 5성은 선택한 배너의 캐릭터 또는 무기로 확정됩니다.
- 질서 관측의 상시 5성 선택 보상은 누적 50회, 250회, 450회부터 200회 간격으로 지급됩니다.
- 도약 관측은 페페를 제외한 상시 5성 캐릭터를 대상으로 하며 누적 30회에서 종료됩니다. 이전 29회에 5성이 나오지 않았다면 30회째 확정입니다.
- 1회와 10회 관측을 합산해 연속 9회 동안 4성 이상 미획득 시 다음 회차에서 4성 이상을 보장합니다. 4성 기본 확률은 시뮬레이터 가정값인 6%입니다. 4성과 상시 5성이 무작위로 나올 때는 해당 등급의 캐릭터마다 같은 확률을 적용합니다.
- 영원 관측의 결과는 등급별로 표시합니다. 5성 무기 결과는 지정한 상시 무기를 획득한 것으로 취급합니다.
- 5성 누적 획득은 현재 관측의 기록만 표시하며, 한정 관측은 선택한 배너별로 표시합니다. 질서 관측에서는 수령한 캐릭터 선택 보상도 같은 관측에 합산됩니다. 관측을 초기화하면 해당 종류의 5성 획득 기록도 초기화됩니다.
- 캐릭터 관측에서는 4성 캐릭터별 누적 획득 횟수도 기록합니다. 기존 4성 기록은 관측별로 저장된 최근 결과에서 복원합니다.

## 이미지

배너와 한정 무기 카드는 제공된 배너 이미지를 잘라 사용했습니다. 캐릭터 카드의 얼굴 이미지는 [AzurPromilia.org 캐릭터 아카이브](https://azurpromilia.org/en)의 이미지를 사용했습니다.

## 언어와 명칭

첫 방문에는 브라우저의 언어 목록에서 지원하는 첫 언어를 선택합니다. 일치하는 언어가 없으면 영어로 표시합니다. 언어 메뉴에서 고른 값은 같은 브라우저의 다음 방문에도 적용됩니다.

일본어는 Noto Sans JP, 중국어 간체는 Noto Sans SC, 번체는 Noto Sans TC로 표시합니다. 화면에 쓰이는 글자만 담은 가변 웹폰트를 사이트에서 제공합니다. [SIL Open Font License](public/assets/fonts/noto-sans-ofl.txt)

- 한국어 캐릭터 이름과 등급은 제공된 [5성 목록](https://arca.live/b/azurpromilia/189870943), [4성 목록](https://arca.live/b/azurpromilia/189868077)을 따릅니다.
- 일본어와 중국어 간체 관측명은 각 지역의 출시 전 공식 발표를 따릅니다. 캐릭터는 공식 소개와 테스트판 표기를 대조했습니다. [일본 출시 직전 방송](https://www.youtube.com/live/W9lqk5hI2VI) · [일본 캐릭터 소개](https://x.com/AzurPromilia_JP) · [중국 출시 전 공식 안내](https://www.taptap.cn/moment/872553435289881404) · [중국 테스트판 캐릭터 자료](https://ap-cbt3.csxylic.com/hero/)
- 중국어 번체는 현지 공개 자료에서 확인할 수 있는 표기를 따릅니다. 현지에서 확인하지 못한 일부 명칭에는 중국판 원문의 번체 표기를 적용했습니다. [번체 공식 사이트](https://azurpromilia.jimi-global.com/) · [번체 캐릭터 소개 채널](https://www.youtube.com/@AzurPromiliaTC)
- 영어 관측명은 공식 영어판 이름을 확인할 때까지 관측 유형을 설명하는 문구로 표시합니다. 캐릭터 이름은 공식 영문 소개를 우선 적용하고, 공개되지 않은 이름에는 커뮤니티 자료의 표기를 사용합니다. [동남아 공식 영어 사이트](https://azurpromilia.playpark.com/en/) · [영어 공식 채널](https://x.com/AzurPromilia_EN) · [캐릭터 영문 이름 자료](https://azurpromilia.org/en)
