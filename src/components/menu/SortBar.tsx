'use client';
type Props = {
  showingText: string;
  onSortChange?: (value: string) => void;
  // new: controlled search input wired to params
  searchText?: string;
  onSearchChange?: (value: string) => void;
};

export default function SortBar({ showingText, onSortChange, searchText = '', onSearchChange }: Props) {
  return (
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-6 font-poppins">
      {/* Search */}
      <div className="md:col-span-1">
        <div className="flex items-center bg-[#F1EED0] rounded-md px-3 py-2">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent outline-none text-sm text-[#601131]"
            value={searchText}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
          <span className="ml-2 text-[#601131]">🔍</span>
        </div>
      </div>

      {/* Sort dropdown */}
      <div className="md:col-span-1 flex justify-end">

        <div className="inline-flex items-center gap-2 bg-[#F1EED0] rounded-md px-3 py-2">
          <span className="text-sm text-[#601131]">Sort by</span>
          <select
            className="bg-transparent text-sm text-[#601131] outline-none"
            onChange={(e) => onSortChange?.(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name</option>
          </select>
        </div>

        {/* View PDF Menu button */}
        <div className="max-w-7xl mx-auto px-6  flex justify-end">
          <a
            href="/menu.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F0A429] text-[#601131] hover:bg-[#e5dfb3] transition"
          >
            View Menu
          </a>
        </div>
      </div>

      {/* Showing */}
      <div className="md:col-span-1 text-center text-xs text-gray-700">{showingText}</div>

    </div>
  );
}