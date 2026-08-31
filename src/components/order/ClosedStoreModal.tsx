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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex flex-col items-center text-center gap-3 pt-2">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <Clock size={26} className="text-red-500" />
          </div>

          <h2 className="text-lg font-bold text-gray-900">We&apos;re closed right now</h2>

          <p className="text-sm text-gray-500">
            {storeName} isn&apos;t taking orders at the moment.
            {reopenTime && ` We'll be back ${reopenDay} at ${reopenTime}.`}
          </p>

          <p className={`text-sm font-semibold px-3 py-2 rounded-lg w-full ${preOrderEnabled ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            {preOrderEnabled
              ? 'Pre-order is available right now.'
              : 'Pre-order is not available for this store right now.'}
          </p>

          {preOrderEnabled && (
            <p className="text-sm text-gray-500">
              You can still browse the menu and place a pre-order — choose{' '}
              <span className="font-semibold text-gray-700">&quot;Schedule for later&quot;</span> at checkout to pick a time once we reopen.
            </p>
          )}

          <button
            onClick={onClose}
            className="mt-2 w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-400 active:bg-brand-600 text-white font-bold transition-colors"
          >
            {preOrderEnabled ? 'Browse Menu & Pre-order' : 'Browse Menu'}
          </button>
        </div>
      </div>
    </div>
  );
}
