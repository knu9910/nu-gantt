//Info: 날짜 범위를 받아서 공공 API 요청 URL들을 생성하는 함수입니다.
//      예: 2024년 1월부터 2024년 12월까지의 공휴일을 가져오기 위한 URL들을 생성합니다.

import { DateRange } from "../../types/gantt-types";

/**
 * 날짜 범위를 기반으로 공휴일 API 요청 URL들을 생성하는 함수
 */
export const generateHolidayRequests = (dateRange: DateRange): string[] => {
  const { startYear, startMonth, endYear, endMonth } = dateRange;
  const requests: string[] = [];
  let currentYear = startYear;
  let currentMonth = startMonth;

  // API 키 확인
  const apiKey = process.env.NEXT_PUBLIC_HOLIDAY_API_KEY;
  if (!apiKey) {
    console.error(
      "❌ NEXT_PUBLIC_HOLIDAY_API_KEY 환경변수가 설정되지 않았습니다."
    );
    return [];
  }

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endMonth)
  ) {
    const monthStr = String(currentMonth).padStart(2, "0");
    const url = `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?solYear=${currentYear}&solMonth=${monthStr}&ServiceKey=${apiKey}`;

    requests.push(url);
    console.log(`📅 API 요청 URL 생성: ${currentYear}년 ${monthStr}월`);

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }

  return requests;
};
