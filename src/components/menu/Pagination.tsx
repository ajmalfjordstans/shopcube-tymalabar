'use client';
type Props = {
  currentPage: number;
  totalPages: number;
  onChange?: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onChange }: Props) {
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const prev = () => {
    if (prevDisabled) return;
    onChange?.(Math.max(1, currentPage - 1));
    scrollToMenu();
  };
  const next = () => {
    if (nextDisabled) return;
    onChange?.(Math.min(totalPages, currentPage + 1));
    scrollToMenu();
  };

  return (
    <div className="flex items-center justify-center gap-3 mt-8 font-poppins">
      <button
        onClick={prev}
        disabled={prevDisabled}
        aria-disabled={prevDisabled}
        className="px-4 py-2 rounded-full bg-[#EDE7C5] text-[#601131] hover:bg-[#e5dfb3] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ‹ Prev
      </button>
      <span className="px-5 py-2 rounded-full bg-[#601131] text-white">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={next}
        disabled={nextDisabled}
        aria-disabled={nextDisabled}
        className="px-4 py-2 rounded-full bg-[#EDE7C5] text-[#601131] hover:bg-[#e5dfb3] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next ›
      </button>
    </div>
  );
}