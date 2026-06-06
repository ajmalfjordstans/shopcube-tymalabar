import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ty Malabar - Authentic Indian Cuisine",
  description: "Experience the best Indian food in town. Fresh, authentic Kerala dishes delivered to your doorstep.",
  icons: {
    icon: "/logo/tymalabar.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
        <a
          href="tel:+441656860844"
          className="fixed bottom-6 right-6 z-[200] flex items-center justify-center w-14 h-14 rounded-full bg-[#F0A429] shadow-lg hover:bg-[#d48e20] transition-colors"
          aria-label="Call us"
        >
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 011 1V20a1 1 0 01-1 1C10.29 21 3 13.71 3 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.58a1 1 0 01-.24 1.01l-2.21 2.2z" />
          </svg>
        </a>
      </body>
    </html>
  );
}
