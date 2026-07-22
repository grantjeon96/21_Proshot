# ProShot — 다음 주 개발 로드맵 (Next Steps Roadmap)

> **상태:** 로컬 기능 구현 및 AI 이미지 생성/선명도 연동 완료, GitHub 레포지토리 푸시 완료 (`main` 브랜치).

---

## 📌 현재 완료된 현황 (Current Progress)

1. **프론트엔드 랜딩 페이지 & 모바일 반응형 UI**
   - 모던 라이트 테마 (슬레이트/인디고 컬러 조합, rounded-2xl 카드, whitespace 최적화)
   - 히어로 섹션, 여권사진 샘플 쇼케이스, 주요 특징 안내, 단일 요금제 카드, FAQ 영역
   - 푸터 문구: `ProShot — Learned from AI City Builders`

2. **사진 업로드 & AI 여권사진 생성**
   - 드래그 앤 드롭 및 파일 업로드 (최대 8MB, PNG/JPG/JPEG 검증)
   - 3가지 프로필 스타일 선택 (비즈니스 정장 / 스튜디오 / 야외 자연광)
   - Before/After 좌우 비교 카운터 (원본 셀카 vs AI 헤드샷)
   - `proshot-headshot.png` 고화질 다운로드 기능
   - 다시 생성 / 스타일 바꾸기 액션 기능
   - 선명도 최적화 (28 Inference Steps, Sharp focus 프롬프트, Bokeh/Blur 제거)

3. **무료 제한 & BYOK (Bring Your Own Key)**
   - 브라우저 `localStorage` 기반 2회 무료 체험 제한 카운팅 (`proshot_uses`)
   - 2회 초과 시 모달 창 노출 ("무료 체험 2회를 모두 사용했어요")
   - 사용자 본인 fal.ai API 키 사용 지원 (`proshot_byok` -> `x-fal-key` 헤더)

4. **GitHub 레포지토리 연결 완료**
   - 원격 주소: `https://github.com/grantjeon96/21_Proshot.git`

---

## 🚀 다음 주 진행할 과제 (Next Action Items)

### Task 1: Vercel 실서버 배포 (Deployment)
- [ ] Vercel 계정에 `https://github.com/grantjeon96/21_Proshot.git` 프로젝트 연동
- [ ] Vercel Project Settings > Environment Variables에 `FAL_KEY` 등록
- [ ] 커스텀 도메인 연결 (필요 시)

### Task 2: 결제 시스템 연동 (Payment Integration)
- [ ] PG사 연동 준비 (토스페이먼츠 Toss Payments / 아임포트 PortOne / Stripe 중 선택)
- [ ] 옵션 B (정식 버전 이용) 결제 버튼 활성화 및 결제 모달/페이지 연결
- [ ] 결제 완료 후 생성 권한 부여 또는 단건 결제 로직 백엔드 연동

### Task 3: 고객센터 & 환불 요청 페이지/모달 (Customer Support & Refund)
- [ ] **환불 요청 폼 (Refund Request)**
  - 결제건 조회 / 주문번호 입력
  - 반려 사유 (구청/영사관 여권 규격 미승인 증빙 이미지 첨부 기능)
  - 100% 환불 신청 자동/수동 접수 처리 API
- [ ] **고객센터 문의하기 (Support Center)**
  - 1:1 문의 폼 또는 이메일/카카오톡 채널 연동 버튼
  - 환불 규정 및 자주 묻는 질문(FAQ) 보강

---

**작성일시:** 2026-07-23
**작성자:** Antigravity AI Pair Programmer
