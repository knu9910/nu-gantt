"use client";

import React, { useState, useRef, useEffect } from "react";
import { taskColors } from "@/_constants/task-colors";

// Utils imports
import { generateDates } from "../_utils/date-utils";
import {
  createMouseDownHandler,
  createMouseEnterHandler,
  createMouseUpHandler,
  createRightClickHandler,
  createTaskFromContextHandler,
  createColumnClickHandler,
  createClickOutsideHandler,
} from "../_utils/event-handlers";
import {
  createDeleteTaskHandler,
  createUpdateTaskNameHandler,
} from "../_utils/task-utils";
import { createGanttMouseMoveHandler } from "../_utils/drag-utils";

// Component imports
import { ContextMenu } from "./context-menu";
import { TaskList } from "./task-list";
import { GanttHeader } from "./gantt-header";
import { GanttCell } from "./gantt-cell";
import { TaskEditModal } from "./task-edit-modal";

export interface Task {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  row: number;
  color: string;
}

export interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  row: number;
  col: number;
}

export interface DragState {
  isDragging: boolean;
  dragType: "new" | "move" | "resize-start" | "resize-end";
  taskId?: string;
  startPos?: { row: number; col: number };
  currentPos?: { row: number; col: number };
  clickOffset?: number;
  startTime?: number;
  startMousePos?: { x: number; y: number };
}

// 드래그 선택 영역 상태 추가
export interface DragSelection {
  isSelected: boolean;
  startPos?: { row: number; col: number };
  endPos?: { row: number; col: number };
}

// 선택된 열 상태 추가
export interface ColumnSelection {
  isSelected: boolean;
  selectedColumn: number | null;
}

