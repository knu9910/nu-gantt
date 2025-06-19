import { Task } from "../types/gantt-types";
import {
  DEFAULT_DATE_RANGE_DAYS,
  DATE_RANGE_BUFFER_DAYS,
} from "../_constants/gantt-constants";

// ==========================================
// 날짜 관련 유틸리티 함수들
// ==========================================

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환
 */
export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * 월별 최소 날짜 수를 보장하는 날짜 범위 조정 함수
 */
const adjustDateRangeForMonthlyMinimum = (
  startDate: Date,
  endDate: Date
): { adjustedStart: Date; adjustedEnd: Date } => {
  const adjustedStart = new Date(startDate);
  const adjustedEnd = new Date(endDate);

  // 시작 월의 1일로 이동하여 월 전체를 포함하도록 함
  adjustedStart.setDate(1);

  // 각 월마다 최소 10일 보장을 위한 추가 로직
  const currentDate = new Date(adjustedStart);
  const monthsToCheck: Array<{ year: number; month: number }> = [];

  // 시작일부터 종료일까지 포함된 모든 월 수집
  while (currentDate <= adjustedEnd) {
    monthsToCheck.push({
      year: currentDate.getFullYear(),
      month: currentDate.getMonth(),
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
    currentDate.setDate(1);
  }

  // 각 월마다 최소 10일 보장
  monthsToCheck.forEach(({ year, month }) => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0); // 해당 월의 마지막 날

    // 현재 범위에서 해당 월에 포함된 날짜 수 계산
    const rangeStart = monthStart < adjustedStart ? adjustedStart : monthStart;
    const rangeEnd = monthEnd > adjustedEnd ? adjustedEnd : monthEnd;

    if (rangeStart <= rangeEnd) {
      const daysInRange =
        Math.ceil(
          (rangeEnd.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;

      // 해당 월의 날짜가 10일 미만이면 범위 확장
      if (daysInRange < 10) {
        const needMoreDays = 10 - daysInRange;

        // 월의 시작 부분이 잘린 경우 시작일을 앞당김
        if (rangeStart > monthStart) {
          const extendStart = new Date(rangeStart);
          extendStart.setDate(Math.max(1, rangeStart.getDate() - needMoreDays));
          if (extendStart < adjustedStart) {
            adjustedStart.setTime(extendStart.getTime());
          }
        }

        // 월의 끝 부분이 잘린 경우 종료일을 뒤로 연장
        if (rangeEnd < monthEnd) {
          const extendEnd = new Date(rangeEnd);
          extendEnd.setDate(
            Math.min(monthEnd.getDate(), rangeEnd.getDate() + needMoreDays)
          );
          if (extendEnd > adjustedEnd) {
            adjustedEnd.setTime(extendEnd.getTime());
          }
        }
      }
    }
  });

  return { adjustedStart, adjustedEnd };
};

/**
 * 태스크들의 날짜 범위를 기반으로 간트 차트에 표시할 날짜 배열 생성
 */
export const generateDates = (tasks: Task[]): string[] => {
  const today = new Date();

  if (tasks.length === 0) {
    // 태스크가 없는 경우 현재 날짜부터 5개월(150일) 생성
    const dates: string[] = [];

    for (let i = 0; i < DEFAULT_DATE_RANGE_DAYS; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(formatDate(date));
    }

    return dates;
  }

  // 태스크가 있는 경우 태스크 범위와 오늘 날짜를 모두 고려
  const allDates = tasks.flatMap((task) => [task.startDate, task.endDate]);
  const taskMinDate = new Date(
    Math.min(...allDates.map((d) => new Date(d).getTime()))
  );
  const taskMaxDate = new Date(
    Math.max(...allDates.map((d) => new Date(d).getTime()))
  );

  // 오늘 날짜와 태스크 범위를 비교하여 전체 범위 결정
  const minDate = new Date(Math.min(today.getTime(), taskMinDate.getTime()));
  const maxDate = new Date(Math.max(today.getTime(), taskMaxDate.getTime()));

  // 시작일을 상수만큼 앞당기고, 종료일을 상수만큼 뒤로 연장
  minDate.setDate(minDate.getDate() - DATE_RANGE_BUFFER_DAYS);
  maxDate.setDate(maxDate.getDate() + DATE_RANGE_BUFFER_DAYS);

  // 월별 최소 날짜 수 보장을 위한 범위 조정
  const { adjustedStart, adjustedEnd } = adjustDateRangeForMonthlyMinimum(
    minDate,
    maxDate
  );

  // 최소 5개월(150일) 보장 - 오늘 날짜 기준으로
  const minEndDate = new Date(today);
  minEndDate.setDate(today.getDate() + DEFAULT_DATE_RANGE_DAYS - 1);

  // 최종 범위 결정: 오늘 날짜가 항상 포함되도록 보장
  const actualStartDate = new Date(
    Math.min(adjustedStart.getTime(), today.getTime())
  );
  const actualEndDate = new Date(
    Math.max(adjustedEnd.getTime(), minEndDate.getTime())
  );

  const dates: string[] = [];
  const currentDate = new Date(actualStartDate);

  while (currentDate <= actualEndDate) {
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * 두 날짜 사이의 일수 계산
 */
export const getDaysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
