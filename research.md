# File Renamer Research

## 1. 원본 `file-renamer.jsx` 분석

원본 파일은 React 단일 컴포넌트입니다. 내부에 CSS 문자열을 두고 `<style>{styles}</style>`로 주입하며, `useState`, `useCallback`, `useRef`만 사용합니다.

핵심 상태는 다음과 같습니다.

- `files`: 사용자가 선택한 파일 목록입니다. 각 항목은 `File` 객체, 원본 이름, 임의 ID를 가집니다.
- `baseName`: 사용자가 입력한 기준 이름입니다.
- `dragging`: 드래그 앤 드롭 영역의 시각 상태입니다.
- `downloaded`: 다운로드 완료 안내를 표시하기 위한 상태입니다.
- `fileInputRef`: 숨겨진 `<input type="file">`을 클릭하기 위한 참조입니다.

원본 앱의 핵심 동작은 파일명 자체를 디스크에서 변경하는 것이 아닙니다. 브라우저는 보안상 사용자의 로컬 파일 시스템에 있는 기존 파일 이름을 직접 바꿀 수 없습니다. 대신 선택한 `File` 객체를 `URL.createObjectURL()`로 임시 URL에 연결하고, `<a download="새이름.ext">`를 클릭시켜 새 이름으로 다운로드하게 만듭니다.

## 2. Next.js 전환 방향

이 프로젝트는 파일 업로드 서버가 필요하지 않으므로 Next.js의 App Router 안에서 클라이언트 컴포넌트로 구현했습니다.

- `app/layout.jsx`: HTML 언어, 전역 CSS, 메타데이터를 정의합니다.
- `app/page.jsx`: 파일 선택, 드래그 앤 드롭, 이름 계산, 다운로드 트리거를 담당하는 클라이언트 컴포넌트입니다.
- `app/globals.css`: 원본 인라인 CSS를 전역 CSS로 분리하고 반응형 레이아웃과 접근성 스타일을 보강했습니다.

`page.jsx` 상단에는 `"use client"`가 필요합니다. 파일 선택, 드래그 이벤트, `document.createElement`, `URL.createObjectURL`, `crypto.randomUUID`는 브라우저 API이므로 서버 컴포넌트에서 실행할 수 없습니다.

## 3. 파일 선택 시스템

파일 선택은 두 경로로 들어옵니다.

1. 숨겨진 `<input type="file" multiple>`의 `onChange`
2. 드롭 영역의 `onDrop`

두 경로 모두 `addFiles()`로 합쳐집니다. 이 함수는 `FileList`를 배열로 바꾸고, UI 렌더링에 필요한 메타데이터를 붙입니다.

```js
{
  id: `${Date.now()}-${index}-${crypto.randomUUID()}`,
  file,
  originalName: file.name,
  size: file.size,
  type: file.type
}
```

`FileList`는 배열처럼 보이지만 실제 배열은 아니기 때문에 `Array.from()`으로 변환해야 `map()` 등의 배열 메서드를 안정적으로 사용할 수 있습니다.

## 4. 파일명 계산 규칙

새 파일명은 `기준 이름 + 1부터 시작하는 순번 + 원본 확장자` 형식입니다.

예를 들어 기준 이름이 `사진`이고 원본 파일이 `IMG_001.JPG`, `IMG_002.PNG`이면 결과는 다음과 같습니다.

```text
사진1.JPG
사진2.PNG
```

확장자 추출은 마지막 점(`.`)을 기준으로 합니다.

- `photo.jpg` -> `.jpg`
- `archive.tar.gz` -> `.gz`
- `.env` -> 확장자 없음으로 취급
- `README` -> 확장자 없음

이 방식은 원본 코드의 `getExtension()` 규칙을 유지한 것입니다. `archive.tar.gz`를 `.tar.gz` 전체 확장자로 볼 수도 있지만, 원본 구현은 마지막 확장자만 유지합니다.

## 5. 다운로드 시스템

다운로드는 다음 순서로 처리됩니다.

1. `URL.createObjectURL(file)`로 브라우저 메모리 안의 임시 URL 생성
2. `<a>` 요소 생성
3. `href`에 임시 URL 지정
4. `download`에 새 파일명 지정
5. `anchor.click()`으로 다운로드 시작
6. `URL.revokeObjectURL(url)`로 임시 URL 해제
7. 다음 파일 다운로드 전 120ms 대기

120ms 대기는 여러 파일 다운로드 요청이 한 번에 몰릴 때 브라우저가 일부 클릭을 무시하거나 다운로드 프롬프트를 제대로 처리하지 못하는 상황을 줄이기 위한 완충 장치입니다.

## 6. 브라우저 보안 모델

