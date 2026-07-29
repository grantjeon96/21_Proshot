import Image from "next/image";
import UploadCard from "./components/UploadCard";
import FooterRefundButton from "./components/FooterRefundButton";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/80 via-slate-50 to-white text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Floating Header */}
      <header className="sticky top-4 z-50 mx-auto max-w-5xl px-4">
        <nav className="flex items-center justify-between rounded-full border border-slate-200/60 bg-white/75 px-6 py-3 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-300 hover:border-slate-300/80">
          <div className="flex items-center gap-2">
            {/* Logo */}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
              ProShot
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
              Beta
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#upload" className="transition-colors hover:text-indigo-600">사진 생성</a>
            <a href="#showcase" className="transition-colors hover:text-indigo-600">생성 샘플</a>
            <a href="#features" className="transition-colors hover:text-indigo-600">주요 특징</a>
            <a href="#pricing" className="transition-colors hover:text-indigo-600">이용 요금</a>
            <a href="#faq" className="transition-colors hover:text-indigo-600">자주 묻는 질문</a>
          </div>

          <div>
            <a
              href="#upload"
              className="group relative inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-all duration-300 hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95"
            >
              <span>시작하기</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </nav>
      </header>

      {/* Main Container */}
      <main role="main" className="mx-auto max-w-5xl px-4 pb-24">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center pt-20 pb-16 text-center md:pt-32 md:pb-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-3.5 py-1 text-xs font-semibold text-indigo-700 mb-6 animate-fade-in shadow-sm">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            100% 외교부 규격 보장 서비스
          </div>

          {/* Main Title */}
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-[76px] leading-[1.15] text-slate-900">
            셀카 한 장으로 <br className="sm:hidden" />
            <span className="relative inline-block bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 bg-clip-text text-transparent">
              AI 여권사진
            </span>
          </h1>

          {/* Subtitle */}
          <div className="mt-8 max-w-xl text-base text-slate-600 md:text-lg leading-relaxed font-normal">
            스튜디오에 직접 찾아가는 번거로움 없이, 집에서 찍은 셀카 한 장으로 3초 만에 외교부 규격에 완벽히 부합하는 고화질 여권사진을 완성해보세요.
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
            <a
              href="#upload"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-indigo-600 px-8 py-4.5 text-base font-bold text-white shadow-xl shadow-indigo-600/25 transition-all duration-300 hover:bg-indigo-500 hover:shadow-indigo-500/35 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <span>여권사진 만들기 (무료 2회)</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
            <a
              href="#showcase"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-8 py-4.5 text-base font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-50 hover:border-slate-300"
            >
              샘플 보기
            </a>
          </div>

          {/* Feature Guarantee Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 border-t border-slate-200/50 pt-8 w-full max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>대한민국 외교부 여권사진 규격 가이드 <strong>100% 반영</strong></span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>규격 미승인 시 <strong>100% 환불 보장</strong></span>
            </div>
          </div>
        </section>

        {/* Upload Card Section */}
        <section id="upload" className="py-16 flex flex-col items-center justify-center border-t border-slate-100 scroll-mt-20">
          <div className="text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              즉시 생성하기
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              지금 당신의 여권사진을 만드세요
            </h2>
            <div className="mt-2 text-slate-500 text-sm md:text-base">
              사진관에 가지 않고도, 3초 만에 완벽한 비율과 규격의 파일이 완성됩니다.
            </div>
          </div>
          <UploadCard />
        </section>

        {/* Showcase Grid (Real Generated Profile Images) */}
        <section id="showcase" className="py-16 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              ProShot이 완성한 AI 여권사진
            </h2>
            <div className="mt-3 text-slate-500 text-sm md:text-base">
              과도한 보정 없이 외교부 여권 기준(흰색 배경, 그림자 없음, 정면 응시)을 충족하면서 본래의 매력을 자연스럽게 살려냅니다.
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Man Passport */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] hover:border-slate-300/80">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                <Image
                  src="/images/passport_man.png"
                  alt="Young Korean man professional passport photo"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-w-768px) 100vw, 33vw"
                  priority
                  unoptimized
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">생성 샘플 01 (남성)</h3>
                  <div className="text-xs text-slate-400 mt-0.5">정제된 수트 스타일</div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  규격 통과
                </span>
              </div>
            </div>

            {/* Woman Passport 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] hover:border-slate-300/80">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                <Image
                  src="/images/passport_woman_1.png"
                  alt="Young Korean woman professional passport photo"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-w-768px) 100vw, 33vw"
                  priority
                  unoptimized
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">생성 샘플 02 (여성)</h3>
                  <div className="text-xs text-slate-400 mt-0.5">자연스럽고 또렷한 헤어라인</div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  규격 통과
                </span>
              </div>
            </div>

            {/* Woman Passport 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] hover:border-slate-300/80">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                <Image
                  src="/images/passport_woman_2.png"
                  alt="Young Korean woman casual passport photo"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-w-768px) 100vw, 33vw"
                  priority
                  unoptimized
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm">생성 샘플 03 (여성)</h3>
                  <div className="text-xs text-slate-400 mt-0.5">밝고 부드러운 이미지</div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  규격 통과
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Sections */}
        <section id="features" className="py-16 border-t border-slate-100">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                강력한 AI 엔진
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight">
                스튜디오의 조명과 보정을 <br />
                그대로 모바일 화면 안에 담았습니다
              </h2>
              <div className="mt-4 text-slate-600 leading-relaxed">
                ProShot은 단순한 필터가 아닙니다. 외교부의 까다로운 8가지 주요 여권 규격 기준을 실시간으로 확인하고, 배경 크로마키와 대칭 조명 처리를 통해 단 3초 만에 완전한 규격 통과용 고화질 사진을 연출합니다.
              </div>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "정교한 배경 리터칭",
                    desc: "지저분한 방 안 배경을 스튜디오 전용 고품질 흰색 무배경으로 교체",
                  },
                  {
                    title: "얼굴 대칭 및 섀도우 제거",
                    desc: "그림자를 지워 이목구비를 뚜렷하고 밝게 표현",
                  },
                  {
                    title: "여권 규격 가이드 자동 준수",
                    desc: "정수리부터 턱까지의 얼굴 높이 비율(3.2~3.6cm)을 밀리미터 단위로 조정",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{item.title}</h4>
                      <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Features */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800 text-base">3초 만에 즉시 전송</h3>
                <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                  스튜디오 예약 후 기다릴 필요 없이, 완성된 인화용 고화질 JPG 파일을 결제 즉시 다운로드 가능합니다.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800 text-base">규격 미승인 시 100% 환불</h3>
                <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                  혹시라도 구청이나 영사민원센터에서 반려될 경우, 신청 즉시 조건 없이 결제 금액의 100%를 환불해 드립니다.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800 text-base">1/10의 합리적 가격</h3>
                <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                  기본 2~3만 원대에 달하는 오프라인 스튜디오 비용 대신, 커피 한 잔 가격으로 동일 품격의 여권사진을 만드세요.
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-slate-800 text-base">300 DPI 인쇄 화질 보장</h3>
                <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                  자체 고해상도 초해상화 알고리즘을 적용하여 확대 출력 및 모바일 행정 접수 시에도 선명하게 인화됩니다.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              합리적인 단일 요금제
            </h2>
            <div className="mt-3 text-slate-500 text-sm md:text-base">
              추가 비용이나 정기 구독 유도 없이, 단 한 번의 결제로 영구 다운로드
            </div>
          </div>

          <div className="mx-auto max-w-lg rounded-3xl border border-indigo-100 bg-white p-8 shadow-[0_12px_40px_-12px_rgba(79,70,229,0.08)] md:p-10 relative overflow-hidden">
            {/* Sparkle border */}
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>

            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  인기 패키지
                </span>
                <h3 className="mt-4 text-2xl font-bold text-slate-900">AI 여권사진 패키지</h3>
              </div>
              <div className="text-right">
                <span className="text-sm text-slate-400 line-through">₩19,000</span>
                <div className="mt-1 flex items-baseline justify-end gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">₩4,900</span>
                  <span className="text-xs text-slate-500">/ 1회</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-500 leading-relaxed">
              얼굴 비율 보정부터 고품질 흰색 배경 교체까지 모든 규격 보정이 포함되어 있으며, 최종 마음에 드실 때까지 재생성을 지원합니다.
            </div>

            <ul className="mt-8 space-y-3.5 border-t border-slate-100 pt-8 text-sm text-slate-600">
              {[
                "외교부 공식 규격(3.5x4.5cm) 완벽 조정",
                "배경 잡티 및 그림자 자동 제거",
                "초고해상도 300 DPI 다운로드 파일 제공",
                "온라인 여권 민원 신청 사이트 즉시 업로드용 픽셀 규격 최적화",
                "결제 후 최대 3회 재제작 및 미통과 시 100% 환불",
              ].map((benefit, idx) => (
                <li key={idx} className="flex gap-3">
                  <svg className="h-5 w-5 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <a
                href="#upload"
                className="w-full block rounded-2xl bg-indigo-600 py-4 text-center text-sm font-bold text-white shadow-lg shadow-indigo-600/10 transition-all duration-300 hover:bg-indigo-500 hover:shadow-indigo-500/20 active:scale-[0.98]"
              >
                내 여권사진 만들기
              </a>
            </div>

            <div className="mt-4 text-center">
              <div className="text-[11px] text-slate-400">
                신용카드, 카카오페이, 토스 등 간편결제 지원
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 border-t border-slate-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              자주 묻는 질문
            </h2>
            <div className="mt-3 text-slate-500 text-sm md:text-base">
              여권사진 촬영 전, 꼭 확인해 보아야 할 가이드를 안내해 드립니다.
            </div>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                q: "정말 여권 발급 신청 시 통과가 되나요?",
                a: "네, 맞습니다! ProShot은 어깨 수평도, 정수리-턱 길이 비율, 뒷배경 흰색 단색화, 양귀 및 눈썹 노출 요구사항 등 대한민국 외교부 여권 표준 규격 가이드를 정밀하게 반영하여 사진을 보정 및 변환합니다.",
              },
              {
                q: "어떤 각도와 표정으로 원본 사진을 촬영해야 하나요?",
                a: "가장 중요한 것은 '정면 응시'와 '눈썹 가림 없음'입니다. 머리카락이 눈이나 얼굴 윤곽을 가리지 않게 귀 뒤로 완전히 넘겨주시고, 조명이 고른 방 안에서 치아를 보이지 않고 가볍게 다문 무표정 상태로 찍으시는 것이 가장 좋은 품질을 냅니다.",
              },
              {
                q: "실제로 반려되는 경우 환불 처리는 어떻게 진행되나요?",
                a: "만약 여권민원센터나 온라인 접수 과정에서 저희 사진의 규격 문제로 반려될 경우, 신청 내역과 반려 사유 캡처를 동봉하여 고객센터로 연락 주시면 24시간 내 100% 신속 환불 처리를 보장해 드립니다.",
              },
              {
                q: "파일 다운로드 외에 인쇄된 실물 인화 사진도 배송받을 수 있나요?",
                a: "현재는 결제 즉시 다운로드받으실 수 있는 인화용 고화질 JPG 파일 포맷을 기본으로 제공합니다. 이 파일을 스마트폰에 소지하시고 가까운 편의점 사진 인화 키오스크(프린팅박스 등)를 방문하시면 ₩1,000 미만의 아주 저렴한 비용으로 1분 만에 6장을 현장 인화할 수 있습니다.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h4 className="flex gap-2 font-bold text-slate-800 text-sm md:text-base">
                  <span className="text-indigo-600">Q.</span>
                  {faq.q}
                </h4>
                <div className="mt-2.5 pl-6 text-xs md:text-sm text-slate-500 leading-relaxed">
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic CTA Banner */}
        <section className="mt-16 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent"></div>
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="text-2xl font-bold md:text-4xl tracking-tight leading-snug">
              준비물은 단 하나, 당신의 셀카입니다.
            </h2>
            <div className="mt-4 text-xs md:text-sm text-slate-300 max-w-md leading-relaxed">
              지금 바로 ProShot AI로 3초 만에 검증된 고화질 여권사진을 만들고 여권 발급 신청을 완료하세요.
            </div>
            <a
              href="#upload"
              className="mt-8 inline-block rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 transition-all duration-300 hover:bg-slate-100 hover:scale-105 active:scale-[0.98]"
            >
              내 여권사진 만들기
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/50 py-12 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 ProShot. All rights reserved.</div>
          <div className="flex items-center gap-6 text-slate-500 font-medium">
            <a href="#upload" className="hover:text-slate-800 transition-colors">여권사진 생성</a>
            <a href="#faq" className="hover:text-slate-800 transition-colors">자주 묻는 질문</a>
            <FooterRefundButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
