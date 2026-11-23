# 아주르 프로밀리아 관측 시뮬레이터

배포 디렉터리는 `public/`입니다. 빌드 단계나 백엔드 없이 브라우저에서 동작하며, 관측 횟수와 5성 획득 기록, 선택 보상은 해당 브라우저에 저장됩니다.

## 로컬 테스트

Windows PowerShell에서 작업 폴더로 이동한 후 실행합니다. Node.js나 Python 설치가 필요 없습니다.

```powershell
Set-Location 'E:\works\azupro'
powershell.exe -NoProfile -ExecutionPolicy RemoteSigned -File .\preview.ps1
```

[http://127.0.0.1:8789/](http://127.0.0.1:8789/)을 열고, 종료할 때는 서버를 실행한 창에서 `Ctrl+C`를 누릅니다. 8789번 포트를 사용 중이면 실행 명령 끝에 `-Port 8790`을 붙이고 [http://127.0.0.1:8790/](http://127.0.0.1:8790/)을 엽니다.

## Cloudflare 배포

### GitHub 연동 자동 배포

1. GitHub에서 `azupro_gacha_simulator` 공개 저장소를 만들고 로컬 `main` 브랜치를 푸시합니다. 새 저장소를 만들 때 README 초기화 옵션을 해제하면 로컬 커밋을 바로 푸시할 수 있습니다.
2. Cloudflare의 **Workers & Pages**에서 **Create application → Pages → Import an existing Git repository**를 선택한 뒤 `azupro_gacha_simulator`를 연결합니다. GitHub에서 Cloudflare 앱의 접근 범위를 선택할 때는 이 저장소를 지정합니다.
3. 다음 값으로 첫 배포를 시작합니다. 이후 `main`에 푸시할 때마다 Pages가 자동으로 배포합니다.

| 설정 | 값 |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `exit 0` |
| Build output directory | `public` |
| Root directory | 기본값 |

[Cloudflare Pages 정적 HTML 가이드](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/) · [GitHub 저장소 연동 가이드](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)

### 직접 배포

| 대상 | 배포 방법 |
| --- | --- |
| Cloudflare Pages | 직접 업로드로 생성한 Pages 프로젝트에 `public/`을 업로드하거나 `npx wrangler pages deploy public --project-name <Pages 프로젝트 이름>`을 실행합니다. |
| Cloudflare Workers | `npx wrangler deploy --config wrangler.worker.jsonc`를 실행합니다. 설정 파일에서 Worker 이름을 바꿀 수 있습니다. |

[Pages 직접 업로드 문서](https://developers.cloudflare.com/pages/get-started/direct-upload/) · [Workers 정적 자산 문서](https://developers.cloudflare.com/workers/static-assets/)

## 시뮬레이션 규칙

- 운명과 인연 관측은 각각 같은 종류의 한정 배너끼리 누적 관측과 천장 진행도를 공유합니다. 5성은 선택한 배너의 캐릭터 또는 무기로 확정됩니다.
- 질서 관측의 상시 5성 선택 보상은 누적 50회, 250회, 450회부터 200회 간격으로 지급됩니다.
- 도약 관측은 페페를 제외한 상시 5성 캐릭터를 대상으로 하며 누적 30회에서 종료됩니다. 이전 29회에 5성이 나오지 않았다면 30회째 확정입니다.
- 1회와 10회 관측을 합산해 연속 9회 동안 4성 이상 미획득 시 다음 회차에서 4성 이상을 보장합니다. 4성 기본 확률은 시뮬레이터 가정값인 6%입니다. 4성과 상시 5성이 무작위로 나올 때는 해당 등급의 캐릭터마다 같은 확률을 적용합니다.
- 영원 관측의 결과는 등급별로 표시합니다. 5성 무기 결과는 지정한 상시 무기를 획득한 것으로 취급합니다.
- 5성 누적 획득은 현재 관측의 기록만 표시하며, 한정 관측은 선택한 배너별로 표시합니다. 질서 관측에서는 수령한 캐릭터 선택 보상도 같은 관측에 합산됩니다. 관측을 초기화하면 해당 종류의 5성 획득 기록도 초기화됩니다.

## 이미지

배너와 한정 무기 카드는 제공된 배너 이미지를 잘라 사용했습니다. 캐릭터 카드의 얼굴 이미지는 [AzurPromilia.org 캐릭터 아카이브](https://azurpromilia.org/en)의 이미지를 사용했습니다. 이름과 등급은 제공된 [5성 목록](https://arca.live/b/azurpromilia/189870943), [4성 목록](https://arca.live/b/azurpromilia/189868077)을 따릅니다.
