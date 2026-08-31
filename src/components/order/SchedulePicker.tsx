'use client';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStoreHoursApi } from '@/lib/order/api';
import type { StoreHours } from '@/types/order';

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SLOT_MINUTES = 15;

interface DaySlots {
  date: Date;
  slots: Date[];
}

function getTimeSlots(date: Date, entry: StoreHours, leadHours: number): Date[] {
  if (!entry.openTime || !entry.closeTime) return [];
  const result: Date[] = [];
  const minTime = new Date(Date.now() + leadHours * 3600000);

  const [oh, om] = entry.openTime.split(':').map(Number);
  const [ch, cm] = entry.closeTime.split(':').map(Number);

  const cursor = new Date(date);
  cursor.setHours(oh, om, 0, 0);
  const closeTime = new Date(date);
  closeTime.setHours(ch, cm, 0, 0);

  while (cursor < closeTime) {
    if (cursor > minTime) result.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + SLOT_MINUTES);
  }
  return result;
}

function getAvailableDates(storeHours: StoreHours[], leadHours: number, maxDays: number): DaySlots[] {
  const results: DaySlots[] = [];
  for (let i = 0; i < maxDays; i++) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);

    const entry = storeHours.find(h => h.dayOfWeek === d.getDay() && h.isOpen !== false);
    if (!entry) continue;

    const slots = getTimeSlots(d, entry, leadHours);
    if (slots.length > 0) results.push({ date: d, slots });
  }
  return results;
}

function formatDateChip(date: Date): { day: string; num: number; month: string } {
  return { day: DAY_SHORT[date.getDay()], num: date.getDate(), month: MONTH_SHORT[date.getMonth()] };
}

function formatTimeSlot(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function isSameSlot(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate() &&
    a.getHours() === b.getHours() &&
    a.getMinutes() === b.getMinutes();
}

const PERIODS = [
  { label: 'Morning', test: (h: number) => h < 12 },
  { label: 'Afternoon', test: (h: number) => h >= 12 && h < 17 },
  { label: 'Evening', test: (h: number) => h >= 17 },
];

function groupSlotsByPeriod(slots: Date[]): { label: string; slots: Date[] }[] {
  return PERIODS
    .map(period => ({ label: period.label, slots: slots.filter(s => period.test(s.getHours())) }))
    .filter(group => group.slots.length > 0);
}

interface SchedulePickerProps {
  storeId: string;
  leadHours: number;
  maxDays: number;
  value?: string;
  onChange: (iso: string) => void;
  hoursData?: StoreHours[];
}

export default function SchedulePicker({ storeId, leadHours, maxDays, value, onChange, hoursData }: SchedulePickerProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['order-storeHours', storeId],
    queryFn: () => getStoreHoursApi(storeId),
    enabled: !!storeId && !hoursData,
  });

  const storeHours = useMemo(() => hoursData ?? data?.data ?? [], [hoursData, data]);
  const availableDates = useMemo(
    () => getAvailableDates(storeHours, leadHours, maxDays),
    [storeHours, leadHours, maxDays]
  );

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (availableDates.length === 0) {
      setSelectedDate(null);
      return;
    }
    if (selectedDate && availableDates.some(d => d.date.toDateString() === selectedDate.toDateString())) {
      return;
    }
    if (value) {
      const existing = new Date(value);
      const match = availableDates.find(d => d.date.toDateString() === existing.toDateString());
      if (match) {
        setSelectedDate(match.date);
        return;
      }
    }
    setSelectedDate(availableDates[0].date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableDates]);

  const selectedEntry = availableDates.find(
    d => selectedDate && d.date.toDateString() === selectedDate.toDateString()
  );
  const timeSlots = selectedEntry?.slots ?? [];
  const periodGroups = useMemo(() => groupSlotsByPeriod(timeSlots), [timeSlots]);
  const selectedSlot = value ? new Date(value) : null;

  const [activePeriod, setActivePeriod] = useState<string | null>(null);

  useEffect(() => {
    if (periodGroups.length === 0) {
      setActivePeriod(null);
      return;
    }
    if (activePeriod && periodGroups.some(g => g.label === activePeriod)) return;

    if (selectedSlot) {
      const match = periodGroups.find(g => g.slots.some(s => isSameSlot(s, selectedSlot)));
      if (match) {
        setActivePeriod(match.label);
        return;
      }
    }
    setActivePeriod(periodGroups[0].label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodGroups]);

  const activeSlots = periodGroups.find(g => g.label === activePeriod)?.slots ?? [];

  if (isLoading && !hoursData) {
    return <p className="text-sm text-gray-400">Loading available times…</p>;
  }

  if (availableDates.length === 0) {
    return <p className="text-sm text-gray-400">No available slots in the next {maxDays} day{maxDays === 1 ? '' : 's'}.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
        {availableDates.map(({ date }) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const { day, num, month } = formatDateChip(date);
          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => setSelectedDate(date)}
              className={`flex flex-col items-center justify-center min-w-[60px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors shrink-0 ${
                isSelected ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
              }`}
            >
              <span>{day}</span>
              <span className="text-base font-bold text-gray-900">{num}</span>
              <span>{month}</span>
            </button>
          );
        })}
      </div>

      {periodGroups.length > 0 ? (
        <div className="space-y-3">
          <div className="flex gap-2">
            {periodGroups.map(group => {
              const isActive = group.label === activePeriod;
              return (
                <button
                  key={group.label}
                  type="button"
                  onClick={() => setActivePeriod(group.label)}
                  className={`flex-1 text-sm font-semibold py-2 rounded-lg border transition-colors ${
                    isActive ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {group.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {activeSlots.map(slot => {
              const isChosen = !!selectedSlot && isSameSlot(slot, selectedSlot);
              return (
                <button
                  key={slot.toISOString()}
                  type="button"
                  onClick={() => onChange(slot.toISOString())}
                  className={`py-2.5 rounded-xl border text-sm font-semibold text-center transition-colors ${
                    isChosen
                      ? 'border-brand-500 bg-brand-500 text-white shadow-sm'
                      : 'border-gray-200 text-gray-700 hover:border-brand-300 hover:bg-brand-50'
                  }`}
                >
                  {formatTimeSlot(slot)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">No available times on this day.</p>
      )}
    </div>
  );
}
