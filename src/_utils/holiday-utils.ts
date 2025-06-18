/**
 * 간트 차트에서 공휴일을 활용하기 위한 유틸리티 함수들
 */

import { Holiday } from "../types/gantt-types";
import { fetchHolidays, calculateDateRange } from "./holidays";

/**
 * 간트 차트 날짜 배열을 기반으로 공휴일 데이터를 가져오는 함수
 */
export const getHolidaysForGantt = async (
  dates: string[]
): Promise<Holiday[]> => {
  try {
    console.log("🎌 간트 차트용 공휴일 데이터 로드 시작");

    // 날짜 범위 계산
    const dateRange = calculateDateRange(dates);
    if (!dateRange) {
      console.warn("날짜 범위 계산 실패");
      return [];
    }

    // 공휴일 데이터 가져오기
    const holidays = await fetchHolidays(dateRange);

    // 간트 차트 날짜 범위에 포함된 공휴일만 필터링
    const filteredHolidays = holidays.filter((holiday) =>
      dates.includes(holiday.date)
    );

    console.log(
      `✅ ${filteredHolidays.length}개의 공휴일이 간트 차트 범위에 포함됨`
    );
    return filteredHolidays;
  } catch (error) {
    console.error("❌ 간트 차트용 공휴일 데이터 로드 실패:", error);
    return [];
  }
};

/**
 * 특정 날짜가 공휴일인지 확인하는 함수
 */
export const isHoliday = (date: string, holidays: Holiday[]): boolean => {
  return holidays.some((holiday) => holiday.date === date && holiday.isHoliday);
};

/**
 * 특정 날짜의 공휴일 정보를 가져오는 함수
 */
export const getHolidayInfo = (
  date: string,
  holidays: Holiday[]
): Holiday | null => {
  return holidays.find((holiday) => holiday.date === date) || null;
};

/**
 * 주말인지 확인하는 함수
 */
export const isWeekend = (date: string): boolean => {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0: 일요일, 6: 토요일
  return dayOfWeek === 0 || dayOfWeek === 6;
};

/**
 * 주말이거나 공휴일인지 확인하는 함수
 */
export const isWeekendOrHoliday = (
  date: string,
  holidays: Holiday[]
): boolean => {
  return isWeekend(date) || isHoliday(date, holidays);
};
