'use client';
import { useEffect } from 'react';
import { X, Clock } from 'lucide-react';

interface Props {
  storeName: string;
  reopenDay?: string;
  reopenTime?: string;
  preOrderEnabled: boolean;
  onClose: () => void;
}

export default function ClosedStoreModal({ storeName, reopenDay, reopenTime, preOrderEnabled, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center font-poppins">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-[#F1EED0] rounded-t-2xl sm:rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/60 transition-colors text-[#601131]"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Clock size={26} className="text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-[#601131]">We&apos;re closed right now</h2>

          <p className="text-sm text-gray-700">
            {storeName} isn&apos;t taking orders at the moment.
            {reopenTime && ` We'll be back ${reopenDay} at ${reopenTime}.`}
          </p>

          <p className={`text-sm font-semibold px-3 py-2 rounded-lg w-full ${preOrderEnabled ? 'bg-blue-50 text-blue-700' : 'bg-[#F5F5DC] text-[#601131]/50'}`}>
            {preOrderEnabled
              ? 'Pre-order is available right now.'
              : 'Pre-order is not available for this store right now.'}
          </p>

          {preOrderEnabled && (
            <p className="text-sm text-gray-700">
              You can still browse the menu and place a pre-order — choose{' '}
              <span className="font-semibold text-[#601131]">&quot;Schedule for later&quot;</span> at checkout to pick a time once we reopen.
            </p>
          )}

          <button
            onClick={onClose}
            className="mt-2 w-full py-3 rounded-xl bg-[#F0A429] hover:bg-[#e79b26] active:bg-[#d48e20] text-white font-bold transition-colors"
          >
            {preOrderEnabled ? 'Browse Menu & Pre-order' : 'Browse Menu'}
          </button>
        </div>
      </div>
    </div>
  );
}
