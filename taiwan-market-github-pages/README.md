# 대만 시장 테마맵

2026-10-20 종가 기준 상승 측 34개 / 하락 측 30개 종목을 탐색하는 GitHub Pages용 정적 웹페이지입니다.

## 가장 간단한 게시 방법 — 브라우저 업로드

1. GitHub에서 새 저장소를 만듭니다. 예: `taiwan-market-map`. GitHub Free라면 Public을 선택합니다.
2. ZIP을 풀고, 이 README와 같은 위치의 **docs 폴더**를 저장소에 업로드합니다. 저장소 안에 `docs/index.html`이 생겨야 합니다. `taiwan-market-pages/docs`처럼 바깥 폴더까지 넣지 마세요.
3. 저장소의 **Settings → Pages → Build and deployment**로 이동합니다.
4. **Source: Deploy from a branch → Branch: main → /docs → Save**를 선택합니다.
5. Pages 화면에 표시된 주소를 엽니다. 보통 `https://사용자이름.github.io/저장소이름/` 형태입니다.

이 경로는 `.github` 폴더를 업로드하지 않아도 됩니다. 서버·API 키·패키지 설치가 필요하지 않습니다.

## GitHub Actions로 배포하고 싶다면

위 방식 대신 다음을 사용하세요. 두 방식을 동시에 설정할 필요는 없습니다.

1. `docs`, `.github`, `README.md`를 저장소 최상위에 올립니다. 숨김 폴더 `.github`도 포함해야 합니다.
2. **Settings → Pages → Source: GitHub Actions**를 선택합니다.
3. **Actions → Deploy Taiwan Market Pages → Run workflow**를 실행합니다. 설정 전 첫 실행이 실패했다면 설정 후 다시 실행합니다.
4. 이후 `main` 브랜치에 변경 사항을 올리면 자동으로 배포합니다. 다른 기본 브랜치를 쓰면 `.github/workflows/pages.yml`의 `branches`도 바꾸세요.

GitHub 공식 문서: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
워크플로 문서: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

## 로컬에서 보기

`docs/index.html`을 브라우저로 열면 됩니다. 데이터가 `assets/data.js`에 들어 있어 로컬 파일로도 탐색할 수 있습니다. 종목 CSV 다운로드 및 Excel 다운로드는 브라우저 설정에 따라 파일 접근 확인이 필요할 수 있습니다.

또는 Python이 있다면 저장소 폴더에서 `python -m http.server 8000 --directory docs` 실행 후 `http://localhost:8000`을 엽니다.

## 화면 구성

- 상승 측 / 하락 측 전환
- 테마 → 종목 트리와 종목별 뉴스·출처
- 검색, 상·하한가 기준만 보기, 세로형 표
- 등락률·거래량 정렬, 현재 결과 CSV 다운로드
- 상승·하락 전체 Excel 다운로드
- 모바일 화면 대응 및 키보드 조작

## 데이터 읽기

- 상한가/하한가: +9.5% 이상 / -9.5% 이하 근사 기준. 호가 단위별 실제 제한가격을 계산한 판정은 아닙니다.
- 해당 기준 종목은 거래량과 관계없이 포함합니다. 나머지 종목 중 거래량 1만 장(1천만 주) 이상을 등락률 상위·하위 각각 30개 선정합니다.
- 원본 규칙을 유지해 상승 측에도 보합·하락 종목이 포함될 수 있습니다.
- 600개 고정 종목 목록을 사용합니다. 전체 시장이나 매일 재산정한 시가총액 순위가 아닙니다.
- 관련 뉴스는 가격 변동의 유일한 원인이라는 뜻이 아닙니다. 개별 뉴스 / 업종 동반 / 뉴스 미확인을 구분합니다.
- 표시된 날짜의 저장 자료입니다. 자동 갱신되지 않습니다. 이후 자료를 반영하려면 새 데이터로 `docs/assets/data.js`와 다운로드 Excel을 교체하고 `index.html`의 다운로드 경로를 맞춰야 합니다.

## 파일 구조

```
docs/
  index.html
  .nojekyll
  assets/
    app.js
    data.js
    styles.css
    favicon.svg
  downloads/
    taiwan-market-2026-10-20.xlsx
.github/workflows/pages.yml
README.md
```

API 토큰, 원본 FinMind 스크립트, 계정 정보는 이 배포 묶음에 포함하지 않았습니다.
