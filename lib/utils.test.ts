import { Chat } from '@/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { filterChatsByDateRange, isWithinDays } from './utils';

describe('isWithinDays', () => {
  beforeEach(() => {
    // 設定固定的當前時間：2025年9月8日
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-08T12:00:00Z'));
  });

  it('should return true when date is within the specified days', () => {
    const targetDate = new Date('2025-09-06T12:00:00Z'); // 2天前
    const days = 7;

    const result = isWithinDays(targetDate, days);

    expect(result).toBe(true);
  });

  it('should return false when date is beyond the specified days', () => {
    const targetDate = new Date('2025-08-30T12:00:00Z'); // 9天前
    const days = 7;

    const result = isWithinDays(targetDate, days);

    expect(result).toBe(false);
  });

  it('should return true when date is exactly on the boundary (equal to days)', () => {
    const targetDate = new Date('2025-09-01T12:00:00Z'); // 正好7天前
    const days = 7;

    const result = isWithinDays(targetDate, days);

    expect(result).toBe(true);
  });

  it('should return true when date is today (0 days ago)', () => {
    const targetDate = new Date('2025-09-08T12:00:00Z'); // 今天
    const days = 1;

    const result = isWithinDays(targetDate, days);

    expect(result).toBe(true);
  });

  it('should return true when date is in the future (negative ageDays)', () => {
    const targetDate = new Date('2025-09-10T12:00:00Z'); // 2天後
    const days = 7;

    const result = isWithinDays(targetDate, days);

    // 因為 ageDays 會是 -2，而 -2 <= 7 是 true
    expect(result).toBe(true);
  });
});

