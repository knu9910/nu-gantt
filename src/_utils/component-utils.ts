import React from "react";
import { Task } from "../_components/gantt-chart";
import { deleteTask as deleteTaskUtil } from "./task-crud-utils";

// ==========================================
// 컴포넌트 관련 유틸리티 함수들
// ==========================================

/**
 * 태스크 삭제 핸들러 생성
 */
export const createDeleteTaskHandler = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  return (taskId: string) => {
    setTasks(deleteTaskUtil(tasks, taskId));
  };
};
