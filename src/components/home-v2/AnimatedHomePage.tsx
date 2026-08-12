import React from 'react';
import Image from 'next/image';
import ParticleBackdrop from './ParticleBackdrop';
import Reveal from './Reveal';

const FEATURES = [
  { icon: '/icons/authentic.svg', alt: 'Authentic icon', title: 'Authentic Flavors', desc: "Kerala's traditional dishes await" },
  { icon: '/icons/delivery.svg', alt: 'Delivery icon', title: 'Fast Delivery', desc: 'Hot meals at your doorstep' },
  { icon: '/icons/catering.svg', alt: 'Catering icon', title: 'Budget Catering', desc: 'Affordable event catering' },
  { icon: '/icons/customised.svg', alt: 'Customised icon', title: 'Customized Meals', desc: 'Personalized dining plans' },
];

const ABOUT_POINTS = [
  'Authentic Indian cuisine',
  'Easy online ordering',
  'Fresh, quality ingredients',
  'Tradition meets innovation',
];

const LEFT_DISHES = [
  { name: 'Laal Chauk Murg', desc: 'Chicken Tikka cooked to perfection in onion tomato masala' },
  { name: 'Malabar Beef Curry', desc: 'Tender Beef braised in caramelised onions, tomatoes, ground Malabar spices' },
  { name: 'Saag Murg', desc: 'Chicken morsels simmered in medium spiced masala' },
];

const RIGHT_DISHES = [
  { name: 'Lamb Rogan', desc: 'An aromatic Kashmiri braised lamb preparation' },
  { name: 'Saag Gosht', desc: 'Succulent lamb cooked in onion, tomatoes and cardamom, etc' },
  { name: 'Chutty Curry', desc: 'Authentic preparation of yummy traditional Kerala style chicken curry' },
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
    desc: 'We will bring you food to your doorstep.',
    path: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
  },
];

const glassCard = 'bg-white/8 backdrop-blur-md border border-white/10 shadow-xl';

