'use client';
import Image from 'next/image';

export default function MenuHero() {
  return (
    <section className="relative bg-[#601131] text-white pt-24 pb-28 overflow-hidden font-poppins min-h-[50vh]">
      {/* Doodle overlay */}
      <div className="absolute inset-0">
        <Image
          src="/background/doodle.avif"
          alt="Doodle"
          fill
          className="object-cover object-center opacity-30"
          priority
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-20">
        <div>
          <h2 className="text-xl font-semibold opacity-90">Product</h2>
          <p className="mt-1 text-xs">
            <span className="opacity-80">Home</span> <span className="opacity-60">››</span> <span className="opacity-90">Menu</span>
          </p>
        </div>
        {/* <div className="flex lg:justify-end">
          <Image
            src="/images/shapes/mandala-background.png"
            alt="Hero dish"
            width={420}
            height={280}
            className="object-contain rounded-xl "
          />
        </div> */}
      </div>
      <Image
        src="/images/shapes/mandala-background.png"
        alt="Hero dish"
        width={420}
        height={280}
        className="object-contain rounded-xl absolute bottom-0 right-0"
      />
    </section>
  );
}