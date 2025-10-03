'use client';
import { useEffect, useState } from 'react';
import { MenuCategory, countProductsInTree, findCategoryById, products } from './data';

type Props = {
  title?: string;
  tree: MenuCategory[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onClear?: () => void; // new: clear selection to show all items
};

export default function CategoryList({ title = 'All Menu', tree, selectedId = null, onSelect, onClear }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedId) return;
    const next = new Set(expanded);
    let cur = findCategoryById(selectedId);
    while (cur?.parentId) {
      next.add(cur.parentId);
      cur = findCategoryById(cur.parentId);
    }
    setExpanded(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const toggle = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const handleClear = () => {
    setExpanded(new Set());
    onClear?.();
  };

  const renderNodes = (nodes: MenuCategory[], level = 0) => (
    <ul className={level === 0 ? 'space-y-2' : 'mt-2 space-y-2'}>
      {nodes.map((c) => {
        const hasChildren = c.children.length > 0;
        const isExpanded = expanded.has(c.id);
        const count = countProductsInTree(c.id);
        const indent = level > 0 ? `pl-${Math.min(level * 4, 12)}` : '';

        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => {
                if (hasChildren) toggle(c.id);
                onSelect?.(c.id);
              }}
              className={`w-full flex items-center justify-between text-sm bg-[#EDE7C5] hover:bg-[#e5dfb3] rounded-md px-3 py-2 transition-colors ${indent}`}
            >
              <span className={`flex items-center gap-2 truncate text-[#601131] ${selectedId === c.id ? 'border-l-4 border-[#F0A429]' : ''}`}>
                {hasChildren ? (
                  <span className="inline-block w-4 text-[#601131]">{isExpanded ? '▾' : '▸'}</span>
                ) : (
                  <span className="inline-block w-4" />
                )}
                <span className={selectedId === c.id ? 'font-semibold' : ''}>{c.name}</span>
              </span>
              <span className="opacity-70">({count.toString().padStart(2, '0')})</span>
            </button>

            {hasChildren && isExpanded && (
              <div className="pl-4">{renderNodes(c.children, level + 1)}</div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside className="bg-[#F1EED0] rounded-xl p-4 font-poppins sticky top-25 max-h-[calc(100vh-6rem)] overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-[#601131]">{title}</h3>
      </div>
      <button
        type="button"
        onClick={handleClear}
        className={`w-full flex items-center justify-between text-sm bg-[#EDE7C5] hover:bg-[#e5dfb3] rounded-md px-3 py-2 transition-colors text-[#601131] mb-2`}
        aria-label="Show all menu items"
        title="Show All"
      >
        All ({products.length.toString().padStart(2, '0')})
      </button>
      {renderNodes(tree, 0)}
    </aside>
  );
}