/**
 * 태스크 위치로 스크롤하는 유틸리티 함수들
 */

import { Task } from "../types/gantt-types";
import {
  CELL_WIDTH,
  CELL_HEIGHT,
  SCROLL_DELAY,
} from "../_constants/gantt-constants";
import { format } from "date-fns";

/**
 * 특정 태스크 위치로 스크롤
 */
export const scrollToTask = (
  ganttRef: React.RefObject<HTMLDivElement | null>,
  task: Task,
  dates: string[]
) => {
  if (!ganttRef.current) return;

  const startDateIndex = dates.indexOf(task.startDate);
  if (startDateIndex === -1) return;

  const scrollLeft = startDateIndex * CELL_WIDTH;

  setTimeout(() => {
    ganttRef.current?.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  }, SCROLL_DELAY);
};

/**
 * 특정 셀 위치로 스크롤
 */
export const scrollToCell = (
  ganttRef: React.RefObject<HTMLDivElement | null>,
  rowIndex: number,
  colIndex: number
) => {
  if (!ganttRef.current) return;

  const scrollTop = rowIndex * CELL_HEIGHT;
  const scrollLeft = colIndex * CELL_WIDTH;

  setTimeout(() => {
    ganttRef.current?.scrollTo({
      left: scrollLeft,
      top: scrollTop,
      behavior: "smooth",
    });
  }, SCROLL_DELAY);
};

/**
 * 드래그 영역으로 스크롤
 */
export const scrollToDragArea = (
  ganttRef: React.RefObject<HTMLDivElement | null>,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number
) => {
  if (!ganttRef.current) return;

  // 드래그 영역의 중심 위치 계산
  const centerRow = Math.floor((startRow + endRow) / 2);
  const centerCol = Math.floor((startCol + endCol) / 2);

  scrollToCell(ganttRef, centerRow, centerCol);
};

/**
 * 오늘 날짜로 스크롤하고 해당 열 선택
 */
export const scrollToToday = (
  ganttRef: React.RefObject<HTMLDivElement | null>,
  dates: string[],
  onColumnSelect?: (columnIndex: number) => void
) => {
  if (!ganttRef.current) return;

  const today = format(new Date(), "yyyy-MM-dd"); // YYYY-MM-DD 형식
  const todayIndex = dates.indexOf(today);

  if (todayIndex === -1) return; // 오늘 날짜가 범위에 없으면 스크롤하지 않음

  const scrollLeft = todayIndex * CELL_WIDTH;

  setTimeout(() => {
    ganttRef.current?.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });

    // 오늘 날짜 열 선택
    if (onColumnSelect) {
      onColumnSelect(todayIndex);
    }
  }, SCROLL_DELAY);
};
