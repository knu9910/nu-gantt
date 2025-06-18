import { Task } from "../_components/gantt-chart";
import { DEFAULT_DATE_RANGE_DAYS } from "../_constants/gantt-constants";

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
 * 태스크들의 날짜 범위를 기반으로 간트 차트에 표시할 날짜 배열 생성
 */
export const generateDates = (tasks: Task[]): string[] => {
  if (tasks.length === 0) {
    // 태스크가 없는 경우 현재 날짜부터 5개월(150일) 생성
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < DEFAULT_DATE_RANGE_DAYS; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(formatDate(date));
    }

    return dates;
  }

  // 태스크가 있는 경우 기존 로직 유지
  const allDates = tasks.flatMap((task) => [task.startDate, task.endDate]);
  const minDate = new Date(
    Math.min(...allDates.map((d) => new Date(d).getTime()))
  );
  const maxDate = new Date(
    Math.max(...allDates.map((d) => new Date(d).getTime()))
  );

  // 시작일을 일주일 앞당기고, 종료일을 일주일 뒤로 연장
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 7);

  const dates: string[] = [];
  const currentDate = new Date(minDate);

  while (currentDate <= maxDate) {
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

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};