export default function AnimatedHomePage() {
  return (
    <div className="min-h-screen">
      <ParticleBackdrop />

      {/* Hero Section */}
      <section className="relative flex min-h-[100dvh] items-end overflow-hidden py-20 md:min-h-[90vh]">
        <div className="absolute top-10 right-10 z-10 h-64 w-64 opacity-30">
          <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-orange-300">
            <div className="flex h-48 w-48 items-center justify-center rounded-full border-2 border-orange-300">
              <div className="h-32 w-32 rounded-full border-2 border-orange-300" />
            </div>
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="text-white">
              <Reveal delay={0}>
                <p className="mb-4 text-lg text-orange-300">Good Food Good Life</p>
              </Reveal>
              <Reveal delay={120}>
                <h1 className="mb-6 text-4xl leading-tight font-bold lg:text-6xl">
                  Experience The Best Food In Town
                </h1>
              </Reveal>
              <Reveal delay={240}>
                <p className="mb-8 text-lg leading-relaxed text-gray-200">
                  Here at Ty Malabar, we are constantly striving to improve our service and quality
                  in order to give our customers the very best experience
                </p>
              </Reveal>
              <Reveal delay={360}>
                <a href="https://order.tymalabar.co.uk" target="_blank" rel="noopener noreferrer">
                  <button className="rounded-lg bg-[#F1EED0] px-8 py-3 font-semibold text-black transition-colors hover:cursor-pointer hover:bg-orange-500">
                    Explore Menu
                  </button>
                </a>
              </Reveal>
            </div>

            <Reveal delay={200} direction="scale" className="flex justify-end">
              <div className="animate-float">
                <Image
                  src="/images/food/biriyani-circle.png"
                  alt="Delicious food"
                  width={300}
                  height={300}
                  className="w-[450px] object-contain object-center"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 120} className="h-full">
                <div className={`flex h-full flex-col items-center justify-center rounded-2xl px-6 py-8 text-center ${glassCard}`}>
                  <Image
                    src={f.icon}
                    alt={f.alt}
                    width={40}
                    height={40}
                    className="animate-float mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                  <h3 className="mb-2 text-xl font-semibold text-white">{f.title}</h3>
                  <p className="text-white/70">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <Reveal direction="left">
              <div className="relative">
                <Image
                  src="/images/home/location.png"
                  alt="About image"
                  width={400}
                  height={400}
                  className="w-full rounded-full object-contain object-center shadow-2xl"
                />
              </div>
            </Reveal>

            <div>
              <Reveal delay={0}>
                <p className="mb-2 font-semibold text-orange-400">Who We Are</p>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="mb-6 text-4xl font-bold text-white">
                  A Culinary Journey Through
                  <br />
                  Tradition And Taste
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="mb-6 leading-relaxed text-white/70">
                  Ty Malabar offers a unique taste of India with a variety of traditional dishes
                  expertly crafted for your enjoyment. Located in Pencoed, we serve the
                  surrounding areas with fresh, flavorful meals through our easy-to-use online
                  ordering platform.
                </p>
              </Reveal>

              <div className="mb-6 grid grid-cols-2 gap-4">
                {ABOUT_POINTS.map((point, i) => (
                  <Reveal key={point} delay={300 + i * 80}>
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 shrink-0 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                      <span className="text-white/80">{point}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <Reveal>
            <p className="mb-3 font-semibold tracking-wide text-orange-400 uppercase">Our Popular Dishes</p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="mb-14 text-4xl font-extrabold text-white md:text-5xl">Choose Your Best Menu</h2>
          </Reveal>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-3">
            <div className="space-y-8">
              {LEFT_DISHES.map((dish, i) => (
                <Reveal key={dish.name} direction="left" delay={i * 130}>
                  <div className={`flex items-center space-x-4 rounded-xl p-5 transition-transform duration-300 hover:scale-105 ${glassCard}`}>
                    <div className="text-center">
                      <h3 className="font-semibold text-white">{dish.name}</h3>
                      <p className="text-sm text-white/70">{dish.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal direction="scale" delay={150}>
              <div className="relative">
                <div className="animate-float mx-auto flex h-80 w-80 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-2xl">
                  <Image
                    src="/images/food/full_tandoori_chicken.png"
                    alt="Main Dish Image"
                    width={300}
                    height={300}
                    className="rounded-full shadow-lg transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="absolute -right-6 -bottom-6 h-28 w-28 rounded-full bg-yellow-300 opacity-50 blur-2xl" />
              </div>
            </Reveal>

            <div className="space-y-8">
              {RIGHT_DISHES.map((dish, i) => (
                <Reveal key={dish.name} direction="right" delay={i * 130}>
                  <div className={`flex items-center space-x-4 rounded-xl p-5 transition-transform duration-300 hover:scale-105 ${glassCard}`}>
                    <div className="text-center">
                      <h3 className="font-semibold text-white">{dish.name}</h3>
                      <p className="text-sm text-white/70">{dish.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Reveal delay={400}>
            <div className="mx-auto mt-16 max-w-3xl rounded-2xl bg-gradient-to-r from-[#601131] to-[#A63C4D] px-8 py-10 text-white shadow-lg">
              <p className="mb-3 text-lg">Discover the rich flavors that our customers rave about.</p>
              <p className="text-xl font-semibold">Each dish is a perfect blend of tradition and taste.</p>
              <a href="https://order.tymalabar.co.uk" target="_blank" rel="noopener noreferrer">
                <button className="mt-6 rounded-full bg-white px-6 py-3 font-semibold text-[#601131] transition hover:bg-gray-100">
                  Explore Full Menu
                </button>
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Order Process Section */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <p className="mb-2 font-semibold text-orange-400">The Ty Malabar Way</p>
              </Reveal>
              <Reveal delay={100}>
                <h2 className="mb-6 text-4xl font-bold text-white">
                  Select, Pay, and Enjoy Freshly
                  <br />
                  Delivered Indian Cuisine
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="mb-8 leading-relaxed text-white/70">
                  Enjoy authentic Indian dishes at Ty Malabar. Order, pay online, and get fresh food delivery.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <a
                  href="https://order.tymalabar.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-orange-400 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-500"
                >
                  Order Now
                </a>
              </Reveal>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {PROCESS_STEPS.map((step, i) => (
                <Reveal key={step.title} delay={i * 150}>
                  <div className={`rounded-lg p-6 text-center ${glassCard}`}>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-orange-400">
                      <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d={step.path} />
                      </svg>
                    </div>
                    <h3 className="mb-2 font-semibold text-white">{step.title}</h3>
                    <p className="text-sm text-white/70">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
