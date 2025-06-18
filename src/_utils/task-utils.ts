import { Task } from "../_components/gantt-chart";

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
 * 태스크의 시작/끝 컬럼 인덱스 계산
 */
export const getTaskColumnIndices = (
  task: Task,
  dates: string[]
): { startCol: number; endCol: number } => {
  return {
    startCol: dates.indexOf(task.startDate),
    endCol: dates.indexOf(task.endDate),
  };
};

/**
 * 태스크 기간 계산 (일수)
 */
export const getTaskDuration = (task: Task): number => {
  const start = new Date(task.startDate);
  const end = new Date(task.endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1로 시작일 포함
};

/**
 * 태스크 이름 생성
 */
export const generateTaskName = (existingTasksCount: number): string => {
  return `새 태스크 ${existingTasksCount + 1}`;
};

/**
 * 태스크 색상 선택
 */
export const selectTaskColor = (
  existingTasksCount: number,
  taskColors: string[]
): string => {
  return taskColors[existingTasksCount % taskColors.length];
};

/**
 * 태스크 유효성 검사
 */
export const isValidTask = (task: Partial<Task>): boolean => {
  return !!(
    task.name &&
    task.startDate &&
    task.endDate &&
    task.row !== undefined &&
    task.color &&
    new Date(task.startDate) <= new Date(task.endDate)
  );
};
