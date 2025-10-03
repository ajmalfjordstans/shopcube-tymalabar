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
            <p className="text-sm text-gray-700 mb-6">
              Lorem ipsum dolor sit amet, consec tetur adipiscing elit sed do eiusmod tempor
              incid idunt ut labore et dolore magna aliqua. Ut enim ad mi veniam, quis nostrud
              exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
              dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.
            </p>

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
                  Lorem ipsum dolor sit amet, consec tetur adipiscing elit sed do eiusmod tempor inci
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
    </main>
  );
}