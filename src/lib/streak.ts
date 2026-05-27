"use client";

export interface StreakState {
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  weeklyProgress: boolean[]; // 7 elements, index 0 = Mon, 6 = Sun
  weekStartDate: string; // YYYY-MM-DD (Monday of the active week)
}

const getFormattedDate = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// Gets the Monday of the week containing the given date
const getMondayOf = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(date.setDate(diff));
  mon.setHours(0, 0, 0, 0);
  return mon;
};

const DEFAULT_STATE = (): StreakState => {
  const today = new Date();
  const monday = getMondayOf(today);
  
  return {
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: "",
    weeklyProgress: [false, false, false, false, false, false, false],
    weekStartDate: getFormattedDate(monday),
  };
};

export const getStreakData = (): StreakState => {
  if (typeof window === "undefined") return DEFAULT_STATE();
  
  const saved = localStorage.getItem("chess_user_streak");
  if (!saved) {
    const fresh = DEFAULT_STATE();
    localStorage.setItem("chess_user_streak", JSON.stringify(fresh));
    return fresh;
  }

  try {
    const data: StreakState = JSON.parse(saved);
    
    // Check if we migrated to a new week
    const today = new Date();
    const currentMondayStr = getFormattedDate(getMondayOf(today));
    
    if (data.weekStartDate !== currentMondayStr) {
      // It is a new week! Reset the weekly progress array, but KEEP streaks
      data.weeklyProgress = [false, false, false, false, false, false, false];
      data.weekStartDate = currentMondayStr;
      localStorage.setItem("chess_user_streak", JSON.stringify(data));
    }

    return data;
  } catch {
    return DEFAULT_STATE();
  }
};

export const saveStreakData = (data: StreakState) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("chess_user_streak", JSON.stringify(data));
  }
};

/**
 * Validates if the streak was broken (i.e. more than 1 day missed since last active)
 */
export const checkStreakIntegrity = (): StreakState => {
  const data = getStreakData();
  if (!data.lastActiveDate) return data;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = new Date(data.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(today.getTime() - lastActive.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    // Over a day of inactivity! Reset current streak to 0 (but retain bestStreak)
    data.currentStreak = 0;
    saveStreakData(data);
  }

  return data;
};

/**
 * Claims today's daily streak. Increments stats if it is the first activity of the day.
 */
export const claimTodayStreak = (): { data: StreakState; newlyClaimed: boolean } => {
  const data = getStreakData();
  const today = new Date();
  const todayStr = getFormattedDate(today);

  // If already claimed today, do nothing
  if (data.lastActiveDate === todayStr) {
    return { data, newlyClaimed: false };
  }

  // Check if we are continuing a yesterday streak or starting fresh
  let isConsecutive = false;
  if (data.lastActiveDate) {
    const lastActive = new Date(data.lastActiveDate);
    lastActive.setHours(0,0,0,0);
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0,0,0,0);

    if (lastActive.getTime() === yesterday.getTime()) {
      isConsecutive = true;
    }
  }

  if (isConsecutive) {
    data.currentStreak += 1;
  } else {
    data.currentStreak = 1;
  }

  // Update best streak
  if (data.currentStreak > data.bestStreak) {
    data.bestStreak = data.currentStreak;
  }

  // Update weekly progress index (0 = Monday, 6 = Sunday)
  let dayIndex = today.getDay() - 1; // getDay: 0 is Sun, 1 is Mon...
  if (dayIndex === -1) dayIndex = 6; // convert Sun to index 6

  data.weeklyProgress[dayIndex] = true;
  data.lastActiveDate = todayStr;

  saveStreakData(data);
  return { data, newlyClaimed: true };
};
