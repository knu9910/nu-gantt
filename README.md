# Nu-Spreadsheet

Next.js와 react-spreadsheet를 사용하여 만든 간트차트 웹 애플리케이션입니다.

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.0 이상
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치

```bash
npm install
```

2. 개발 서버 실행

```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## ✨ 주요 기능

- **간트차트 인터페이스**: 프로젝트 관리를 위한 시각적 타임라인
- **드래그 앤 드롭**: 마우스 드래그로 태스크 기간 설정
- **우클릭 메뉴**: 마우스 우클릭으로 빠른 태스크 생성
- **태스크 관리**: 태스크 생성, 삭제, 이름 변경
- **날짜 헤더**: 30일간의 날짜 표시 (오늘부터)
- **색상 구분**: 각 태스크별 고유 색상으로 시각적 구분
- **실시간 편집**: 태스크명 인라인 편집

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React 18, TypeScript
- **스타일링**: Tailwind CSS
- **빌드 도구**: Next.js built-in bundler

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx          # 메인 페이지
│   ├── layout.tsx        # 루트 레이아웃
│   └── globals.css       # 글로벌 스타일
└── _components/
    ├── GanttChartComponent.tsx   # 간트차트 컴포넌트
    └── SpreadsheetComponent.tsx  # 기존 스프레드시트 컴포넌트
```

## 🎯 사용법

### 태스크 생성

1. **드래그 앤 드롭**: 원하는 행에서 시작 날짜부터 종료 날짜까지 드래그
2. **우클릭 메뉴**: 특정 셀에서 우클릭 → "태스크 생성" 선택

### 태스크 관리

1. **이름 변경**: 왼쪽 태스크명 열에서 직접 편집
2. **태스크 삭제**:
   - 간트차트에서 태스크 바를 클릭
   - 하단 태스크 목록에서 "삭제" 버튼 클릭

### 네비게이션

- **스크롤**: 가로/세로 스크롤로 전체 차트 탐색
- **고정 헤더**: 날짜 헤더는 스크롤 시에도 고정

## 🎨 기능 세부사항

### 드래그 앤 드롭

- 마우스 왼쪽 버튼으로 드래그 시작
- 드래그 중인 영역은 파란색으로 하이라이트
- 드래그 종료 시 자동으로 태스크 생성

### 컨텍스트 메뉴

- 마우스 우클릭으로 활성화
- 기본 3일 기간의 태스크 생성
- 메뉴 외부 클릭 시 자동 닫힘

### 색상 시스템

- 12가지 사전 정의된 색상
- 태스크 생성 순서에 따라 자동 할당
- 색상별로 태스크 구분 가능

## 🔧 개발

### 빌드

```bash
npm run build
```

### 타입 체크

```bash
npm run type-check
```

### 린트

```bash
npm run lint
```

## 📝 커밋 규칙

이 프로젝트는 Conventional Commits 규칙을 따릅니다:

```
<scope>: <type>: <message>

예시:
- ui: feat: add gantt chart drag and drop functionality
- components: fix: resolve context menu positioning issue
- docs: docs: update readme with gantt chart usage
```

## 🤝 기여하기

1. 이 저장소를 포크합니다
2. 새로운 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'ui: feat: add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
