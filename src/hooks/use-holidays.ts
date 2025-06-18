import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Holiday } from "../types/gantt-types";
import { fetchHolidays, calculateDateRange } from "../_utils/holidays";

/**
 * 공휴일 데이터를 관리하는 React Query 훅
 * @param dates - 공휴일을 조회할 날짜 배열 (YYYY-MM-DD 형식)
 */
export const useHolidays = (dates: string[]) => {
  return useQuery<Holiday[], Error>({
    queryKey: ["holidays", dates],
    queryFn: async () => {
      if (!dates || dates.length === 0) {
        return [];
      }

      const dateRange = calculateDateRange(dates);
      if (!dateRange) {
        return [];
      }

      const holidays = await fetchHolidays(dateRange);

      // 간트 차트 날짜 범위에 포함된 공휴일만 필터링
      return holidays.filter((holiday) => dates.includes(holiday.date));
    },
    enabled: dates.length > 0,
    staleTime: 1000 * 60 * 60, // 1시간
    gcTime: 1000 * 60 * 60 * 24, // 24시간
    placeholderData: keepPreviousData,
  });
};
