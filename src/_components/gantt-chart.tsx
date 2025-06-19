"use client";

import React, { useEffect, useRef, useState } from "react";
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
import { GanttHeader } from "./gantt-header";
import { GanttGridCanvas } from "./gantt-grid-canvas";
import { GanttTaskLayer } from "./gantt-task-layer";
import { ContextMenu } from "./context-menu";
import { TaskEditModal } from "./task-edit-modal";
import { TaskList } from "./task-list";
import { TodayButton } from "./today-button";
import { useHolidays } from "@/hooks/use-holidays";
import { taskColors } from "@/_constants/task-colors";
import { CELL_WIDTH, CELL_HEIGHT } from "@/_constants/gantt-constants";

export const GanttChart = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dates, setDates] = useState(() => generateDates([]));
  const [rows, setRows] = useState<string[]>(() =>
    Array(100)
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
  const { data: holidayData = [] } = useHolidays(dates);

  // Holiday[] 배열에서 날짜 문자열만 추출
  const holidays = holidayData.map((holiday) => holiday.date);

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

  // 리사이즈 핸들러들
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

  // 캔버스 셀 클릭 핸들러 (빈 영역)
  const handleCanvasCellClick = (
    row: number,
    col: number,
    e: React.MouseEvent
  ) => {
    handleMouseDown(row, col, e);
  };

  // 캔버스 셀 우클릭 핸들러
  const handleCanvasCellRightClick = (
    row: number,
    col: number,
    e: React.MouseEvent
  ) => {
    console.log("Canvas right click:", { row, col });
    handleRightClick(row, col, e);
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

        {/* 성능 정보 표시 */}
        <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
          🚀 하이브리드 캔버스 최적화 (행: {rows.length}, 셀:{" "}
          {dates.length * rows.length})
        </div>
      </div>

      <div
        ref={ganttRef}
        className="border border-gray-300 overflow-auto relative"
        style={{ height: "600px" }}
        onMouseMove={handleGanttMouseMove}
        onMouseUp={(e) => handleMouseUp(e.nativeEvent)}
      >
        {/* 헤더 - 날짜 */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <GanttHeader
            dates={dates}
            holidays={holidayData}
            columnSelection={columnSelection}
            monthSelection={monthSelection}
            onColumnClick={handleColumnClickWithMonthClear}
            onMonthClick={handleMonthClick}
          />
        </div>

        {/* 간트 차트 콘텐츠 영역 */}
        <div className="relative">
          {/* 콘텐츠 크기를 정의하는 컨테이너 */}
          <div
            className="relative"
            style={{
              width: `${dates.length * CELL_WIDTH}px`,
              height: `${rows.length * CELL_HEIGHT}px`,
            }}
          >
            {/* 캔버스 격자 그리드 */}
            <GanttGridCanvas
              dates={dates}
              rows={rows}
              holidays={holidays}
              columnSelection={columnSelection}
              monthSelection={monthSelection}
              onCellClick={handleCanvasCellClick}
              onCellRightClick={handleCanvasCellRightClick}
            />

            {/* HTML 태스크 레이어 */}
            <GanttTaskLayer
              dates={dates}
              rows={rows}
              tasks={tasks}
              dragState={dragState}
              dragSelection={dragSelection}
              onMouseDown={handleMouseDown}
              onMouseEnter={handleMouseEnter}
              onTaskClick={handleTaskClick}
              onResizeStart={handleResizeStart}
              onResizeEnd={handleResizeEnd}
              onContextMenu={handleRightClick}
            />
          </div>
        </div>
      </div>

      {/* 컨텍스트 메뉴 */}
      <ContextMenu
        show={contextMenu.show}
        x={contextMenu.x}
        y={contextMenu.y}
        task={contextMenu.task}
        onCreateTask={createTaskFromContext}
        onDeleteTask={(taskId: string) => {
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
