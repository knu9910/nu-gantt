import { Task } from "../_components/gantt-chart";

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

/**
 * 태스크 업데이트 처리
 */
export const updateTask = (
  tasks: Task[],
  taskId: string,
  updates: Partial<Task>
): Task[] => {
  return tasks.map((task) =>
    task.id === taskId ? { ...task, ...updates } : task
  );
};

/**
 * 태스크 복제 처리
 */
export const duplicateTask = (
  tasks: Task[],
  taskId: string,
  newRow?: number
): Task[] => {
  const originalTask = tasks.find((task) => task.id === taskId);
  if (!originalTask) return tasks;

  const duplicatedTask: Task = {
    ...originalTask,
    id: `task-${Date.now()}`,
    name: `${originalTask.name} (복사)`,
    row: newRow ?? originalTask.row + 1,
  };

  return [...tasks, duplicatedTask];
};

/**
 * 여러 태스크 삭제 처리
 */
export const deleteMultipleTasks = (
  tasks: Task[],
  taskIds: string[]
): Task[] => {
  return tasks.filter((task) => !taskIds.includes(task.id));
};
