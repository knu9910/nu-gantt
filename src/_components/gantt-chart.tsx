"use client";

import {
  ColumnSelection,
  ContextMenuState,
  DragSelection,
  DragState,
  MonthSelection,
  Task,
  TaskEditModalState,
} from "@/types/gantt-types";
import { generateDates } from "@/_utils/date-utils";
import {
  createColumnClickHandler,
  createGanttMouseMoveHandler,
  createMonthClickHandler,
  createMouseDownHandler,
  createMouseEnterHandler,
  createMouseUpHandler,
  createRightClickHandler,
  createTaskFromContextHandler,
} from "@/_utils/event-handlers";
import { clearMonthSelection } from "@/_utils/selection-utils";
import {
  createDeleteTaskHandler,
  createUpdateTaskHandler,
} from "@/_utils/task-utils";
import React, { useState, useRef, useEffect } from "react";
import { GanttHeader } from "./gantt-header";
import { GanttCell } from "./gantt-cell";
import { ContextMenu } from "./context-menu";
import { TaskEditModal } from "./task-edit-modal";
import { TaskList } from "./task-list";
import { TodayButton } from "./today-button";
import { useHolidays } from "@/hooks/use-holidays";
import { taskColors } from "@/_constants/task-colors";

export const GanttChart = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dates, setDates] = useState(() => generateDates([]));
  const [rows, setRows] = useState<string[]>(() =>
    Array(15)
      .fill("")
      .map((_, i) => `행 ${i + 1}`)
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

  // 월 선택 상태 추가
  const [monthSelection, setMonthSelection] = useState<MonthSelection>({
    isSelected: false,
    selectedMonth: null,
    startIndex: 0,
    endIndex: 0,
  });

  // 드래그 선택 영역 상태 추가
  const [dragSelection, setDragSelection] = useState<DragSelection>({
    isSelected: false,
  });

  // 태스크 편집 모달 상태 추가
  const [editModal, setEditModal] = useState<TaskEditModalState>({
    show: false,
    task: null,
  });

  const ganttRef = useRef<HTMLDivElement>(null);

  // 공휴일 데이터 가져오기
  const { data: holidays = [] } = useHolidays(dates);

  // 행 개수 조절 함수
  const updateRowCount = (newRowCount: number) => {
    const validCount = Math.max(1, Math.min(50, newRowCount));
    setRows(
      Array(validCount)
        .fill("")
        .map((_, i) => `행 ${i + 1}`)
    );
  };

  // 이벤트 핸들러들 생성
  const handleMouseDown = createMouseDownHandler(
    dates,
    contextMenu,
    setDragState,
    setContextMenu,
    tasks,
    setDragSelection
  );

  const handleRightClick = createRightClickHandler(
    tasks,
    dates,
    setContextMenu
  );

  const handleMouseEnter = createMouseEnterHandler(dragState, setDragState);

  const handleGanttMouseMove = createGanttMouseMoveHandler(
    dragState,
    dates,
    rows,
    ganttRef,
    handleMouseEnter
  );

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

  // 태스크 클릭 핸들러
  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditModal({ show: true, task });
  };

  // 태스크 편집 모달에서 저장 핸들러
  const handleSaveTaskName = (
    taskId: string,
    updates: { name: string; color: string; startDate: string; endDate: string }
  ) => {
    updateTask(taskId, updates);
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

    document.addEventListener("mouseup", handleDocumentMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleDocumentMouseUp);
    };
  }, [handleMouseUp]);

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

  // 열 클릭 시 월 선택 해제하는 핸들러 래퍼
  const handleColumnClickWithMonthClear = (
    colIndex: number,
    e: React.MouseEvent
  ) => {
    handleColumnClick(colIndex, e);
    // 열 선택 시 월 선택 해제
    setMonthSelection(clearMonthSelection());
  };

  // 월 클릭 핸들러 (utils에서 가져온 핸들러 사용)
  const handleMonthClick = createMonthClickHandler(
    setMonthSelection,
    setColumnSelection
  );

  // 태스크 삭제
  const deleteTask = createDeleteTaskHandler(tasks, setTasks);

  // 태스크 전체 정보 업데이트
  const updateTask = createUpdateTaskHandler(tasks, setTasks);

  return (
    <div className="p-4">
      {/* 행 개수 조절 컨트롤 */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="rowCount" className="text-sm font-medium">
          행 개수:
        </label>
        <input
          id="rowCount"
          type="number"
          min="1"
          max="50"
          value={rows.length}
          onChange={(e) => updateRowCount(parseInt(e.target.value) || 1)}
          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
        />
        <span className="text-sm text-gray-500">(현재 {rows.length}개 행)</span>

        {/* 오늘로 가는 버튼 */}
        <TodayButton
          ganttRef={ganttRef}
          dates={dates}
          setMonthSelection={setMonthSelection}
          setColumnSelection={setColumnSelection}
        />
      </div>

      <div
        ref={ganttRef}
        className="border border-gray-300 overflow-auto relative"
        style={{ height: "600px" }}
        onMouseMove={handleGanttMouseMove}
        onMouseUp={(e) => handleMouseUp(e.nativeEvent)}
      >
        {/* 헤더 - 날짜 */}
        <GanttHeader
          dates={dates}
          holidays={holidays}
          columnSelection={columnSelection}
          monthSelection={monthSelection}
          onColumnClick={handleColumnClickWithMonthClear}
          onMonthClick={handleMonthClick}
        />

        {/* 태스크 행들 */}
        <div>
          {rows.map((rowName, rowIndex) => (
            <div key={rowIndex} className="flex border-gray-200">
              {/* 날짜 셀들 */}
              {dates.map((date, colIndex) => (
                <GanttCell
                  key={`${rowIndex}-${colIndex}`}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                  dates={dates}
                  tasks={tasks}
                  holidays={holidays}
                  dragState={dragState}
                  dragSelection={dragSelection}
                  columnSelection={columnSelection}
                  monthSelection={monthSelection}
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
        task={contextMenu.task}
        onCreateTask={createTaskFromContext}
        onDeleteTask={(taskId) => {
          deleteTask(taskId);
          setContextMenu({ ...contextMenu, show: false });
        }}
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
