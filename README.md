# 파일 이름 변경기

브라우저에서 여러 파일을 선택한 뒤 `기준이름1.ext`, `기준이름2.ext`처럼 순번이 붙은 이름으로 다시 다운로드하는 Next.js 웹앱입니다. 파일은 서버로 업로드되지 않으며, 사용자의 브라우저 메모리 안에서만 처리됩니다.

## 주요 기능

- 드래그 앤 드롭 또는 파일 선택창으로 여러 파일 추가
- 기준 이름 입력 시 새 파일명 실시간 미리보기
- 원본 파일 확장자 유지
- 개별 파일 제거 및 전체 삭제
- 선택된 파일 수와 전체 용량 표시
- 브라우저의 `Blob URL`과 `download` 속성을 이용한 로컬 다운로드

## 실행 방법

```bash
npm install
npm run dev
```

개발 서버가 실행되면 브라우저에서 `http://localhost:3000`을 열면 됩니다.
이미 3000번 포트가 사용 중이면 Next.js가 자동으로 다른 포트로 실행합니다.

## 빌드

```bash
npm run build
npm run start
```

## 프로젝트 구조

```text
.
├── app
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── file-renamer.jsx
├── next.config.mjs
├── package.json
├── package-lock.json
├── README.md
└── research.md
```

`file-renamer.jsx`는 원본 구현 파일로 유지했습니다. 실제 Next.js 앱의 화면과 로직은 `app/page.jsx`와 `app/globals.css`에 구성되어 있습니다.

## 기술 스택

- Next.js 16.2.4
- React 19.2.5
- App Router
- Client Component
- HTML File API
- Blob URL API
