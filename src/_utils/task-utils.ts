import React from "react";
import { Task } from "../types/gantt-types";

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

// ==========================================
// 태스크 CRUD 관련 유틸리티 함수들
// ==========================================

/**
 * 새 태스크 생성 함수
 */
export const createNewTask = (
  row: number,
  startCol: number,
  endCol: number,
  dates: string[],
  tasks: Task[],
  taskColors: string[]
): Task => {
  return {
    id: Date.now().toString(),
    name: ``,
    startDate: dates[startCol],
    endDate: dates[endCol],
    row: row,
    color: taskColors[tasks.length % taskColors.length],
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

// ==========================================
// 컴포넌트 핸들러 생성 함수들
// ==========================================

/**
 * 태스크 삭제 핸들러 생성
 */
export const createDeleteTaskHandler = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  return (taskId: string) => {
    setTasks(deleteTask(tasks, taskId));
  };
};

/**
 * 태스크 이름 업데이트 핸들러 생성
 */
export const createUpdateTaskNameHandler = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  return (taskId: string, newName: string) => {
    setTasks(updateTask(tasks, taskId, { name: newName }));
  };
};
