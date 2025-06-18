//Info: 공공 API에서 특정 기간의 모든 공휴일 정보를 가져오는 메인 함수입니다.
//      여러 월의 데이터를 병렬로 가져와서 하나의 배열로 합쳐서 반환합니다.

import { DateRange, Holiday } from "../../types/gantt-types";
import { generateHolidayRequests } from "./generate-requests";
import { fetchHolidayData } from "./fetch-data";

/**
 * 날짜 범위를 기반으로 공휴일 데이터를 가져오는 함수
 */
export const fetchHolidays = async (
  dateRange: DateRange
): Promise<Holiday[]> => {
  if (!dateRange) {
    console.warn("날짜 범위가 제공되지 않았습니다.");
    return [];
  }

  try {
    console.log("🎌 공휴일 데이터 요청 시작:", dateRange);
    const urls = generateHolidayRequests(dateRange);
    console.log(`📡 ${urls.length}개의 API 요청 생성`);

    const responses = await Promise.all(urls.map(fetchHolidayData));
    const holidays = responses.flat();

    console.log(`✅ ${holidays.length}개의 공휴일 데이터 로드 완료`);
    return holidays;
  } catch (error) {
    console.error("❌ 공휴일 데이터 가져오기 실패:", error);
    return [];
  }
};
