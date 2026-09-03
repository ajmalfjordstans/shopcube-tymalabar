'use client';
import { useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import SchedulePicker from './SchedulePicker';
import type { StoreHours } from '@/types/order';

interface Props {
  storeId: string;
  leadHours: number;
  maxDays: number;
  value?: string;
  onChange: (iso: string) => void;
  onClose: () => void;
  hoursData?: StoreHours[];
  closedNotice?: string;
}

export default function ScheduleModal({ storeId, leadHours, maxDays, value, onChange, onClose, hoursData, closedNotice }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  function handleSelect(iso: string) {
    onChange(iso);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-poppins">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:max-w-md bg-[#F1EED0] rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-[#D7CDA7] flex-shrink-0">
          <h2 className="text-lg font-bold text-[#601131] flex items-center gap-2">
            <Clock size={18} className="text-[#1976D2]" />
            Choose a time
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/60 transition-colors text-[#601131]">
            <X size={20} />
          </button>
        </div>

        {closedNotice && (
          <p className="mx-5 mt-4 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex-shrink-0">
            {closedNotice}
          </p>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          <SchedulePicker
            storeId={storeId}
            leadHours={leadHours}
            maxDays={maxDays}
            value={value}
            onChange={handleSelect}
            hoursData={hoursData}
          />
        </div>

        <p className="px-5 pb-5 pt-1 text-xs text-[#601131]/50 flex items-center gap-1.5 flex-shrink-0 border-t border-[#D7CDA7]/60">
          <Clock size={12} />
          Needs at least {leadHours} hour{leadHours === 1 ? '' : 's'} notice — orders can be scheduled up to {maxDays} day{maxDays === 1 ? '' : 's'} ahead.
        </p>
      </div>
    </div>
  );
}
