'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

/* ---------- scroll-progress math (shared by every section below) ---------- */

function clamp(v: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// Maps a section's own 0-1 progress into a 0-1 progress for one beat inside it,
// e.g. localProgress(sectionProgress, 0.2, 0.5) is 0 before 20%, 1 after 50%.
function localProgress(global: number, start: number, end: number) {
  return clamp((global - start) / (end - start));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Slight overshoot on the way in, like something settling into place.
function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = clamp(t);
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

// 0 the instant `el`'s top reaches the top of the viewport, 1 once we've
// scrolled all the way through its extra height — i.e. how far through a
// tall spacer we are while its sticky child stays pinned on screen.
function getSectionProgress(el: HTMLElement | null): number {
  if (!el) return 0;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = rect.height - vh;
  if (total <= 0) return rect.top <= 0 ? 1 : 0;
  return clamp(-rect.top / total);
}

/* ---------------------------------- content ---------------------------------- */

const FEATURES = [
  { icon: '/icons/authentic.svg', title: 'Authentic Flavors', desc: "Kerala's traditional dishes await" },
  { icon: '/icons/delivery.svg', title: 'Fast Delivery', desc: 'Hot meals at your doorstep' },
  { icon: '/icons/catering.svg', title: 'Budget Catering', desc: 'Affordable event catering' },
  { icon: '/icons/customised.svg', title: 'Customized Meals', desc: 'Personalized dining plans' },
];

const ABOUT_POINTS = [
  'Authentic Indian cuisine',
  'Easy online ordering',
  'Fresh, quality ingredients',
  'Tradition meets innovation',
];

const LEFT_DISHES = [
  { name: 'Laal Chauk Murg', desc: 'Chicken Tikka cooked to perfection in onion tomato masala' },
  { name: 'Malabar Beef Curry', desc: 'Tender beef braised in caramelised onions, tomatoes, ground Malabar spices' },
  { name: 'Saag Murg', desc: 'Chicken morsels simmered in medium spiced masala' },
];

const RIGHT_DISHES = [
  { name: 'Lamb Rogan', desc: 'An aromatic Kashmiri braised lamb preparation' },
  { name: 'Saag Gosht', desc: 'Succulent lamb cooked in onion, tomatoes and cardamom' },
  { name: 'Chutty Curry', desc: 'Authentic traditional Kerala style chicken curry' },
];

const PROCESS_STEPS = [
  {
    title: 'Pick A Dish',
    desc: 'Pick the one you like most from our delicious menu.',
    path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  {
    title: 'Make Payment',
    desc: 'You can now pay online for your food.',
    path: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
  },
  {
    title: 'Receive Your Food',
    desc: 'We will bring your food to your doorstep.',
    path: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  },
];

const CHAPTERS = ['Arrival', 'Why Us', 'Our Roots', 'The Menu', 'How It Works', 'Order Now'];

export default function ScrollStoryHomePage() {
  const heroSpacerRef = useRef<HTMLDivElement>(null);
  const heroEyebrowRef = useRef<HTMLDivElement>(null);
  const heroLine1Ref = useRef<HTMLDivElement>(null);
  const heroLine2Ref = useRef<HTMLDivElement>(null);
  const heroParaRef = useRef<HTMLDivElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const heroInnerRef = useRef<HTMLDivElement>(null);

  const featuresSpacerRef = useRef<HTMLDivElement>(null);
  const featuresTrackRef = useRef<HTMLDivElement>(null);
  const featureCardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featuresDotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const aboutSpacerRef = useRef<HTMLDivElement>(null);
  const aboutImageWrapRef = useRef<HTMLDivElement>(null);
  const aboutHeadingRef = useRef<HTMLHeadingElement>(null);
  const aboutParaRef = useRef<HTMLParagraphElement>(null);
  const aboutPointRefs = useRef<(HTMLDivElement | null)[]>([]);

  const menuSpacerRef = useRef<HTMLDivElement>(null);
  const menuCenterRef = useRef<HTMLDivElement>(null);
  const menuHeadingRef = useRef<HTMLDivElement>(null);
  const menuLeftRefs = useRef<(HTMLDivElement | null)[]>([]);
  const menuRightRefs = useRef<(HTMLDivElement | null)[]>([]);

  const processSpacerRef = useRef<HTMLDivElement>(null);
  const processPathRef = useRef<SVGPathElement>(null);
  const processStepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const processHeadingRef = useRef<HTMLDivElement>(null);

  const ctaSpacerRef = useRef<HTMLDivElement>(null);
  const ctaImageRef = useRef<HTMLDivElement>(null);
  const ctaHeadingRef = useRef<HTMLDivElement>(null);
  const ctaButtonRef = useRef<HTMLDivElement>(null);
  const ctaGlowRef = useRef<HTMLDivElement>(null);

  const railFillRef = useRef<HTMLDivElement>(null);
  const railDotRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let ticking = false;
    let pathLength = 0;

    if (processPathRef.current) {
      pathLength = processPathRef.current.getTotalLength();
      processPathRef.current.style.strokeDasharray = `${pathLength}`;
    }

    function render() {
      ticking = false;

      /* ---------------- Hero ---------------- */
      const heroP = getSectionProgress(heroSpacerRef.current);
      const eyebrowP = easeOutCubic(localProgress(heroP, 0, 0.22));
      const line1P = easeOutCubic(localProgress(heroP, 0.05, 0.32));
      const line2P = easeOutCubic(localProgress(heroP, 0.15, 0.42));
      const paraP = easeOutCubic(localProgress(heroP, 0.28, 0.52));
      const ctaP = easeOutBack(localProgress(heroP, 0.4, 0.68));
      const imgP = easeOutCubic(localProgress(heroP, 0, 0.6));
      const exitP = localProgress(heroP, 0.72, 1);

      if (heroEyebrowRef.current) {
        heroEyebrowRef.current.style.transform = `translateY(${lerp(24, 0, eyebrowP)}px)`;
        heroEyebrowRef.current.style.opacity = `${eyebrowP}`;
      }
      if (heroLine1Ref.current)
        heroLine1Ref.current.style.clipPath = `inset(0 ${lerp(100, 0, line1P)}% 0 0)`;
      if (heroLine2Ref.current)
        heroLine2Ref.current.style.clipPath = `inset(0 ${lerp(100, 0, line2P)}% 0 0)`;
      if (heroParaRef.current) {
        heroParaRef.current.style.transform = `translateY(${lerp(20, 0, paraP)}px)`;
        heroParaRef.current.style.opacity = `${paraP}`;
      }
      if (heroCtaRef.current) {
        heroCtaRef.current.style.transform = `scale(${lerp(0.7, 1, ctaP)})`;
        heroCtaRef.current.style.opacity = `${localProgress(heroP, 0.4, 0.55)}`;
      }
      if (heroImageRef.current)
        heroImageRef.current.style.transform =
          `translateX(${lerp(45, 0, imgP)}vw) translateY(${lerp(6, 0, imgP)}vh) rotate(${lerp(28, 0, imgP)}deg) scale(${lerp(0.55, 1, imgP)})`;
      if (heroInnerRef.current) {
        heroInnerRef.current.style.opacity = `${1 - exitP}`;
        heroInnerRef.current.style.transform = `translateY(${lerp(0, -60, exitP)}px) scale(${lerp(1, 0.94, exitP)})`;
      }

      /* ---------------- Features filmstrip ---------------- */
      const featP = getSectionProgress(featuresSpacerRef.current);
      const panCount = FEATURES.length - 1;
      if (featuresTrackRef.current)
        featuresTrackRef.current.style.transform = `translateX(${-featP * panCount * 100}vw)`;

      featureCardRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = i / FEATURES.length;
        const end = (i + 0.6) / FEATURES.length;
        const local = easeOutBack(localProgress(featP, start, end));
        el.style.transform = `scale(${lerp(0.72, 1, local)}) translateY(${lerp(30, 0, local)}px)`;
        el.style.opacity = `${clamp(local * 1.4)}`;
      });
      featuresDotRefs.current.forEach((el, i) => {
        if (!el) return;
        const active = i === Math.min(FEATURES.length - 1, Math.round(featP * panCount));
        el.style.transform = active ? 'scale(1.35)' : 'scale(1)';
        el.style.opacity = active ? '1' : '0.35';
      });

      /* ---------------- About / roots ---------------- */
      const aboutP = getSectionProgress(aboutSpacerRef.current);
      const revealP = easeOutCubic(localProgress(aboutP, 0, 0.45));
      if (aboutImageWrapRef.current) {
        aboutImageWrapRef.current.style.clipPath = `circle(${lerp(0, 75, revealP)}% at 50% 50%)`;
        aboutImageWrapRef.current.style.transform = `scale(${lerp(1.15, 1, revealP)}) translateY(${lerp(0, -8, aboutP)}%)`;
      }
      if (aboutHeadingRef.current) {
        const hp = easeOutCubic(localProgress(aboutP, 0.05, 0.4));
        aboutHeadingRef.current.style.clipPath = `inset(0 ${lerp(100, 0, hp)}% 0 0)`;
      }
      if (aboutParaRef.current) {
        const pp = localProgress(aboutP, 0.2, 0.45);
        aboutParaRef.current.style.opacity = `${pp}`;
        aboutParaRef.current.style.transform = `translateX(${lerp(24, 0, pp)}px)`;
      }
      aboutPointRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.35 + i * 0.1;
        const local = easeOutCubic(localProgress(aboutP, start, start + 0.2));
        el.style.opacity = `${local}`;
        el.style.transform = `translateX(${lerp(30, 0, local)}px)`;
      });

      /* ---------------- Menu assembly ---------------- */
      const menuP = getSectionProgress(menuSpacerRef.current);
      const centerP = easeOutBack(localProgress(menuP, 0, 0.55));
      if (menuCenterRef.current)
        menuCenterRef.current.style.transform = `scale(${lerp(0.25, 1, centerP)}) rotate(${lerp(-30, 0, centerP)}deg)`;
      if (menuHeadingRef.current) {
        const hp = localProgress(menuP, 0, 0.2);
        menuHeadingRef.current.style.opacity = `${hp}`;
        menuHeadingRef.current.style.transform = `translateY(${lerp(-16, 0, hp)}px)`;
      }
      menuLeftRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.1 + i * 0.12;
        const local = easeOutBack(localProgress(menuP, start, start + 0.32));
        el.style.transform = `translateX(${lerp(-70, 0, local)}vw)`;
        el.style.opacity = `${clamp(local * 1.3)}`;
      });
      menuRightRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.1 + i * 0.12;
        const local = easeOutBack(localProgress(menuP, start, start + 0.32));
        el.style.transform = `translateX(${lerp(70, 0, local)}vw)`;
        el.style.opacity = `${clamp(local * 1.3)}`;
      });

      /* ---------------- How it works ---------------- */
      const procP = getSectionProgress(processSpacerRef.current);
      if (processHeadingRef.current) {
        const hp = localProgress(procP, 0, 0.15);
        processHeadingRef.current.style.opacity = `${hp}`;
        processHeadingRef.current.style.transform = `translateY(${lerp(-16, 0, hp)}px)`;
      }
      if (processPathRef.current && pathLength) {
        const drawP = easeOutCubic(localProgress(procP, 0.05, 0.85));
        processPathRef.current.style.strokeDashoffset = `${pathLength * (1 - drawP)}`;
      }
      processStepRefs.current.forEach((el, i) => {
        if (!el) return;
        const start = 0.15 + i * 0.28;
        const local = easeOutBack(localProgress(procP, start, start + 0.3));
        el.style.transform = `scale(${lerp(0.4, 1, local)}) translateY(${lerp(24, 0, local)}px)`;
        el.style.opacity = `${clamp(local * 1.3)}`;
      });

      /* ---------------- Finale / CTA ---------------- */
      const ctaP2 = getSectionProgress(ctaSpacerRef.current);
      const settleP = easeOutCubic(localProgress(ctaP2, 0, 0.45));
      if (ctaImageRef.current)
        ctaImageRef.current.style.transform = `scale(${lerp(0.6, 1, settleP)}) rotate(${lerp(-16, 0, settleP)}deg)`;
      if (ctaHeadingRef.current) {
        const hp = localProgress(ctaP2, 0.1, 0.4);
        ctaHeadingRef.current.style.opacity = `${hp}`;
        ctaHeadingRef.current.style.transform = `translateY(${lerp(24, 0, hp)}px)`;
      }
      if (ctaButtonRef.current) {
        const bp = easeOutBack(localProgress(ctaP2, 0.3, 0.6));
        ctaButtonRef.current.style.transform = `scale(${lerp(0.6, 1, bp)})`;
        ctaButtonRef.current.style.opacity = `${localProgress(ctaP2, 0.3, 0.45)}`;
      }
      if (ctaGlowRef.current) {
        ctaGlowRef.current.style.opacity = `${smoothstep(0.1, 0.5, ctaP2) * 0.6}`;
        ctaGlowRef.current.style.transform = `scale(${lerp(0.7, 1.15, ctaP2)}) rotate(${ctaP2 * 40}deg)`;
      }

      /* ---------------- Story progress rail ---------------- */
      const all = [heroP, featP, aboutP, menuP, procP, ctaP2];
      const overall = all.reduce((a, b) => a + b, 0) / all.length;
      if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${overall})`;
      const activeChapter = all.filter(p => p >= 0.999).length;
      railDotRefs.current.forEach((el, i) => {
        if (!el) return;
        const isActive = i === Math.min(CHAPTERS.length - 1, activeChapter);
        el.style.transform = isActive ? 'scale(1.4)' : 'scale(1)';
        el.style.opacity = isActive ? '1' : '0.4';
      });
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(render);
      }
    }

    render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="bg-[#F5F5DC] font-poppins overflow-x-clip">
      {/* Story progress rail */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-4">
        <div className="relative w-[3px] h-40 bg-[#601131]/15 rounded-full overflow-hidden">
          <div
            ref={railFillRef}
            className="absolute bottom-0 left-0 w-full h-full bg-[#F0A429] origin-bottom rounded-full"
            style={{ transform: 'scaleY(0)' }}
          />
        </div>
        <div className="flex flex-col gap-3">
          {CHAPTERS.map((c, i) => (
            <div
              key={c}
              ref={el => { railDotRefs.current[i] = el; }}
              title={c}
              className="w-2 h-2 rounded-full bg-[#601131] transition-transform duration-150"
              style={{ opacity: 0.4 }}
            />
          ))}
        </div>
      </div>

      {/* ================= HERO ================= */}
      <div ref={heroSpacerRef} className="relative" style={{ height: '250vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[#601131]">
          <div className="absolute inset-0">
            <Image src="/background/doodle.avif" alt="" fill className="object-cover object-center" priority />
          </div>

          <div ref={heroInnerRef} className="relative z-10 max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              <div className="text-white">
                <div ref={heroEyebrowRef} className="text-orange-300 mb-4 text-lg" style={{ opacity: 0 }}>
                  Good Food Good Life
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold mb-2 leading-tight">
                  <div ref={heroLine1Ref} style={{ clipPath: 'inset(0 100% 0 0)' }}>Experience The Best</div>
                  <div ref={heroLine2Ref} style={{ clipPath: 'inset(0 100% 0 0)' }}>Food In Town</div>
                </h1>
                <div ref={heroParaRef} className="mt-4" style={{ opacity: 0 }}>
                  <p className="text-lg mb-8 text-gray-200 leading-relaxed max-w-md">
                    Here at Ty Malabar, we are constantly striving to improve our service and quality
                    in order to give our customers the very best experience.
                  </p>
                </div>
                <div ref={heroCtaRef} style={{ opacity: 0 }}>
                  <Link href="/menu">
                    <button className="bg-[#F1EED0] hover:bg-orange-500 hover:text-white text-black font-semibold px-8 py-3 rounded-lg transition-colors">
                      Explore Menu
                    </button>
                  </Link>
                </div>
              </div>

              <div className="flex justify-end">
                <div ref={heroImageRef} className="will-change-transform">
                  <Image
                    src="/images/food/biriyani-circle.png"
                    alt="Delicious food"
                    width={420}
                    height={420}
                    className="object-contain object-center w-[300px] lg:w-[420px]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 text-xs tracking-widest uppercase">
            Scroll to begin the story
          </div>
        </div>
      </div>

      {/* ================= FEATURES FILMSTRIP ================= */}
      <div ref={featuresSpacerRef} className="relative" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[#F1EED0] flex flex-col items-center justify-center">
          <p className="text-[#601131]/50 font-semibold tracking-widest uppercase text-sm mb-2">Why TyMalabar</p>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-10 text-center px-6">
            Everything We Promise, Every Time
          </h2>

          <div className="w-full overflow-hidden">
            <div ref={featuresTrackRef} className="flex will-change-transform">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="w-screen flex-shrink-0 flex items-center justify-center px-6">
                  <div
                    ref={el => { featureCardRefs.current[i] = el; }}
                    className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center will-change-transform"
                    style={{ opacity: 0 }}
                  >
                    <Image src={f.icon} alt="" width={56} height={56} className="w-16 h-16 mx-auto mb-6" />
                    <h3 className="text-2xl font-semibold mb-2 text-gray-800">{f.title}</h3>
                    <p className="text-gray-600">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-10">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                ref={el => { featuresDotRefs.current[i] = el; }}
                className="w-2 h-2 rounded-full bg-[#601131] transition-transform duration-150"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ================= ABOUT / OUR ROOTS ================= */}
      <div ref={aboutSpacerRef} className="relative" style={{ height: '220vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[#F5F5DC] flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative flex justify-center">
                <div
                  ref={aboutImageWrapRef}
                  className="relative w-72 h-72 lg:w-96 lg:h-96 rounded-full overflow-hidden will-change-transform"
                  style={{ clipPath: 'circle(0% at 50% 50%)' }}
                >
                  <Image src="/images/home/location.png" alt="About Ty Malabar" fill className="object-cover object-center" />
                </div>
              </div>

              <div>
                <p className="text-orange-500 font-semibold mb-2">Who We Are</p>
                <h2
                  ref={aboutHeadingRef}
                  className="text-4xl font-bold mb-6 text-gray-800"
                  style={{ clipPath: 'inset(0 100% 0 0)' }}
                >
                  A Culinary Journey Through<br />Tradition And Taste
                </h2>
                <p ref={aboutParaRef} className="text-gray-600 mb-6 leading-relaxed" style={{ opacity: 0 }}>
                  Ty Malabar offers a unique taste of India with a variety of traditional dishes
                  expertly crafted for your enjoyment. Located in Pencoed, we serve the surrounding
                  areas with fresh, flavorful meals through our easy-to-use online ordering platform.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {ABOUT_POINTS.map((point, i) => (
                    <div
                      key={point}
                      ref={el => { aboutPointRefs.current[i] = el; }}
                      className="flex items-center space-x-2 will-change-transform"
                      style={{ opacity: 0 }}
                    >
                      <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="text-gray-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MENU ASSEMBLY ================= */}
      <div ref={menuSpacerRef} className="relative" style={{ height: '260vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-gradient-to-b from-[#FFFDF5] to-[#F5F5DC] flex flex-col items-center justify-center px-4">
          <div ref={menuHeadingRef} className="text-center mb-8" style={{ opacity: 0 }}>
            <p className="text-orange-600 font-semibold tracking-wide uppercase mb-2">Our Popular Dishes</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-800">Choose Your Best Menu</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-center max-w-6xl w-full">
            <div className="space-y-4 order-2 lg:order-1">
              {LEFT_DISHES.map((dish, i) => (
                <div
                  key={dish.name}
                  ref={el => { menuLeftRefs.current[i] = el; }}
                  className="flex items-center bg-white p-4 rounded-xl shadow-md will-change-transform"
                  style={{ opacity: 0 }}
                >
                  <div className="text-center w-full">
                    <h3 className="font-semibold text-gray-800">{dish.name}</h3>
                    <p className="text-sm text-gray-600">{dish.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative order-1 lg:order-2 flex justify-center">
              <div ref={menuCenterRef} className="relative w-56 h-56 lg:w-72 lg:h-72 will-change-transform">
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Image
                    src="/images/food/full_tandoori_chicken.png"
                    alt="Main Dish"
                    width={260}
                    height={260}
                    className="rounded-full shadow-lg w-[85%] h-[85%] object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 order-3">
              {RIGHT_DISHES.map((dish, i) => (
                <div
                  key={dish.name}
                  ref={el => { menuRightRefs.current[i] = el; }}
                  className="flex items-center bg-white p-4 rounded-xl shadow-md will-change-transform"
                  style={{ opacity: 0 }}
                >
                  <div className="text-center w-full">
                    <h3 className="font-semibold text-gray-800">{dish.name}</h3>
                    <p className="text-sm text-gray-600">{dish.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= HOW IT WORKS ================= */}
      <div ref={processSpacerRef} className="relative" style={{ height: '220vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[#F5F5DC] flex flex-col items-center justify-center px-6">
          <div ref={processHeadingRef} className="text-center mb-14" style={{ opacity: 0 }}>
            <p className="text-orange-500 font-semibold mb-2">The Ty Malabar Way</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800">
              Select, Pay, and Enjoy Freshly Delivered Indian Cuisine
            </h2>
          </div>

          <div className="relative w-full max-w-4xl">
            <svg
              viewBox="0 0 800 40"
              className="absolute top-8 left-0 w-full h-10 hidden md:block"
              preserveAspectRatio="none"
            >
              <path
                ref={processPathRef}
                d="M 60 20 Q 270 -20 400 20 T 740 20"
                fill="none"
                stroke="#F0A429"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {PROCESS_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  ref={el => { processStepRefs.current[i] = el; }}
                  className="bg-white p-6 rounded-lg shadow-md text-center will-change-transform"
                  style={{ opacity: 0 }}
                >
                  <div className="w-16 h-16 bg-orange-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d={step.path} />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= FINALE / CTA ================= */}
      <div ref={ctaSpacerRef} className="relative" style={{ height: '180vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-[#601131] flex items-center justify-center">
          <div
            ref={ctaGlowRef}
            className="absolute w-[120vw] h-[120vw] rounded-full bg-orange-500/20 blur-3xl will-change-transform"
            style={{ opacity: 0 }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            <div ref={ctaImageRef} className="mb-6 will-change-transform">
              <Image
                src="/images/food/biriyani-circle.png"
                alt=""
                width={220}
                height={220}
                className="w-40 lg:w-56 object-contain"
              />
            </div>
            <div ref={ctaHeadingRef} style={{ opacity: 0 }}>
              <p className="text-orange-300 font-semibold mb-2">The Ty Malabar Way</p>
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 max-w-2xl">
                Ready To Taste Tradition?
              </h2>
            </div>
            <div ref={ctaButtonRef} style={{ opacity: 0 }}>
              <a
                href="https://tymalabaronline.com/menu"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-orange-400 hover:bg-orange-500 text-white font-semibold px-8 py-4 rounded-full transition-colors text-lg"
              >
                Order Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
