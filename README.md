# ProShot — 셀카 한 장으로 AI 여권사진

> 스튜디오에 가지 않고, 셀카 한 장으로 외교부 규격에 부합하는 고화질 AI 여권사진을 3초 만에 생성합니다.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss)
![fal.ai](https://img.shields.io/badge/fal.ai-Flux_PuLID-purple)

---

## 📋 주요 기능

- **셀카 업로드** — 드래그 앤 드롭 또는 파일 선택 (최대 8MB, PNG/JPG/JPEG)
- **3가지 스타일** — 비즈니스 정장 · 스튜디오 · 야외 자연광
- **AI 여권사진 생성** — fal.ai Flux PuLID 모델 기반
- **Before/After 비교** — 원본 셀카와 AI 결과를 나란히 비교
- **PNG 다운로드** — 생성된 여권사진을 즉시 다운로드
- **무료 체험 2회** — localStorage 기반 사용 횟수 제한
- **BYOK (Bring Your Own Key)** — 본인의 fal.ai API 키로 무제한 사용

---

## 🛠️ 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| AI 엔진 | fal.ai (`@fal-ai/client`) — Flux PuLID 모델 |
| 런타임 | Node.js (Edge 런타임 아님 — `Buffer`, `@fal-ai/client` 사용) |
| 배포 | Vercel |

---

## 🚀 로컬 개발 환경 설정

### 1. 레포지토리 클론

```bash
git clone <your-repo-url>
cd proshot
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열어 `FAL_KEY`에 실제 fal.ai API 키를 입력하세요.

```
FAL_KEY=your_fal_api_key_here
```

> **⚠️ 중요:** `.env.local` 파일은 `.gitignore`에 의해 Git 추적에서 제외됩니다. 절대 커밋하지 마세요!

fal.ai API 키는 [https://fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) 에서 발급받을 수 있습니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

---

## ☁️ Vercel 배포 가이드

### 방법 1: Vercel CLI (터미널)

#### Step 1 — Vercel CLI 설치 (최초 1회)

```bash
npm i -g vercel
```

#### Step 2 — 로그인

```bash
vercel login
```

#### Step 3 — 프로젝트 디렉토리에서 배포

```bash
cd proshot
vercel
```

첫 배포 시 아래와 같은 질문이 나옵니다:

```
? Set up and deploy? Yes
? Which scope? <your-vercel-account>
? Link to existing project? No
? What's your project's name? proshot
? In which directory is your code located? ./
? Want to modify these settings? No
```

#### Step 4 — 환경 변수 등록 (반드시 필요!)

```bash
vercel env add FAL_KEY
```

프롬프트가 나타나면 fal.ai API 키를 붙여넣으세요. Environment 선택 시 `Production`, `Preview`, `Development` 모두 체크하는 것을 권장합니다.

#### Step 5 — 프로덕션 배포

```bash
vercel --prod
```

---

### 방법 2: Vercel 대시보드 (웹 UI)

#### Step 1 — GitHub 레포지토리 연결

1. [vercel.com](https://vercel.com) 로그인
2. **"Add New..." → "Project"** 클릭
3. GitHub 레포지토리 선택 (proshot)
4. Framework Preset: **Next.js** (자동 감지됨)
5. Root Directory: `./` (기본값)

#### Step 2 — 환경 변수 추가 ⚠️

> **이 단계를 반드시 배포 전에 완료해야 합니다!**

1. **Settings → Environment Variables** 이동
2. 아래 변수를 추가:

| Key | Value | Environment |
|-----|-------|------------|
| `FAL_KEY` | `your_fal_api_key` | Production, Preview, Development |

3. **Save** 클릭

#### Step 3 — 배포

**"Deploy"** 버튼을 클릭하면 자동으로 빌드 및 배포가 시작됩니다.

---

## ⚠️ 필수 환경 변수

| 변수명 | 설명 | 필수 여부 |
|--------|------|----------|
| `FAL_KEY` | fal.ai API 키 ([발급 링크](https://fal.ai/dashboard/keys)) | ✅ 필수 |

> **절대로 API 키를 코드에 하드코딩하거나 Git에 커밋하지 마세요.**
> Vercel 대시보드의 **Project Settings → Environment Variables** 에서만 등록하세요.

---

## 📁 프로젝트 구조

```
proshot/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # AI 생성 API (Node.js 런타임)
│   ├── components/
│   │   └── UploadCard.tsx        # 업로드 + 스타일 선택 + 결과 비교
│   ├── globals.css               # 글로벌 스타일 + 커스텀 애니메이션
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 랜딩 페이지
├── public/
│   └── images/                   # 샘플 여권사진 에셋
├── .env.example                  # 환경 변수 템플릿
├── .gitignore                    # .env.local 제외 설정 포함
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔒 보안 참고사항

- `/api/generate` 라우트는 **Node.js 런타임**(`export const runtime = "nodejs"`)으로 실행됩니다.
  - Edge 런타임이 아닌 이유: `@fal-ai/client`와 Node.js `Buffer` API를 사용하기 때문입니다.
- `FAL_KEY`는 서버 사이드에서만 사용되며, 클라이언트에 절대 노출되지 않습니다.
- BYOK(사용자 제공 API 키)는 브라우저의 `localStorage`에만 저장되며, 서버에 로깅되거나 영구 저장되지 않습니다.

---

## 📄 라이선스

MIT

---

**ProShot — Learned from AI City Builders**
