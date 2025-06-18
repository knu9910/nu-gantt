import { Task, DragState, DragSelection } from "../_components/gantt-chart";
import {
  CELL_WIDTH,
  CELL_HEIGHT,
  HEADER_HEIGHT,
} from "../_constants/gantt-constants";

// ==========================================
// 드래그 영역 관련 유틸리티 함수들
// ==========================================

/**
 * 셀이 드래그 영역에 포함되는지 확인 (새 태스크 생성용)
 */
export const isCellInDragArea = (
  row: number,
  col: number,
  dragState: DragState
): boolean => {
  if (!dragState.isDragging || !dragState.startPos || !dragState.currentPos) {
    return false;
  }

  const { dragType, startPos, currentPos } = dragState;

  if (dragType === "new") {
    const minRow = Math.min(startPos.row, currentPos.row);
    const maxRow = Math.max(startPos.row, currentPos.row);
    const minCol = Math.min(startPos.col, currentPos.col);
    const maxCol = Math.max(startPos.col, currentPos.col);

    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  }

  return false;
};

/**
 * 셀이 드래그 선택 영역에 포함되는지 확인
 */
export const isCellInDragSelection = (
  row: number,
  col: number,
  dragSelection: DragSelection
): boolean => {
  if (
    !dragSelection.isSelected ||
    !dragSelection.startPos ||
    !dragSelection.endPos
  ) {
    return false;
  }

  const { startPos, endPos } = dragSelection;
  return row === startPos.row && col >= startPos.col && col <= endPos.col;
};

/**
 * 드래그 중인 태스크의 미리보기 정보 계산
 */
export const getTaskPreview = (
  row: number,
  col: number,
  dragState: DragState,
  tasks: Task[],
  dates: string[]
): (Task & { isPreview: boolean }) | null => {
  if (!dragState.isDragging || !dragState.startPos || !dragState.currentPos) {
    return null;
  }

  const { dragType, taskId, currentPos } = dragState;

  if (taskId) {
    const originalTask = tasks.find((t) => t.id === taskId);
    if (!originalTask || row !== currentPos.row) return null;

    const originalStartCol = dates.indexOf(originalTask.startDate);
    const originalEndCol = dates.indexOf(originalTask.endDate);

    if (dragType === "move") {
      // 이동 프리뷰 - 클릭 오프셋 고려
      const taskDuration = originalEndCol - originalStartCol;
      const clickOffset = dragState.clickOffset || 0;
      const previewStartCol = currentPos.col - clickOffset;
      const previewEndCol = previewStartCol + taskDuration;

      if (col >= previewStartCol && col <= previewEndCol) {
        return { ...originalTask, isPreview: true };
      }
    } else if (dragType === "resize-start") {
      // 시작점 리사이즈 프리뷰
      const previewStartCol = Math.min(currentPos.col, originalEndCol);
      const previewEndCol = originalEndCol;

      if (col >= previewStartCol && col <= previewEndCol) {
        return { ...originalTask, isPreview: true };
      }
    } else if (dragType === "resize-end") {
      // 끝점 리사이즈 프리뷰
      const previewStartCol = originalStartCol;
      const previewEndCol = Math.max(currentPos.col, originalStartCol);

      if (col >= previewStartCol && col <= previewEndCol) {
        return { ...originalTask, isPreview: true };
      }
    }
  }

  return null;
};

/**
 * 드래그 타입 결정 (태스크 클릭 시)
 */
export const getDragType = (
  task: Task,
  clickedCol: number,
  dates: string[]
): "move" | "resize-start" | "resize-end" => {
  const taskStartCol = dates.indexOf(task.startDate);
  const taskEndCol = dates.indexOf(task.endDate);

  if (clickedCol === taskStartCol) {
    return "resize-start";
  } else if (clickedCol === taskEndCol) {
    return "resize-end";
  } else {
    return "move";
  }
};

/**
 * 드래그 선택 영역 계산 함수
 */
export const calculateDragSelection = (
  startPos: { row: number; col: number },
  currentPos: { row: number; col: number }
) => {
  return {
    isSelected: true,
    startPos: {
      row: startPos.row,
      col: Math.min(startPos.col, currentPos.col),
    },
    endPos: {
      row: currentPos.row,
      col: Math.max(startPos.col, currentPos.col),
    },
  };
};

/**
 * 간트 차트 전체 영역에서의 마우스 무브 이벤트 핸들러 생성
 */
export const createGanttMouseMoveHandler = (
  dragState: DragState,
  ganttRef: React.RefObject<HTMLDivElement | null>,
  dates: string[],
  rows: string[],
  handleMouseEnter: (row: number, col: number) => void
) => {
  return (e: React.MouseEvent) => {
    if (dragState.isDragging && ganttRef.current) {
      const rect = ganttRef.current.getBoundingClientRect();

      // 스크롤 오프셋 고려
      const scrollLeft = ganttRef.current.scrollLeft;
      const scrollTop = ganttRef.current.scrollTop;

      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top - HEADER_HEIGHT + scrollTop;

      const col = Math.floor(x / CELL_WIDTH);
      let row = Math.floor(y / CELL_HEIGHT);

      // resize 중일 때는 행 이동을 막고 원래 행에서만 작업
      if (
        dragState.dragType === "resize-start" ||
        dragState.dragType === "resize-end"
      ) {
        if (dragState.startPos) {
          row = dragState.startPos.row;
        }
      }

      // 유효한 범위 내에서만 처리
      if (col >= 0 && col < dates.length && row >= 0 && row < rows.length) {
        handleMouseEnter(row, col);
      }
    }
  };
};
