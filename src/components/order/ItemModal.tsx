'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Plus, Minus, Check } from 'lucide-react';
import { useCart } from '@/context/OrderCartContext';
import type { MenuItem, ModifierGroup, Modifier, SelectedModifier } from '@/types/order';
import { getMinItemPrice, hasRequiredModifiers } from '@/lib/order/pricing';
import toast from 'react-hot-toast';

interface Props {
  item: MenuItem;
  onClose: () => void;
}

type SelectionMap = Record<string, Set<string>>;

export default function ItemModal({ item, onClose }: Props) {
  const { addItem } = useCart();
  const basePrice = item.price ?? item.eatInPrice;
  // £0 items priced entirely via a required modifier group show the cheapest possible total in the header until the user picks one.
  const showFromPrice = basePrice === 0 && hasRequiredModifiers(item);
  const startingPrice = showFromPrice ? getMinItemPrice(item, 'TAKEAWAY') : basePrice;
  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<SelectionMap>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function toggleModifier(group: ModifierGroup, mod: Modifier) {
    setSelections(prev => {
      const current = new Set(prev[group.id] ?? []);
      if (current.has(mod.id)) {
        current.delete(mod.id);
      } else {
        if (!group.isMultiple) current.clear();
        current.add(mod.id);
      }
      return { ...prev, [group.id]: current };
    });
  }

  function isValid(): boolean {
    return item.modifierGroups
      .filter(g => g.isRequired)
      .every(g => (selections[g.id]?.size ?? 0) > 0);
  }

  function buildSelectedModifiers(): SelectedModifier[] {
    const result: SelectedModifier[] = [];
    for (const group of item.modifierGroups) {
      for (const mod of group.modifiers) {
        if (selections[group.id]?.has(mod.id)) {
          result.push({
            modifierId: mod.id,
            modifierName: mod.name,
            modifierGroupId: group.id,
            modifierGroupName: group.name,
            price: mod.price,
          });
        }
      }
    }
    return result;
  }

  function handleAdd() {
    if (!isValid() || justAdded) {
      if (!isValid()) toast.error('Please complete all required options.');
      return;
    }
    addItem({
      menuItemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      basePrice,
      taxRate: item.taxRate,
      quantity,
      selectedModifiers: buildSelectedModifiers(),
      specialInstructions: specialInstructions.trim() || undefined,
    });
    toast.success(`${item.name} added to order`);
    setJustAdded(true);
    setTimeout(onClose, 380);
  }

  const modifierTotal = buildSelectedModifiers().reduce((s, m) => s + m.price, 0);
  const lineTotal = (basePrice + modifierTotal) * quantity;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {item.imageUrl && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-2xl flex-shrink-0">
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
          </div>
        )}

        <div className="flex items-start justify-between p-5 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
            {item.description && (
              <p className="text-gray-500 text-sm mt-1">{item.description}</p>
            )}
            <p className="font-semibold text-gray-900 mt-1">
              {showFromPrice && <span className="font-medium text-gray-400 text-xs mr-1">From</span>}
              £{startingPrice.toFixed(2)}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2 space-y-6">
          {item.allergens.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Allergens</p>
              <div className="flex flex-wrap gap-2">
                {item.allergens.map(a => (
                  <span key={a.id} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    {a.icon} {a.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.modifierGroups.map(group => (
            <ModifierGroupSection
              key={group.id}
              group={group}
              selectedIds={selections[group.id] ?? new Set()}
              onToggle={(mod) => toggleModifier(group, mod)}
            />
          ))}

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 block mb-2">
              Special Instructions
            </label>
            <textarea
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              placeholder="Allergies, preferences…"
              rows={2}
              maxLength={200}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex-shrink-0 flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-40"
              disabled={quantity <= 1}
            >
              <Minus size={16} />
            </button>
            <span className="w-5 text-center font-semibold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            onClick={handleAdd}
            className={`flex-1 text-white font-semibold py-3 rounded-full transition-colors duration-200 flex items-center px-4 ${
              justAdded ? 'bg-green-500 justify-center gap-2' : 'bg-brand-500 hover:bg-brand-600 justify-between'
            }`}
          >
            {justAdded ? (
              <>
                <Check size={18} className="animate-bump" />
                <span>Added to order</span>
              </>
            ) : (
              <>
                <span>Add to order</span>
                <span>£{lineTotal.toFixed(2)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModifierGroupSection({
  group,
  selectedIds,
  onToggle,
}: {
  group: ModifierGroup;
  selectedIds: Set<string>;
  onToggle: (mod: Modifier) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-800">{group.name}</p>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          group.isRequired ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
        }`}>
          {group.isRequired ? 'Required' : 'Optional'}
        </span>
      </div>
      <div className="space-y-2">
        {group.modifiers.map(mod => {
          const selected = selectedIds.has(mod.id);
          return (
            <button
              key={mod.id}
              onClick={() => onToggle(mod)}
              className={`w-full flex items-center justify-between text-sm px-3 py-2.5 rounded-lg border transition-colors ${
                selected
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                  selected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                }`}>
                  {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span>{mod.name}</span>
              </div>
              {mod.price > 0 && (
                <span className="text-gray-500">+£{mod.price.toFixed(2)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
