import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs';
import { Chat } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isWithinDays(date: Date, days: number): boolean {
  const ageDays = dayjs().diff(date, 'day');
  return ageDays <= days;
}

export function filterChatsByDateRange(
  chats: Chat[],
  startDays: number,
  endDays?: number
) {
  return chats
    .filter((chat) => {
      const date = chat.updatedAt;

      if (endDays === undefined) {
        // 無 endDays：ageDays > startDays 等同於不在最近 startDays 天內
        return !isWithinDays(date, startDays);
      }
      // 有範圍：(startDays, endDays] -> 不在 startDays 內且在 endDays 內
      return !isWithinDays(date, startDays) && isWithinDays(date, endDays);
    })
    .sort(
      (a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf()
    );
}
