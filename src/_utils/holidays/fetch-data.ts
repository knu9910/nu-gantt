//Info: 공공 API에서 단일 월의 공휴일 데이터를 가져오는 함수입니다.
//      XML 형식의 응답을 JSON으로 변환하고, Holiday 타입으로 변환하여 반환합니다.

import { XMLParser } from "fast-xml-parser";
import { Holiday } from "../../types/gantt-types";

/**
 * API 응답 아이템 타입
 */
type HolidayApiItem = {
  locdate: string | number;
  dateName?: string;
  isHoliday?: string;
};

/**
 * API 응답 바디 타입
 */
type HolidayApiBody = {
  items?: {
    item: HolidayApiItem | HolidayApiItem[];
  };
};

/**
 * API 응답 타입
 */
type HolidayApiResponse = {
  response?: {
    body?: HolidayApiBody;
  };
};

/**
 * XML 응답 데이터를 Holiday 타입으로 변환하는 함수
 */
const transformHolidayData = (xmlData: unknown): Holiday[] => {
  try {
    const apiResponse = xmlData as HolidayApiResponse;
    const response = apiResponse.response;
    if (!response) {
      console.log("📄 응답 데이터가 없습니다.");
      return [];
    }

    const body = response.body;
    if (!body || !body.items) {
      console.log("📄 공휴일 데이터가 없습니다.");
      return [];
    }

    const items = Array.isArray(body.items.item)
      ? body.items.item
      : [body.items.item];

    return items.map((item: HolidayApiItem) => ({
      date: `${item.locdate}`.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"), // YYYYMMDD -> YYYY-MM-DD
      name: item.dateName || "공휴일",
      isHoliday: item.isHoliday === "Y" || true,
    }));
  } catch (error) {
    console.error("❌ 휴일 데이터 변환 실패:", error);
    return [];
  }
};

/**
 * 공공 API에서 단일 월의 공휴일 데이터를 가져오는 함수
 */
export const fetchHolidayData = async (url: string): Promise<Holiday[]> => {
  try {
    console.log("🌐 API 요청:", url.substring(0, 100) + "...");

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ HTTP 오류: ${response.status} ${response.statusText}`);
      return [];
    }

    const xmlText = await response.text();
    console.log("📥 XML 응답 수신 완료");

    const parser = new XMLParser({
      ignoreDeclaration: true,
      ignoreAttributes: false,
      parseTagValue: true,
    });

    const json = parser.parse(xmlText);
    const holidays = transformHolidayData(json);

    console.log(`✅ ${holidays.length}개의 휴일 데이터 파싱 완료`);
    return holidays;
  } catch (error) {
    console.error("❌ 휴일 데이터 요청 실패:", error);
    return [];
  }
};
