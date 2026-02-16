# Our Space - 설치 및 설정 가이드 💕

진혁님과 윤서님을 위한 장거리 연애 웹사이트 설정 방법입니다.

---

## 📋 목차

1. [구글 시트 만들기](#1-구글-시트-만들기)
2. [Google Apps Script 설정](#2-google-apps-script-설정)
3. [웹 앱 배포](#3-웹-앱-배포)
4. [웹사이트 설정](#4-웹사이트-설정)
5. [GitHub Pages에 업로드](#5-github-pages에-업로드)
6. [완료 및 테스트](#6-완료-및-테스트)

---

## 1. 구글 시트 만들기

### 1-1. 새 스프레드시트 생성
1. https://sheets.google.com 접속
2. `빈 스프레드시트` 클릭
3. 제목을 `Our Space Database` 로 변경

### 1-2. 스프레드시트 ID 복사
- URL에서 ID 부분 복사하기
- 예: `https://docs.google.com/spreadsheets/d/[이부분이_스프레드시트_ID]/edit`
- 메모장에 복사해두세요!

---

## 2. Google Apps Script 설정

### 2-1. Apps Script 열기
1. 구글 시트에서 `확장 프로그램` → `Apps Script` 클릭
2. 기본 코드를 모두 삭제

### 2-2. 코드 붙여넣기
1. 제공된 `google-apps-script.gs` 파일의 코드를 **전체 복사**
2. Apps Script 에디터에 붙여넣기

### 2-3. 스프레드시트 ID 입력
```javascript
// 2번째 줄의 YOUR_SPREADSHEET_ID_HERE 를 복사한 ID로 변경
const SPREADSHEET_ID = '1AbC2DeF3GhI4JkL5MnO6PqR7StU8VwX9YzA';
```

### 2-4. 저장
- 프로젝트 이름: `Our Space Backend`
- `Ctrl+S` 또는 디스크 아이콘 클릭하여 저장

---

## 3. 웹 앱 배포

### 3-1. 배포 시작
1. 오른쪽 위 `배포` 버튼 클릭
2. `새 배포` 선택

### 3-2. 배포 설정
- **유형**: `웹 앱` 선택
- **설명**: `Our Space v1` (버전 설명)
- **다음 계정으로 실행**: `나` 선택
- **액세스 권한**: `누구나` 선택 ⚠️ 중요!
  
### 3-3. 배포 승인
1. `배포` 버튼 클릭
2. 권한 부여 필요 → `액세스 권한 부여` 클릭
3. 본인의 구글 계정 선택
4. `고급` → `Our Space Backend(안전하지 않음)으로 이동` 클릭
5. `허용` 클릭

### 3-4. 웹 앱 URL 복사
- **배포된 웹 앱 URL**이 나타남
- 예: `https://script.google.com/macros/s/AKfyc...생략.../exec`
- 이 URL을 **메모장에 복사**해두세요! 🔥 매우 중요!

---

## 4. 웹사이트 설정

### 4-1. script.js 파일 수정

`script.js` 파일의 **3번 줄**을 찾아서 수정합니다:

```javascript
const CONFIG = {
    // 방금 복사한 웹 앱 URL을 여기에 붙여넣기
    GOOGLE_SCRIPT_URL: 'https://script.google.com/macros/s/AKfyc...여기에_붙여넣기.../exec',
    
    // 만난 날짜 (YYYY-MM-DD 형식)
    START_DATE: '2024-01-01',  // 진혁님과 윤서님이 만난 날로 변경
    
    // 다음 만남 날짜
    NEXT_MEET_DATE: '2025-03-01',  // 다음에 만날 날로 변경
};
```

### 4-2. 날짜 입력 예시
```javascript
START_DATE: '2023-06-15',      // 2023년 6월 15일
NEXT_MEET_DATE: '2025-02-20',  // 2025년 2월 20일
```

---

## 5. GitHub Pages에 업로드

### 5-1. GitHub 계정 준비
- https://github.com 에서 계정이 없다면 가입

### 5-2. 새 저장소 만들기
1. GitHub에서 `New repository` 클릭
2. **Repository name**: `our-space` (원하는 이름)
3. **Public** 선택
4. `Create repository` 클릭

### 5-3. 파일 업로드
1. `uploading an existing file` 클릭
2. 다음 3개 파일을 **드래그 앤 드롭**:
   - `index.html`
   - `script.js`
   - `README.md` (선택사항)
3. 하단에 커밋 메시지: `Initial commit`
4. `Commit changes` 클릭

### 5-4. GitHub Pages 활성화
1. 저장소에서 `Settings` 탭 클릭
2. 왼쪽 메뉴에서 `Pages` 클릭
3. **Source**: `Deploy from a branch`
4. **Branch**: `main` 선택, 폴더는 `/ (root)`
5. `Save` 클릭

### 5-5. 웹사이트 주소 확인
- 몇 분 후 페이지 새로고침
- 상단에 표시: `Your site is live at https://[username].github.io/our-space/`
- 이 주소가 진혁님과 윤서님의 비밀 공간 주소입니다! 🎉

---

## 6. 완료 및 테스트

### 6-1. 웹사이트 접속
- GitHub Pages 주소로 접속
- 서울/런던 시계가 작동하는지 확인

### 6-2. 편지 쓰기 테스트
1. 우측 하단의 **✎** 버튼 클릭
2. 보내는 사람: `진혁` 선택
3. 받는 사람: `윤서` (자동 선택됨)
4. 내용 입력 후 `보내기`
5. 잠시 후 페이지 새로고침하면 편지가 나타남

### 6-3. 추억 추가 테스트
1. `추억` 탭 클릭
2. 추억 섹션을 **더블클릭**
3. 날짜와 내용 입력 후 저장
4. 페이지 새로고침하면 타임라인에 나타남

---

## 🎨 추가 커스터마이징 (선택사항)

### 배경색 변경
`index.html`의 CSS에서 색상 코드 변경:

```css
:root {
    --primary-bg: #faf8f6;        /* 메인 배경색 */
    --accent-pink: #e8c4c4;       /* 강조 핑크 */
    --accent-lavender: #d4c5e2;   /* 강조 라벤더 */
}
```

### 폰트 변경
Google Fonts에서 원하는 폰트를 선택하여 변경 가능

---

## 🔧 문제 해결

### Q1: 편지가 저장되지 않아요
**A**: Google Apps Script 배포 시 "누구나" 권한으로 설정했는지 확인하세요.

### Q2: 시계가 작동하지 않아요
**A**: 브라우저의 JavaScript가 활성화되어 있는지 확인하세요.

### Q3: GitHub Pages 주소가 작동하지 않아요
**A**: 배포 후 5-10분 정도 기다려주세요. 그래도 안되면 파일명이 `index.html`이 맞는지 확인하세요.

### Q4: 구글 시트에 데이터가 안 보여요
**A**: Apps Script의 `testAddLetter()` 함수를 실행해서 테스트해보세요.

---

## 📱 모바일에서 사용하기

1. 모바일 브라우저에서 GitHub Pages 주소 접속
2. 홈 화면에 추가 (iOS: 공유 → 홈 화면에 추가)
3. 앱처럼 사용 가능! 📲

---

## 💝 팁

- **편지는 자주**: 하루에 한 번씩 짧은 편지라도 남겨보세요
- **추억 기록**: 특별한 날이 아니어도 소소한 일상을 기록하세요
- **함께 커스터마이징**: 두 분만의 색깔로 사이트를 꾸며보세요
- **백업**: 가끔 구글 시트를 Excel로 다운로드해서 백업하세요

---

## 🆘 추가 도움이 필요하신가요?

설정 중 문제가 생기면:
1. 구글에서 검색: "Google Apps Script 배포 오류"
2. GitHub Pages 공식 문서 참조
3. 각 단계의 스크린샷을 찍어서 확인

---

진혁님과 윤서님의 사랑이 가득한 공간이 되길 바랍니다! 💕
멀리 떨어져 있어도 마음은 항상 함께하시길! ✨