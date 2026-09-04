'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const isOrderSection = pathname?.startsWith('/order') ?? false;
  // The ordering pages have their own sticky search bar competing for the same
  // space, and the scroll-story home page wants the nav out of the way of its
  // pinned sections — auto-hide the nav on scroll-down for both. The story now
  // renders at both "/" (the live home page) and "/home-v3" (kept as a direct
  // link to the same page), so both need to match here.
  const isHomeStory = pathname === '/' || (pathname?.startsWith('/home-v3') ?? false);
  const autoHideSection = isOrderSection || isHomeStory;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);

      if (autoHideSection) {
        const goingDown = scrollTop > lastScrollY.current;
        setIsHidden(goingDown && scrollTop > 120);
      } else {
        setIsHidden(false);
      }
      lastScrollY.current = scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [autoHideSection]);

  // Reset when navigating away so the nav doesn't stay hidden elsewhere.
  useEffect(() => {
    if (!autoHideSection) setIsHidden(false);
  }, [autoHideSection]);

  // This nav is position:fixed with a higher z-index than the ordering page's own
  // sticky search/category bar, so that bar would otherwise stick underneath it
  // whenever this nav is visible. Publish this nav's live rendered height (0 while
  // hidden) as a CSS variable so the ordering page can offset its sticky elements
  // below it instead of overlapping. A small floor keeps a breathing gap above the
  // sticky bar even once this nav is fully hidden, instead of it touching the very
  // edge of the viewport.
  useEffect(() => {
    const h = navRef.current?.offsetHeight ?? 0;
    document.documentElement.style.setProperty(
      '--site-nav-offset',
      isOrderSection ? (isHidden ? '8px' : `${h + 8}px`) : '0px'
    );
  }, [isScrolled, isHidden, isOrderSection]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <nav ref={navRef} className={`px-4 sm:px-6 fixed z-[90] w-full top-0 transition-all duration-300 font-poppins ${isHidden ? '-translate-y-full' : 'translate-y-0'} ${isScrolled
        ? 'bg-[#601131] py-1 shadow-lg backdrop-blur-sm'
        : 'bg-transparent py-4'
        }`}>
        <div className={`max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 items-center pb-2 ${isScrolled
          ? ''
          : 'border-b-2 border-[#FFF]'
          }`}>
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-white font-bold text-lg sm:text-xl">
              <Image src="/logo/tymalabar.png" alt="Logo" width={200} height={80} />
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex justify-center items-center space-x-8">
            {/* <div className="relative group">
              <button className="text-white hover:text-orange-300 transition-colors flex items-center space-x-1 font-medium">
                <span>Home</span>
              </button>
            </div> */}
            <Link href="/" className="text-white hover:text-orange-300 transition-colors font-medium">Home</Link>
            <Link href="/menu" className="text-white hover:text-orange-300 transition-colors font-medium">Menu</Link>
            <Link href="/rewards" className="text-white hover:text-orange-300 transition-colors font-medium">Rewards</Link>
            <Link href="/contact" className="text-white hover:text-orange-300 transition-colors font-medium">Contact</Link>
          </div>

          {/* Desktop Right Side Icons */}
          <div className="hidden md:flex justify-end items-center space-x-3 lg:space-x-4">
            <Link href="tel:+1656860844" className="hover:text-[#A63C4D] bg-[#F0A429] text-white px-4 py-2 rounded-md transition-colors">
              Call Now
            </Link>
            {/* <button className="text-white hover:text-orange-300 transition-colors p-2">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-white hover:text-orange-300 transition-colors p-2 relative">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-orange-400 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">0</span>
            </button>
            <button className="text-white hover:text-orange-300 transition-colors p-2">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="text-white hover:text-orange-300 transition-colors p-2">
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center justify-end space-x-2">
            {/* Hamburger Menu */}
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-orange-300 transition-colors p-2 relative z-[100]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] backdrop-blur-md bg-opacity-50 md:hidden" onClick={toggleMobileMenu}>2
          <div
            className="fixed top-0 right-0 h-full w-80 bg-[#8B2635] shadow-xl transform transition-transform duration-300 font-poppins"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-end">
                  <button
                    onClick={toggleMobileMenu}
                    className="text-white hover:text-orange-300 transition-colors p-2 relative z-[100]"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                      />
                    </svg>
                  </button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="">
                  {/* <div className="border-b border-orange-300 pb-4">
                  <button className="text-white hover:text-orange-300 transition-colors flex items-center justify-between w-full font-medium text-lg">
                    <span>Home</span>
                  </button>
                </div> */}
                  <Link
                    href="/"
                    className="block text-white hover:text-orange-300 transition-colors font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    Home
                  </Link>

                  <Link
                    href="/menu"
                    className="block text-white hover:text-orange-300 transition-colors font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    Menu
                  </Link>

                  <Link
                    href="/rewards"
                    className="block text-white hover:text-orange-300 transition-colors font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    Rewards
                  </Link>

                  {/*<
                    href="/about"
                    className="block text-white hover:text-orange-300 transition-colors font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    About
                  </a> */}

                  <Link
                    href="/contact"
                    className="block text-white hover:text-orange-300 transition-colors font-medium text-lg py-2"
                    onClick={toggleMobileMenu}
                  >
                    Contact
                  </Link>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="mt-8 space-y-4">
                <a
                  href="https://tymalabaronline.com/menu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center bg-orange-400 hover:bg-orange-500 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Order Now
                </a>

                {/* Mobile Icons */}
                <div className="flex justify-center space-x-6 pt-4">
                  <button className="text-white hover:text-orange-300 transition-colors p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  <button className="text-white hover:text-orange-300 transition-colors p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                  <button className="text-white hover:text-orange-300 transition-colors p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;