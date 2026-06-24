import Image from 'next/image';

export default function ContactPage() {
  return (
    <main className="font-poppins">
      {/* Hero */}
      <section className="relative bg-[#601131] text-white pt-24 pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/background/doodle.avif"
            alt="Doodle"
            fill
            className="object-cover object-center opacity-30"
            priority
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mt-8">
          <div>
            <h2 className="text-xl font-semibold">Contact us</h2>
            <p className="mt-1 text-sm">
              <span className="opacity-90">Home</span> <span className="opacity-60">››</span>{' '}
              <span className="opacity-90">Contact Us</span>
            </p>
          </div>
          <div className="flex lg:justify-end">
            <Image
              src="/images/home/location.png"
              alt="Location"
              width={420}
              height={280}
              className="object-contain rounded-full"
            />
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="bg-[#F5F5DC] pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Info */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#101010] mb-6">
              Get in touch with our lovely Team
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-[#101010] mb-2">Office Address</h4>
                <p className="text-sm text-gray-700">
                  8 Hendre Road, Pencoed, Bridgend, CF35 5NW
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#101010] mb-2">Phone Number</h4>
                <p className="text-sm text-gray-700">
                  <a href="tel:01656860844" className="text-[#601131] hover:text-[#A63C4D] transition-colors">
                    01656 860844
                  </a>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#101010] mb-2">Mail Address</h4>
                <p className="text-sm text-gray-700">
                  tymalabar@gmail.com
                </p>
              </div>
            </div>

            {/* Decorative mandala bottom-left */}
            <div className="relative mt-10">
              <div className="absolute -left-20 bottom-0 w-60 h-60 opacity-20">
                <div className="w-full h-full border-2 border-[#D7CDA7] rounded-full" />
              </div>
            </div>
          </div>

          {/* Right: WhatsApp Message Form */}
          <div className="flex justify-center items-center">
            <form
              method="get"
              action="https://wa.me/1656860844"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white p-6 rounded-lg shadow-sm"
            >
              <label className="block text-sm font-semibold text-[#101010] mb-2">
                Send us a message on WhatsApp
              </label>
              <input
                name="text"
                type="text"
                placeholder="Type your message..."
                className="w-full px-3 py-2 bg-transparent border border-gray-400 rounded text-[#101010] placeholder-gray-500 focus:outline-none focus:border-orange-400"
              />
              <button
                type="submit"
                className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Send WhatsApp Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Google Form Section */}
      <section className="bg-[#F1EED0] py-16 relative overflow-hidden">
        {/* Subtle mandala decorations */}
        <div className="absolute top-8 right-8 w-40 h-40 opacity-10 pointer-events-none">
          <div className="w-full h-full border-4 border-[#601131] rounded-full flex items-center justify-center">
            <div className="w-28 h-28 border-2 border-[#601131] rounded-full flex items-center justify-center">
              <div className="w-16 h-16 border-2 border-[#601131] rounded-full" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-8 w-28 h-28 opacity-10 pointer-events-none">
          <div className="w-full h-full border-4 border-[#601131] rounded-full flex items-center justify-center">
            <div className="w-16 h-16 border-2 border-[#601131] rounded-full" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 relative z-10">
          {/* Section heading */}
          <div className="text-center mb-10">
            <p className="text-orange-500 font-semibold tracking-wide uppercase text-sm mb-2">
              We&apos;d Love to Hear From You
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#101010]">
              Share Your Feedback
            </h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px w-16 bg-[#601131]/30" />
              <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              <div className="h-px w-16 bg-[#601131]/30" />
            </div>
            <p className="text-gray-600 mt-4 text-sm max-w-md mx-auto">
              Your experience matters to us. Fill in the form below and help us serve you better.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
            {/* Card top bar */}
            <div className="bg-gradient-to-r from-[#601131] to-[#A63C4D] px-6 py-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              <span className="text-white font-semibold text-sm tracking-wide">Ty Malabar — Customer Feedback Form</span>
            </div>

            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLScgs1SvsuKQFZ5xppy4u6Miz9vMIK2PNxoGDdxpXXXA5qgpFA/viewform?embedded=true"
              width="100%"
              height="1260"
              frameBorder={0}
              marginHeight={0}
              marginWidth={0}
              title="Customer Feedback Form"
              className="block"
            >
              Loading…
            </iframe>
          </div>
        </div>
      </section>
    </main>
  );
}