export const GanttChart: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dates, setDates] = useState(() => generateDates([]));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [taskNames, setTaskNames] = useState<string[]>(
    Array(15)
      .fill("")
      .map((_, i) => `태스크 ${i + 1}`)
  );
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: "new",
  });
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    row: 0,
    col: 0,
  });

  // 열 선택 상태 추가
  const [columnSelection, setColumnSelection] = useState<ColumnSelection>({
    isSelected: false,
    selectedColumn: null,
  });

  // 드래그 선택 영역 상태 추가
  const [dragSelection, setDragSelection] = useState<DragSelection>({
    isSelected: false,
  });

  // 태스크 편집 모달 상태 추가
  const [editModal, setEditModal] = useState<{
    show: boolean;
    task: Task | null;
  }>({
    show: false,
    task: null,
  });

  const ganttRef = useRef<HTMLDivElement>(null);

  // 이벤트 핸들러들 생성
  const handleMouseDown = createMouseDownHandler(
    dates,
    contextMenu,
    setDragState,
    setContextMenu,
    tasks
  );

  const handleMouseEnter = createMouseEnterHandler(dragState, setDragState);

  const handleMouseUp = createMouseUpHandler(
    dragState,
    tasks,
    dates,
    setDragState,
    setDragSelection,
    setTasks,
    (task, e) => {
      // MouseEvent를 React.MouseEvent로 변환
      const reactEvent = e as unknown as React.MouseEvent;
      handleTaskClick(task, reactEvent);
    },
    ganttRef
  );

  const handleRightClick = createRightClickHandler(
    tasks,
    dates,
    setContextMenu
  );

  const createTaskFromContext = createTaskFromContextHandler(
    contextMenu,
    dragSelection,
    dates,
    tasks,
    taskColors,
    setTasks,
    setDragSelection,
    setContextMenu,
    ganttRef
  );

  const handleColumnClick = createColumnClickHandler(setColumnSelection);

  const handleClickOutside = createClickOutsideHandler(
    ganttRef,
    contextMenu,
    setContextMenu,
    setColumnSelection
  );

  // 태스크 삭제
  const deleteTask = createDeleteTaskHandler(tasks, setTasks);

  // 태스크 이름 업데이트
  const updateTaskName = createUpdateTaskNameHandler(tasks, setTasks);

  // 간트 차트 전체 영역에서의 마우스 무브 이벤트 핸들러
  const handleGanttMouseMove = createGanttMouseMoveHandler(
    dragState,
    ganttRef,
    dates,
    taskNames,
    handleMouseEnter
  );

  // 태스크 클릭 핸들러
  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditModal({ show: true, task });
  };

  // 태스크 편집 모달 저장 핸들러
  const handleSaveTaskName = (taskId: string, newName: string) => {
    updateTaskName(taskId, newName);
    setEditModal({ show: false, task: null });
  };

  // 태스크 편집 모달 취소 핸들러
  const handleCancelTaskEdit = () => {
    setEditModal({ show: false, task: null });
  };

  // 리사이즈 시작 핸들러
  const handleResizeStart = (
    rowIndex: number,
    colIndex: number,
    taskId: string
  ) => {
    setDragState({
      isDragging: true,
      dragType: "resize-start",
      taskId,
      startPos: { row: rowIndex, col: colIndex },
      currentPos: { row: rowIndex, col: colIndex },
      clickOffset: 0,
    });
  };

  // 리사이즈 끝 핸들러
  const handleResizeEnd = (
    rowIndex: number,
    colIndex: number,
    taskId: string
  ) => {
    setDragState({
      isDragging: true,
      dragType: "resize-end",
      taskId,
      startPos: { row: rowIndex, col: colIndex },
      currentPos: { row: rowIndex, col: colIndex },
      clickOffset: 0,
    });
  };

  // 태스크가 변경될 때마다 날짜 범위 업데이트 (드래그 중이 아닐 때만)
  useEffect(() => {
    if (!dragState.isDragging) {
      setDates(generateDates(tasks));
    }
  }, [tasks, dragState.isDragging]);

  useEffect(() => {
    const handleDocumentMouseUp = (e: MouseEvent) => {
      handleMouseUp(e);
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("mouseup", handleDocumentMouseUp);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("mouseup", handleDocumentMouseUp);
    };
  }, [handleClickOutside, handleMouseUp]);

  return (
    <div className="w-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">간트 차트</h1>
        <div className="text-sm text-gray-600 mb-4">
          <p>• 빈 셀을 드래그한 후 우클릭하여 태스크를 생성하세요</p>
          <p>• 태스크를 드래그하여 이동하거나 크기를 조절하세요</p>
          <p>• 태스크 시작/끝 부분을 드래그하면 크기가 조절됩니다</p>
          <p>• 빈 셀에서 우클릭으로 단일 태스크를 생성할 수도 있습니다</p>
          <p>• 태스크를 클릭하면 이름을 변경할 수 있습니다</p>
        </div>
      </div>

      <div
        ref={ganttRef}
        className="border border-gray-300 rounded-lg overflow-auto shadow-lg select-none"
        style={{ maxHeight: "600px" }}
        onMouseMove={handleGanttMouseMove}
      >
        {/* 헤더 - 날짜 */}
        <GanttHeader
          dates={dates}
          columnSelection={columnSelection}
          onColumnClick={handleColumnClick}
        />

        {/* 태스크 행들 */}
        <div>
          {taskNames.map((taskName, rowIndex) => (
            <div key={rowIndex} className="flex border-gray-200">
              {/* 날짜 셀들 */}
              {dates.map((date, colIndex) => (
                <GanttCell
                  key={`${rowIndex}-${colIndex}`}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  dates={dates}
                  tasks={tasks}
                  dragState={dragState}
                  dragSelection={dragSelection}
                  columnSelection={columnSelection}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onContextMenu={handleRightClick}
                  onTaskClick={handleTaskClick}
                  onResizeStart={handleResizeStart}
                  onResizeEnd={handleResizeEnd}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 컨텍스트 메뉴 */}
      <ContextMenu
        show={contextMenu.show}
        x={contextMenu.x}
        y={contextMenu.y}
        onCreateTask={createTaskFromContext}
      />

      {/* 태스크 편집 모달 */}
      <TaskEditModal
        show={editModal.show}
        task={editModal.task}
        onSave={handleSaveTaskName}
        onCancel={handleCancelTaskEdit}
      />

      {/* 태스크 목록 */}
      <TaskList tasks={tasks} onDeleteTask={deleteTask} />
    </div>
  );
};
