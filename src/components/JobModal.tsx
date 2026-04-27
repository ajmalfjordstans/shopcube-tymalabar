'use client';

import { useState } from 'react';

export default function JobModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-300 hover:text-orange-300 transition-colors text-sm"
      >
        Jobs
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white text-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#601131] text-white rounded-t-2xl px-6 py-5 relative">
              <h2 className="text-xl font-bold pr-8">Now Hiring: Marketing Manager</h2>
              <p className="text-orange-200 text-sm mt-1">TY Malabar Pencoed – Bridgend</p>
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white text-2xl leading-none"
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 text-sm leading-relaxed">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Location</p>
                  <p className="mt-0.5">8 Hendre Rd, Pencoed, Bridgend CF35 5NW</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Salary</p>
                  <p className="mt-0.5">Competitive based on experience</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase font-semibold">Type</p>
                  <p className="mt-0.5">Full-Time, In-person</p>
                </div>
              </div>

              {/* About */}
              <div>
                <h3 className="font-bold text-[#601131] mb-1">About Us</h3>
                <p className="text-gray-600">
                  TY Malabar is committed to bringing the true spirit of the Malabar coast to the UK. We pride ourselves on traditional recipes, warm hospitality, and a vibrant dining atmosphere.
                </p>
              </div>

              {/* Responsibilities */}
              <div>
                <p className="font-semibold mb-1">Marketing & Brand Growth</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mb-3">
                  <li>Lead digital marketing initiatives to drive brand growth and increase customer engagement.</li>
                  <li>Develop and execute creative campaign strategies and promotional events.</li>
                </ul>
                <p className="font-semibold mb-1">Social Media & Content</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 mb-3">
                  <li>Manage and grow all social media channels (Instagram, Facebook, etc.) with a strong local focus.</li>
                  <li>Oversee content creation that captures the &quot;Authentic Flavours and Rich Heritage&quot; of TY Malabar.</li>
                </ul>
                <p className="font-semibold mb-1">Strategy & Audience</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Plan and execute integrated marketing campaigns across multiple platforms.</li>
                  <li>Utilize deep understanding of Indian cuisine to create content with high audience appeal.</li>
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="font-bold text-[#601131] mb-2">Mandatory Requirements</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>3+ years of experience in digital marketing and brand growth.</li>
                  <li>Strong skills in campaign planning, content creation, and promotions.</li>
                  <li>Proven ability to manage and grow social media channels and local presence.</li>
                  <li>Deep understanding of Indian cuisine and audience appeal.</li>
                  <li>Ready to bring your creativity to the table and &quot;Own the story.&quot;</li>
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="font-bold text-[#601131] mb-2">Benefits</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Competitive salary and performance-based bonuses.</li>
                  <li>Company pension and sick pay.</li>
                  <li>Discounted or free authentic South Indian meals on duty.</li>
                  <li>Career progression opportunities within a fast-growing brand.</li>
                  <li>Employee mentoring and a supportive work environment.</li>
                </ul>
              </div>

              {/* Apply CTA */}
              <div className="bg-[#601131]/5 border border-[#601131]/20 rounded-xl p-4">
                <h3 className="font-bold text-[#601131] mb-1">How to Apply</h3>
                <p className="text-gray-600 mb-3">
                  Send your CV and a brief cover letter highlighting your experience with Indian cuisine to:
                </p>
                <a
                  href="mailto:tymalabar@gmail.com?subject=Marketing Manager Application"
                  className="inline-block bg-[#601131] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#7a1840] transition-colors"
                >
                  Apply Now – tymalabar@gmail.com
                </a>
                <p className="text-xs text-gray-500 mt-2">Subject line: Marketing Manager Application – [Your Name]</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
