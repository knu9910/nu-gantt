import { Task } from "../_components/gantt-chart";

// ==========================================
// 날짜 관련 유틸리티 함수들
// ==========================================

/**
 * 태스크 기준으로 동적 날짜 범위 생성
 * - 태스크가 없으면: 현재 날짜부터 30일
 * - 태스크가 있으면: 가장 이른 태스크 1주일 전부터 가장 늦은 태스크 1주일 후까지
 */
export const generateDates = (tasks: Task[]): string[] => {
  if (tasks.length === 0) {
    // 태스크가 없으면 현재 날짜부터 30일
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);
    }
    return dates;
  }

  // 태스크가 있으면 가장 이른 태스크 1주일 전부터 가장 늦은 태스크 1주일 후까지
  const allDates = tasks.flatMap((task) => [task.startDate, task.endDate]);
  const minDate = new Date(
    Math.min(...allDates.map((d) => new Date(d).getTime()))
  );
  const maxDate = new Date(
    Math.max(...allDates.map((d) => new Date(d).getTime()))
  );

  // 1주일 전후 추가
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 7);

  const dates = [];
  const currentDate = new Date(minDate);
  while (currentDate <= maxDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

/**
 * 날짜 문자열을 한국어 형식으로 포맷팅
 */
export const formatDateToKorean = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
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