이 앱은 로컬 파일을 직접 수정하지 않습니다. 브라우저의 File API는 사용자가 명시적으로 선택한 파일의 읽기 권한만 제공합니다. 파일 경로 전체도 알 수 없고, 원본 파일을 덮어쓰거나 삭제하거나 이름을 변경할 수 없습니다.

따라서 이 앱의 "이름 변경"은 다음 의미입니다.

- 원본 파일은 그대로 유지됩니다.
- 같은 파일 내용을 새 다운로드 이름으로 저장합니다.
- 다운로드 위치와 중복 파일명 처리는 브라우저 설정과 운영체제 정책을 따릅니다.

이 구조 덕분에 서버 저장소, 인증, 업로드 제한, 개인정보 처리 부담이 없습니다.

## 7. 상태 관리 흐름

상태 흐름은 단순한 단방향 데이터 흐름입니다.

- 파일 추가: `files` 배열 뒤에 새 항목 추가
- 기준 이름 변경: `baseName` 변경, 다운로드 완료 상태 초기화
- 파일 제거: 해당 ID를 제외한 새 배열 생성
- 전체 삭제: `files`를 빈 배열로 변경하고 파일 input 값 초기화
- 다운로드: 유효성 검사 후 순차 다운로드, 완료 상태 표시

파일명 미리보기는 별도 상태로 저장하지 않습니다. 렌더링 시점에 `baseName`, 파일 순서, 원본 확장자를 조합해 계산합니다. 이 방식은 파생 상태 불일치 문제를 줄입니다.

## 8. UX와 접근성

Next.js 버전에서는 원본의 어두운 도구형 UI를 유지하면서 다음을 보강했습니다.

- 드롭 영역을 실제 `<button>`으로 구성해 키보드 접근성을 확보
- 파일 목록 섹션에 `aria-labelledby` 적용
- 다운로드 완료 메시지에 `role="status"` 적용
- 제거 버튼에 파일명 기반 `aria-label` 적용
- 모바일에서 파일 크기 열을 숨기고 목록 그리드를 재배치
- 긴 파일명은 `text-overflow: ellipsis`로 레이아웃 파손 방지

## 9. 한계와 확장 가능성

현재 구현의 한계는 브라우저 다운로드 방식에서 옵니다.

- 일부 브라우저는 대량 자동 다운로드를 차단할 수 있습니다.
- 다운로드 폴더는 앱이 직접 지정할 수 없습니다.
- 기존 파일을 같은 위치에서 직접 rename할 수 없습니다.
- 폴더 구조를 유지한 일괄 rename은 일반 File API만으로 제한적입니다.

확장 가능한 방향은 다음과 같습니다.

- ZIP으로 묶어 한 번에 다운로드
- 순번 자릿수 옵션 추가 (`001`, `002`)
- 접두사/접미사/날짜/원본명 일부 조합 규칙 추가
- 파일 목록 드래그 정렬
- File System Access API를 지원하는 브라우저에서 실제 저장 위치 선택 기능 추가

## 10. 사용된 시스템 요약

- React 상태 시스템: 파일 목록, 입력값, 드래그 상태, 완료 상태 관리
- Next.js App Router: 앱 구조, 메타데이터, 전역 스타일 제공
- HTML File API: 사용자가 선택한 파일의 이름, 크기, 타입, 내용 참조
- Drag and Drop API: 드롭된 파일 목록 수신
- Blob URL API: 로컬 파일 객체를 다운로드 가능한 임시 URL로 변환
- Anchor Download API: 새 파일명을 가진 다운로드 요청 생성
- CSS Grid/Flexbox: 도구 패널, 파일 목록, 하단 액션 바 레이아웃 구성

## 11. 빌드와 의존성 메모

의존성은 2026-05-05 기준 npm registry에서 확인한 최신 안정 버전인 Next.js 16.2.4, React 19.2.5, React DOM 19.2.5를 사용합니다.

`next.config.mjs`에는 `turbopack.root`를 프로젝트 폴더로 지정했습니다. 이 설정은 상위 디렉터리에 다른 lockfile이 있을 때 Next.js가 workspace root를 잘못 추론하며 내는 경고를 제거합니다.

`npm audit` 결과 Next.js가 내부적으로 의존하는 `postcss < 8.5.10`에 대한 moderate 경고가 표시됩니다. npm이 제안한 자동 수정은 Next를 오래된 major 버전으로 낮추는 방식이라 적용하지 않았습니다. 현재 앱은 사용자 입력을 CSS로 변환하거나 PostCSS stringify 출력에 삽입하지 않으므로 해당 취약점의 직접 노출면은 없습니다. 다만 추후 Next.js가 해당 의존성을 업데이트한 버전을 배포하면 `npm install next@latest react@latest react-dom@latest` 후 다시 `npm audit`을 확인하는 것이 좋습니다.
