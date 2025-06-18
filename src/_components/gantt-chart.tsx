"use client";

import { taskColors } from "@/app/constants/task-colors";
import React, { useState, useRef } from "react";

// Utils imports
import { generateDates, formatDateToKorean } from "../_utils/date-utils";
import { getTaskForCell } from "../_utils/task-utils";
import {
  isCellInDragArea,
  isCellInDragSelection,
  getTaskPreview,
} from "../_utils/drag-utils";
import { isColumnSelected } from "../_utils/selection-utils";
import {
  createMouseDownHandler,
  createMouseEnterHandler,
  createMouseUpHandler,
  createRightClickHandler,
  createTaskFromContextHandler,
  createColumnClickHandler,
  createClickOutsideHandler,
} from "../_utils/event-handlers";
import { createDeleteTaskHandler } from "../_utils/component-utils";

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
    setTasks
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
    setContextMenu
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

  // 태스크가 변경될 때마다 날짜 범위 업데이트 (드래그 중이 아닐 때만)
  React.useEffect(() => {
    if (!dragState.isDragging) {
      setDates(generateDates(tasks));
    }
  }, [tasks, dragState.isDragging]);

  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("mouseup", handleMouseUp);
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
        </div>
      </div>

      <div
        ref={ganttRef}
        className="border border-gray-300 rounded-lg overflow-auto shadow-lg select-none"
        style={{ maxHeight: "600px" }}
      >
        {/* 헤더 - 날짜 */}
        <div className="sticky top-0 bg-white z-10">
          <div className="flex">
            {dates.map((date, colIndex) => (
              <div
                key={date}
                className={`
                  min-w-[60px] p-2 border-r border-b border-gray-300 text-xs font-medium text-center cursor-pointer
                  ${
                    isColumnSelected(columnSelection, colIndex)
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 hover:bg-gray-200"
                  }
                `}
                onClick={(e) => handleColumnClick(colIndex, e)}
              >
                {formatDateToKorean(date)}
              </div>
            ))}
          </div>
        </div>

        {/* 태스크 행들 */}
        <div>
          {taskNames.map((taskName, rowIndex) => (
            <div key={rowIndex} className="flex border-b border-gray-200">
              {/* 날짜 셀들 */}
              {dates.map((date, colIndex) => {
                const task = getTaskForCell(rowIndex, colIndex, tasks, dates);
                const taskPreview = getTaskPreview(
                  rowIndex,
                  colIndex,
                  dragState,
                  tasks,
                  dates
                );
                const isInDragArea = isCellInDragArea(
                  rowIndex,
                  colIndex,
                  dragState
                );
                const isInDragSelection = isCellInDragSelection(
                  rowIndex,
                  colIndex,
                  dragSelection
                );
                const isDraggingThisTask =
                  dragState.isDragging && dragState.taskId === task?.id;
                const isColumnSelectedCell = isColumnSelected(
                  columnSelection,
                  colIndex
                );

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      min-w-[60px] h-10 border-r border-b border-gray-200 cursor-pointer relative
                      ${
                        isInDragArea
                          ? "bg-blue-200"
                          : isInDragSelection
                          ? "bg-yellow-200 border-2 border-yellow-400"
                          : isColumnSelectedCell
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }
                      ${task && !isDraggingThisTask ? "bg-opacity-80" : ""}
                      ${taskPreview ? "bg-opacity-50" : ""}
                      ${isDraggingThisTask ? "opacity-50" : ""}
                    `}
                    style={{
                      backgroundColor:
                        task && !isDraggingThisTask
                          ? task.color
                          : taskPreview
                          ? taskPreview.color
                          : isColumnSelectedCell
                          ? "#DBEAFE"
                          : isInDragSelection
                          ? "#FEF3C7"
                          : undefined,
                    }}
                    onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    onContextMenu={(e) =>
                      handleRightClick(rowIndex, colIndex, e)
                    }
                  >
                    {task && !isDraggingThisTask && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-medium truncate px-1">
                          {task.name}
                        </span>
                        {/* 리사이즈 핸들 표시 */}
                        {dates.indexOf(task.startDate) === colIndex && (
                          <div className="absolute left-0 top-0 w-1 h-full bg-white bg-opacity-50 cursor-w-resize" />
                        )}
                        {dates.indexOf(task.endDate) === colIndex && (
                          <div className="absolute right-0 top-0 w-1 h-full bg-white bg-opacity-50 cursor-e-resize" />
                        )}
                      </div>
                    )}

                    {taskPreview && (
                      <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-gray-400">
                        <span className="text-white text-xs font-medium truncate px-1">
                          {taskPreview.name}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 컨텍스트 메뉴 */}
      {contextMenu.show && (
        <div
          className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-20 py-1"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={createTaskFromContext}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            태스크 생성
          </button>
        </div>
      )}

      {/* 태스크 목록 */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">생성된 태스크</h3>
        {tasks.length === 0 ? (
          <p className="text-gray-500">생성된 태스크가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: task.color }}
                  />
                  <span className="font-medium">{task.name}</span>
                  <span className="text-sm text-gray-600">
                    {task.startDate} ~ {task.endDate}
                  </span>
                  <span className="text-xs text-gray-500">
                    (행 {task.row + 1})
                  </span>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
