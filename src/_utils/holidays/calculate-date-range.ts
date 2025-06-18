//Info: 날짜 배열을 기반으로 공휴일 API 요청에 필요한 날짜 범위를 계산하는 함수입니다.

import { DateRange } from "../../types/gantt-types";

/**
 * 날짜 배열을 기반으로 DateRange를 계산하는 함수
 */
export const calculateDateRange = (dates: string[]): DateRange | null => {
  if (!dates || dates.length === 0) {
    console.warn("날짜 배열이 비어있습니다.");
    return null;
  }

  // 첫 번째와 마지막 날짜 추출
  const startDate = new Date(dates[0]);
  const endDate = new Date(dates[dates.length - 1]);

  // 유효한 날짜인지 확인
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    console.error("유효하지 않은 날짜 형식입니다.");
    return null;
  }

  const dateRange: DateRange = {
    startYear: startDate.getFullYear(),
    startMonth: startDate.getMonth() + 1, // JavaScript의 월은 0부터 시작하므로 +1
    endYear: endDate.getFullYear(),
    endMonth: endDate.getMonth() + 1,
  };

  console.log("📅 계산된 날짜 범위:", dateRange);
  return dateRange;
};
