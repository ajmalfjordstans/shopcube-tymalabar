import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[#601131] relative overflow-hidden min-h-[100dvh] md:min-h-[90vh] flex items-end py-20">
        {/* Background Doodle Overlay */}
        <div className="absolute inset-0 ">
          <Image
            src="/background/doodle.avif"
            alt="Decorative background pattern"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {/* Decorative mandala pattern */}
        <div className="absolute top-10 right-10 w-64 h-64 opacity-30 z-10">
          <div className="w-full h-full border-4 border-orange-300 rounded-full flex items-center justify-center">
            <div className="w-48 h-48 border-2 border-orange-300 rounded-full flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-orange-300 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <p className="text-orange-300 mb-4 text-lg">Good Food Good Life</p>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Experience The Best
                Food In Town
              </h1>
              <p className="text-lg mb-8 text-gray-200 leading-relaxed">
                Here at Ty Malabar, we are constantly striving to improve our service and quality
                in order to give our customers the very best experience
              </p>
              <Link href="/menu">
                <button className="bg-[#F1EED0] hover:bg-orange-500 hover:cursor-pointer text-black font-semibold px-8 py-3 rounded-lg transition-colors">
                  Explore Menu
                </button>
              </Link>
            </div>

            {/* Right Content - Food Image */}
            <div className="flex justify-end">
              <Image
                src="/images/home/biriyani.png"
                alt="Delicious food"
                width={300}
                height={300}
                className="object-contain object-center rounded-full w-[450px]"
              />
            </div>
          </div>
        </div>

      </section>

      {/* Features Section */}
      <section className="bg-[#F1EED0] py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Authentic Flavors */}
            <div className="text-center">
              <Image
                src="/icons/authentic.svg"
                alt="Authentic icon"
                width={40}
                height={40}
                className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Authentic Flavors</h3>
              <p className="text-gray-600">Kerala's traditional dishes await</p>
            </div>

            {/* Fast Delivery */}
            <div className="text-center">
              <Image
                src="/icons/delivery.svg"
                alt="Delivery icon"
                width={40}
                height={40}
                className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-600">Hot meals at your doorstep</p>
            </div>

            {/* Budget Catering */}
            <div className="text-center">
              <Image
                src="/icons/catering.svg"
                alt="Catering icon"
                width={40}
                height={40}
                className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Budget Catering</h3>
              <p className="text-gray-600">Affordable event catering</p>
            </div>

            {/* Customized Meals */}
            <div className="text-center">
              <Image
                src="/icons/customised.svg"
                alt="Customised icon"
                width={40}
                height={40}
                className="w-16 h-16 rounded-lg mx-auto mb-4 flex items-center justify-center"
              />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Customized Meals</h3>
              <p className="text-gray-600">Personalized dining plans</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-[#F5F5DC] py-16 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left - Image */}
            <div className="relative">
              <Image
                src="/images/home/location.png"
                alt="About image"
                width={400}
                height={400}
                className="object-contain object-center rounded-full w-full"
              />
            </div>

            {/* Right - Content */}
            <div>
              <p className="text-orange-500 font-semibold mb-2">Who We Are</p>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                A Culinary Journey Through<br />
                Tradition And Taste
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Ty Malabar offers a unique taste of India with a variety of traditional dishes
                expertly crafted for your enjoyment. Located in Pencoed, we serve the
                surrounding areas with fresh, flavorful meals through our easy-to-use online
                ordering platform.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span className="text-gray-700">Authentic Indian cuisine</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span className="text-gray-700">Easy online ordering</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span className="text-gray-700">Fresh, quality ingredients</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  <span className="text-gray-700">Tradition meets innovation</span>
                </div>
              </div>

              {/* <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Load More →
              </button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="bg-gradient-to-b from-[#FFFDF5] to-[#F5F5DC] py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/images/patterns/food-pattern.png')] bg-cover"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <p className="text-orange-600 font-semibold tracking-wide uppercase mb-3">
            Our Popular Dishes
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-14 text-gray-800">
            Choose Your Best Menu
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Left Menu Items */}
            <div className="space-y-8">
              {[
                { name: "Pilav Rice", desc: "Contains Dairy, veg", rating: 5 },
                { name: "Onion Bhoji", desc: "Homemade crunchy snack", rating: 4 },
                { name: "Malabar Beef Curry", desc: "Mustard beef, Malabar spices", rating: 4 },
              ].map((dish, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 bg-white p-5 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition transform duration-300 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                    🍲
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{dish.name}</h3>
                    <p className="text-sm text-gray-600">{dish.desc}</p>
                    <div className="flex text-orange-500 text-sm">
                      {"★".repeat(dish.rating)}{"☆".repeat(5 - dish.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Center Image */}
            <div className="relative">
              <div className="w-80 h-80 bg-gradient-to-br from-orange-400 to-red-500 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <Image
                  src="/images/food/full_tandoori_chicken.png"
                  alt="Main Dish Image"
                  width={300}
                  height={300}
                  className="rounded-full shadow-lg hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-yellow-300 rounded-full blur-2xl opacity-50"></div>
            </div>

            {/* Right Menu Items */}
            <div className="space-y-8">
              {[
                { name: "Prawn Allepy Curry", desc: "Prawn in mango-coconut gravy", rating: 5 },
                { name: "Chicken Makhani", desc: "Creamy chicken in tomato gravy", rating: 4 },
                { name: "Bombay Aloo Side", desc: "Cumin-turmeric spiced potatoes", rating: 4 },
              ].map((dish, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 bg-white p-5 rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition transform duration-300 cursor-pointer"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold">
                    🍛
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-800">{dish.name}</h3>
                    <p className="text-sm text-gray-600">{dish.desc}</p>
                    <div className="flex text-orange-500 text-sm">
                      {"★".repeat(dish.rating)}{"☆".repeat(5 - dish.rating)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 bg-gradient-to-r from-[#601131] to-[#A63C4D] text-white py-10 px-8 rounded-2xl shadow-lg max-w-3xl mx-auto">
            <p className="text-lg mb-3">
              Discover the rich flavors that our customers rave about.
            </p>
            <p className="text-xl font-semibold">
              Each dish is a perfect blend of tradition and taste.
            </p>
            <Link href="/menu">
              <button className="mt-6 bg-white text-[#601131] font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition">
                Explore Full Menu
              </button>
            </Link>
          </div>
        </div>
      </section>


      {/* Order Process Section */}
      <section className="bg-[#F5F5DC] py-16 relative">
        {/* Torn paper effect at top */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-[#8B2635] transform -skew-y-1 origin-top-left"></div>

        <div className="max-w-7xl mx-auto px-6 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <p className="text-orange-500 font-semibold mb-2">The Ty Malabar Way</p>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">
                Select, Pay, and Enjoy Freshly<br />
                Delivered Indian Cuisine
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Enjoy authentic Indian dishes at Ty Malabar. Order, pay online, and get fresh food delivery.
              </p>
              <a href="tel:01656860844" className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Order Now
              </a>
              {/* <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                Order Now
              </button> */}
            </div>

            {/* Right - Process Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-orange-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Pick A Dish</h3>
                <p className="text-sm text-gray-600">Pick the one you like most from our delicious menu.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-orange-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Make Payment</h3>
                <p className="text-sm text-gray-600">You can now pay online for your food.</p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="w-16 h-16 bg-orange-400 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">Receive Your Food</h3>
                <p className="text-sm text-gray-600">We will bring you food to your doorstep.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;