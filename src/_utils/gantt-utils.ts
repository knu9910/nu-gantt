import { Task, DragState, DragSelection } from "../_components/gantt-chart";

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

// ==========================================
// 태스크 검색 및 위치 관련 유틸리티 함수들
// ==========================================

/**
 * 특정 셀에 위치한 태스크 찾기
 */
export const getTaskForCell = (
  row: number,
  col: number,
  tasks: Task[],
  dates: string[]
): Task | undefined => {
  return tasks.find((task) => {
    const startIndex = dates.indexOf(task.startDate);
    const endIndex = dates.indexOf(task.endDate);
    return task.row === row && col >= startIndex && col <= endIndex;
  });
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

  if (dragType === "move" && taskId) {
    const originalTask = tasks.find((t) => t.id === taskId);
    if (!originalTask) return null;

    const taskDuration =
      dates.indexOf(originalTask.endDate) -
      dates.indexOf(originalTask.startDate);
    const previewStartCol = currentPos.col;
    const previewEndCol = previewStartCol + taskDuration;

    if (
      row === currentPos.row &&
      col >= previewStartCol &&
      col <= previewEndCol
    ) {
      return { ...originalTask, isPreview: true };
    }
  }

  return null;
};

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

// ==========================================
// 태스크 CRUD 관련 유틸리티 함수들
// ==========================================

/**
 * 새 태스크 생성
 */
export const createNewTask = (
  row: number,
  startCol: number,
  endCol: number,
  dates: string[],
  existingTasks: Task[],
  taskColors: string[]
): Task => {
  return {
    id: `task-${Date.now()}`,
    name: `새 태스크 ${existingTasks.length + 1}`,
    startDate: dates[startCol],
    endDate: dates[endCol],
    row,
    color: taskColors[existingTasks.length % taskColors.length],
  };
};

/**
 * 태스크 이동 처리
 */
export const moveTask = (
  tasks: Task[],
  taskId: string,
  newRow: number,
  startCol: number,
  endCol: number,
  dates: string[]
): Task[] => {
  // 배열 경계 검사
  if (startCol < 0 || endCol >= dates.length || startCol > endCol) {
    return tasks;
  }

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          row: newRow,
          startDate: dates[startCol],
          endDate: dates[endCol],
        }
      : task
  );
};

/**
 * 태스크 리사이즈 처리
 */
export const resizeTask = (
  tasks: Task[],
  taskId: string,
  startCol: number,
  endCol: number,
  dates: string[]
): Task[] => {
  // 배열 경계 검사
  if (startCol < 0 || endCol >= dates.length || startCol > endCol) {
    return tasks;
  }

  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          startDate: dates[startCol],
          endDate: dates[endCol],
        }
      : task
  );
};

/**
 * 태스크 삭제 처리
 */
export const deleteTask = (tasks: Task[], taskId: string): Task[] => {
  return tasks.filter((task) => task.id !== taskId);
};

// ==========================================
// 유효성 검사 유틸리티 함수들
// ==========================================

/**
 * 태스크 생성/수정 시 배열 경계 검사
 */
export const isValidTaskRange = (
  startCol: number,
  endCol: number,
  datesLength: number
): boolean => {
  return startCol >= 0 && endCol < datesLength && startCol <= endCol;
};

// ==========================================
// 상수 정의
// ==========================================

/**
 * 태스크 색상 팔레트
 */
export const TASK_COLORS = [
  "#3B82F6", // 파란색
  "#EF4444", // 빨간색
  "#10B981", // 초록색
  "#F59E0B", // 주황색
  "#8B5CF6", // 보라색
  "#F97316", // 주황색
  "#06B6D4", // 청록색
  "#84CC16", // 라임색
  "#EC4899", // 핑크색
  "#6366F1", // 인디고색
  "#14B8A6", // 틸색
  "#F43F5E", // 로즈색
];

/**
 * 기본 태스크 행 개수
 */
export const DEFAULT_TASK_ROWS = 15;
