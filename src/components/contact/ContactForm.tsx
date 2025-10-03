'use client';

import React, { useState } from 'react';

type Props = {
  onSubmit?: (data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }) => Promise<void> | void;
};

export default function ContactForm({ onSubmit }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit?.(form);
      // You can replace this with your API call.
      console.log('Contact form submitted:', form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="font-poppins bg-[#F1EED0] border border-[#E0DAB5] rounded-2xl p-6 md:p-8 shadow-sm"
    >
      {/* Full name */}
      <label className="sr-only" htmlFor="name">Full name</label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Full name"
        value={form.name}
        onChange={handleChange}
        className="w-full mb-4 rounded-xl bg-white/70 px-4 py-3 text-[#601131] placeholder-[#601131]/70 outline-none focus:ring-2 focus:ring-[#F0A429]"
      />

      {/* Email */}
      <label className="sr-only" htmlFor="email">Email address</label>
      <input
        id="email"
        name="email"
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={handleChange}
        className="w-full mb-4 rounded-xl bg-white/70 px-4 py-3 text-[#601131] placeholder-[#601131]/70 outline-none focus:ring-2 focus:ring-[#F0A429]"
      />

      {/* Phone */}
      <label className="sr-only" htmlFor="phone">Phone number</label>
      <input
        id="phone"
        name="phone"
        type="tel"
        placeholder="Phone number"
        value={form.phone}
        onChange={handleChange}
        className="w-full mb-4 rounded-xl bg-white/70 px-4 py-3 text-[#601131] placeholder-[#601131]/70 outline-none focus:ring-2 focus:ring-[#F0A429]"
      />

      {/* Subject */}
      <label className="sr-only" htmlFor="subject">Subject</label>
      <input
        id="subject"
        name="subject"
        type="text"
        placeholder="Subject"
        value={form.subject}
        onChange={handleChange}
        className="w-full mb-4 rounded-xl bg-white/70 px-4 py-3 text-[#601131] placeholder-[#601131]/70 outline-none focus:ring-2 focus:ring-[#F0A429]"
      />

      {/* Message */}
      <label className="sr-only" htmlFor="message">Message</label>
      <textarea
        id="message"
        name="message"
        rows={6}
        placeholder="Subject"
        value={form.message}
        onChange={handleChange}
        className="w-full mb-6 rounded-xl bg-white/70 px-4 py-3 text-[#601131] placeholder-[#601131]/70 outline-none focus:ring-2 focus:ring-[#F0A429] resize-none"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#F0A429] hover:bg-[#e79b26] text-white font-semibold py-3 transition disabled:opacity-70"
      >
        {loading ? 'Sending...' : 'Send Message Now'}
      </button>
    </form>
  );
}