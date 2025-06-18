/**
 * 태스크 위치로 스크롤하는 유틸리티 함수들
 */

import { Task } from "../_components/gantt-chart";
import {
  CELL_WIDTH,
  CELL_HEIGHT,
  SCROLL_DELAY,
} from "../_constants/gantt-constants";

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
