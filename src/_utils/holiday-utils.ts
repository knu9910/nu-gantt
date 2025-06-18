/**
 * 공휴일 관련 유틸리티 함수들
 */

import { Holiday } from "../types/gantt-types";

/**
 * 특정 날짜가 공휴일인지 확인하는 함수
 */
export const isHoliday = (date: string, holidays: Holiday[]): boolean => {
  return holidays.some((holiday) => holiday.date === date && holiday.isHoliday);
};