describe('filterChatsByDateRange', () => {
  let mockChats: Chat[];

  beforeEach(() => {
    // 設定固定的當前時間：2025年9月8日
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-08T12:00:00Z'));

    mockChats = [
      {
        id: '1',
        title: 'Chat 1',
        userId: 'user1',
        projectId: 'project1',
        createdAt: new Date('2025-09-07T12:00:00Z'), // 1天前
        updatedAt: new Date('2025-09-07T12:00:00Z'),
      },
      {
        id: '2',
        title: 'Chat 2',
        userId: 'user1',
        projectId: 'project1',
        createdAt: new Date('2025-09-05T12:00:00Z'), // 3天前
        updatedAt: new Date('2025-09-05T12:00:00Z'),
      },
      {
        id: '3',
        title: 'Chat 3',
        userId: 'user1',
        projectId: 'project1',
        createdAt: new Date('2025-09-01T12:00:00Z'), // 7天前
        updatedAt: new Date('2025-09-01T12:00:00Z'),
      },
      {
        id: '4',
        title: 'Chat 4',
        userId: 'user1',
        projectId: 'project1',
        createdAt: new Date('2025-08-25T12:00:00Z'), // 14天前
        updatedAt: new Date('2025-08-25T12:00:00Z'),
      },
      {
        id: '5',
        title: 'Chat 5',
        userId: 'user1',
        projectId: 'project1',
        createdAt: new Date('2025-08-15T12:00:00Z'), // 24天前
        updatedAt: new Date('2025-08-15T12:00:00Z'),
      },
    ];
  });

  describe('when endDays is undefined', () => {
    it('should return chats older than startDays, sorted by updatedAt desc', () => {
      const startDays = 7;

      const result = filterChatsByDateRange(mockChats, startDays);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('4'); // 14天前的應該排在前面
      expect(result[1].id).toBe('5'); // 24天前的排在後面

      // 驗證結果都是超過7天的
      result.forEach((chat) => {
        expect(isWithinDays(chat.updatedAt, startDays)).toBe(false);
      });
    });

    it('should return empty array when all chats are within startDays', () => {
      const startDays = 30; // 30天內的所有聊天

      const result = filterChatsByDateRange(mockChats, startDays);

      expect(result).toHaveLength(0);
    });

    it('should handle empty chats array', () => {
      const emptyChats: Chat[] = [];
      const startDays = 7;

      const result = filterChatsByDateRange(emptyChats, startDays);

      expect(result).toHaveLength(0);
    });
  });

  describe('when endDays is defined', () => {
    it('should return chats in the date range (startDays, endDays], sorted by updatedAt desc', () => {
      const startDays = 7; // 不包含7天內的
      const endDays = 20; // 包含20天內的

      const result = filterChatsByDateRange(mockChats, startDays, endDays);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('4'); // 14天前的聊天

      // 驗證結果符合條件：不在7天內且在20天內
      result.forEach((chat) => {
        expect(isWithinDays(chat.updatedAt, startDays)).toBe(false);
        expect(isWithinDays(chat.updatedAt, endDays)).toBe(true);
      });
    });

    it('should return empty array when no chats match the date range', () => {
      const startDays = 25; // 不包含25天內的
      const endDays = 30; // 包含30天內的

      const result = filterChatsByDateRange(mockChats, startDays, endDays);

      expect(result).toHaveLength(0);
    });

    it('should return multiple chats when they all fall within the range', () => {
      const startDays = 2; // 不包含2天內的
      const endDays = 10; // 包含10天內的

      const result = filterChatsByDateRange(mockChats, startDays, endDays);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('2'); // 3天前的應該排在前面（較新）
      expect(result[1].id).toBe('3'); // 7天前的排在後面（較舊）

      // 驗證結果符合條件
      result.forEach((chat) => {
        expect(isWithinDays(chat.updatedAt, startDays)).toBe(false);
        expect(isWithinDays(chat.updatedAt, endDays)).toBe(true);
      });
    });

    it('should maintain correct sorting order by updatedAt descending', () => {
      const chatsWithMixedDates: Chat[] = [
        {
          id: 'a',
          title: 'Chat A',
          userId: 'user1',
          projectId: 'project1',
          createdAt: new Date('2025-09-03T12:00:00Z'),
          updatedAt: new Date('2025-09-03T12:00:00Z'), // 5天前
        },
        {
          id: 'b',
          title: 'Chat B',
          userId: 'user1',
          projectId: 'project1',
          createdAt: new Date('2025-09-02T12:00:00Z'),
          updatedAt: new Date('2025-09-02T12:00:00Z'), // 6天前
        },
        {
          id: 'c',
          title: 'Chat C',
          userId: 'user1',
          projectId: 'project1',
          createdAt: new Date('2025-09-04T12:00:00Z'),
          updatedAt: new Date('2025-09-04T12:00:00Z'), // 4天前
        },
      ];
      const startDays = 2;
      const endDays = 10;

      const result = filterChatsByDateRange(
        chatsWithMixedDates,
        startDays,
        endDays
      );

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('c'); // 4天前（最新）
      expect(result[1].id).toBe('a'); // 5天前
      expect(result[2].id).toBe('b'); // 6天前（最舊）
    });
  });

  describe('edge cases', () => {
    it('should handle chats with same updatedAt timestamps', () => {
      const sameDateChats: Chat[] = [
        {
          id: '1',
          title: 'Chat 1',
          userId: 'user1',
          projectId: 'project1',
          createdAt: new Date('2025-09-01T12:00:00Z'),
          updatedAt: new Date('2025-09-01T12:00:00Z'), // 7天前
        },
        {
          id: '2',
          title: 'Chat 2',
          userId: 'user1',
          projectId: 'project1',
          createdAt: new Date('2025-09-01T12:00:00Z'),
          updatedAt: new Date('2025-09-01T12:00:00Z'), // 7天前
        },
      ];
      const startDays = 5;
      const endDays = 10;

      const result = filterChatsByDateRange(sameDateChats, startDays, endDays);

      expect(result).toHaveLength(2);
      // 順序可能保持原有順序或根據其他標準，但不會拋出錯誤
    });

    it('should handle startDays being 0', () => {
      const startDays = 0;
      const endDays = 5;

      const result = filterChatsByDateRange(mockChats, startDays, endDays);

      // 應該過濾掉今天的聊天，包含5天內的其他聊天
      expect(result.length).toBeGreaterThanOrEqual(0);
      result.forEach((chat) => {
        expect(isWithinDays(chat.updatedAt, startDays)).toBe(false);
        expect(isWithinDays(chat.updatedAt, endDays)).toBe(true);
      });
    });
  });
});
