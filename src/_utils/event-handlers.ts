import React from "react";
import {
  Task,
  DragState,
  ContextMenuState,
  ColumnSelection,
  DragSelection,
} from "../_components/gantt-chart";
import { getTaskForCell } from "./task-utils";
import { createNewTask } from "./task-utils";
import { calculateDragSelection } from "./drag-utils";

// ==========================================
// 이벤트 핸들러 유틸리티 함수들
// ==========================================

/**
 * 마우스 다운 이벤트 핸들러 (드래그 시작)
 */
export const createMouseDownHandler = (
  dates: string[],
  contextMenu: ContextMenuState,
  setDragState: React.Dispatch<React.SetStateAction<DragState>>,
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>,
  tasks: Task[]
) => {
  return (row: number, col: number, e: React.MouseEvent) => {
    if (e.button === 0) {
      const existingTask = getTaskForCell(row, col, tasks, dates);

      if (existingTask) {
        // 태스크 영역 클릭 - 이동 모드
        // 클릭한 위치와 태스크 시작점 사이의 오프셋 계산
        const taskStartCol = dates.indexOf(existingTask.startDate);
        const clickOffset = col - taskStartCol;

        console.log("Task clicked:", {
          taskName: existingTask.name,
          clickedCol: col,
          taskStartCol: taskStartCol,
          clickOffset: clickOffset,
        });

        setDragState({
          isDragging: true,
          dragType: "move",
          taskId: existingTask.id,
          startPos: { row, col },
          currentPos: { row, col },
          clickOffset: clickOffset, // 클릭 오프셋 저장
          startTime: Date.now(), // 클릭 시작 시간 저장
          startMousePos: { x: e.clientX, y: e.clientY }, // 클릭 시작 마우스 위치 저장
        });
      } else {
        // 빈 셀 클릭 - 새 태스크 생성 모드
        setDragState({
          isDragging: true,
          dragType: "new",
          startPos: { row, col },
          currentPos: { row, col },
          startTime: Date.now(),
          startMousePos: { x: e.clientX, y: e.clientY },
        });
      }

      setContextMenu({ ...contextMenu, show: false });
      // preventDefault가 존재하는 경우에만 호출
      if (e.preventDefault && typeof e.preventDefault === "function") {
        e.preventDefault();
      }
    }
  };
};

/**
 * 마우스 엔터 이벤트 핸들러 (드래그 중)
 */
export const createMouseEnterHandler = (
  dragState: DragState,
  setDragState: React.Dispatch<React.SetStateAction<DragState>>
) => {
  return (row: number, col: number) => {
    if (dragState.isDragging) {
      // 현재 위치와 동일하면 업데이트하지 않음
      if (
        dragState.currentPos?.row === row &&
        dragState.currentPos?.col === col
      ) {
        return;
      }

      if (
        dragState.dragType === "move" &&
        dragState.clickOffset !== undefined
      ) {
        console.log("Dragging move:", {
          currentCol: col,
          clickOffset: dragState.clickOffset,
          previewStartCol: col - dragState.clickOffset,
        });
      }

      setDragState({
        ...dragState,
        currentPos: { row, col },
      });
    }
  };
};

/**
 * 마우스 업 이벤트 핸들러 (드래그 종료)
 */
export const createMouseUpHandler = (
  dragState: DragState,
  tasks: Task[],
  dates: string[],
  setDragState: React.Dispatch<React.SetStateAction<DragState>>,
  setDragSelection: React.Dispatch<React.SetStateAction<DragSelection>>,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  onTaskClick?: (task: Task, e: MouseEvent) => void
) => {
  return (e?: MouseEvent) => {
    if (!dragState.isDragging || !dragState.startPos || !dragState.currentPos) {
      setDragState({ isDragging: false, dragType: "new" });
      return;
    }

    const {
      dragType,
      taskId,
      startPos,
      currentPos,
      clickOffset,
      startTime,
      startMousePos,
    } = dragState;

    // 클릭인지 드래그인지 판단
    const isClick = () => {
      if (!startTime || !startMousePos || !e) return false;

      const timeDiff = Date.now() - startTime;
      const mouseDiff = Math.sqrt(
        Math.pow(e.clientX - startMousePos.x, 2) +
          Math.pow(e.clientY - startMousePos.y, 2)
      );

      // 300ms 이내이고 5px 이내 움직임이면 클릭으로 판단
      return timeDiff < 300 && mouseDiff < 5;
    };

    // 태스크 클릭 처리
    if (dragType === "move" && taskId && isClick() && onTaskClick && e) {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        onTaskClick(task, e);
        setDragState({ isDragging: false, dragType: "new" });
        return;
      }
    }

    if (dragType === "new") {
      // 새 태스크 생성 - 바로 생성하지 않고 드래그 선택 영역으로 저장
      const startCol = Math.min(startPos.col, currentPos.col);
      const endCol = Math.max(startPos.col, currentPos.col);

      if (startCol !== endCol) {
        // 드래그 선택 영역 저장
        setDragSelection(calculateDragSelection(startPos, currentPos));
      }
    } else if (dragType === "move" && taskId) {
      // 태스크 이동
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const taskDuration =
          dates.indexOf(task.endDate) - dates.indexOf(task.startDate);

        // 클릭 오프셋을 사용하여 새로운 시작점 계산
        const newStartCol = currentPos.col - (clickOffset || 0);
        const newEndCol = newStartCol + taskDuration;

        console.log("Moving task:", {
          taskName: task.name,
          currentPosCol: currentPos.col,
          clickOffset: clickOffset,
          newStartCol: newStartCol,
          newEndCol: newEndCol,
          taskDuration: taskDuration,
        });

        // 배열 경계 검사
        if (
          newStartCol >= 0 &&
          newEndCol < dates.length &&
          newStartCol <= newEndCol
        ) {
          setTasks(
            tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    row: currentPos.row,
                    startDate: dates[newStartCol],
                    endDate: dates[newEndCol],
                  }
                : t
            )
          );
        }
      }
    } else if (dragType === "resize-start" && taskId) {
      // 태스크 시작점 리사이즈
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const originalEndCol = dates.indexOf(task.endDate);
        const newStartCol = Math.min(currentPos.col, originalEndCol);

        // 배열 경계 검사
        if (
          newStartCol >= 0 &&
          originalEndCol < dates.length &&
          newStartCol <= originalEndCol
        ) {
          setTasks(
            tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    startDate: dates[newStartCol],
                    endDate: dates[originalEndCol],
                  }
                : t
            )
          );
        }
      }
    } else if (dragType === "resize-end" && taskId) {
      // 태스크 끝점 리사이즈
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        const originalStartCol = dates.indexOf(task.startDate);
        const newEndCol = Math.max(currentPos.col, originalStartCol);

        // 배열 경계 검사
        if (
          originalStartCol >= 0 &&
          newEndCol < dates.length &&
          originalStartCol <= newEndCol
        ) {
          setTasks(
            tasks.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    startDate: dates[originalStartCol],
                    endDate: dates[newEndCol],
                  }
                : t
            )
          );
        }
      }
    }

    setDragState({ isDragging: false, dragType: "new" });
  };
};

/**
 * 우클릭 이벤트 핸들러 (컨텍스트 메뉴)
 */
export const createRightClickHandler = (
  tasks: Task[],
  dates: string[],
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>
) => {
  return (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    const existingTask = getTaskForCell(row, col, tasks, dates);

    if (!existingTask) {
      setContextMenu({
        show: true,
        x: e.clientX,
        y: e.clientY,
        row,
        col,
      });
    }
  };
};

/**
 * 컨텍스트 메뉴에서 태스크 생성 핸들러
 */
export const createTaskFromContextHandler = (
  contextMenu: ContextMenuState,
  dragSelection: DragSelection,
  dates: string[],
  tasks: Task[],
  taskColors: string[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setDragSelection: React.Dispatch<React.SetStateAction<DragSelection>>,
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>
) => {
  return () => {
    // 드래그 선택 영역이 있는지 확인
    if (
      dragSelection.isSelected &&
      dragSelection.startPos &&
      dragSelection.endPos
    ) {
      // 드래그 선택 영역에서 태스크 생성
      const newTask = createNewTask(
        dragSelection.startPos.row,
        dragSelection.startPos.col,
        dragSelection.endPos.col,
        dates,
        tasks,
        taskColors
      );
      setTasks([...tasks, newTask]);
      // 드래그 선택 영역 초기화
      setDragSelection({ isSelected: false });
    } else {
      // 기본 태스크 생성 (단일 셀)
      const newTask = createNewTask(
        contextMenu.row,
        contextMenu.col,
        contextMenu.col + 2,
        dates,
        tasks,
        taskColors
      );
      setTasks([...tasks, newTask]);
    }
    setContextMenu({ ...contextMenu, show: false });
  };
};

/**
 * 열 클릭 이벤트 핸들러
 */
export const createColumnClickHandler = (
  setColumnSelection: React.Dispatch<React.SetStateAction<ColumnSelection>>
) => {
  return (colIndex: number, e: React.MouseEvent) => {
    console.log("Column clicked:", colIndex); // 디버깅용
    e.stopPropagation(); // 이벤트 전파 방지
    setColumnSelection({
      isSelected: true,
      selectedColumn: colIndex,
    });
  };
};

/**
 * 외부 클릭 이벤트 핸들러 (컨텍스트 메뉴 및 열 선택 해제)
 */
export const createClickOutsideHandler = (
  ganttRef: React.RefObject<HTMLDivElement | null>,
  contextMenu: ContextMenuState,
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenuState>>,
  setColumnSelection: React.Dispatch<React.SetStateAction<ColumnSelection>>
) => {
  return (e: MouseEvent) => {
    // 간트차트 영역 외부 클릭인지 확인
    if (ganttRef.current && !ganttRef.current.contains(e.target as Node)) {
      if (contextMenu.show) {
        setContextMenu({ ...contextMenu, show: false });
      }
      // 열 선택도 해제
      console.log("Click outside - clearing column selection"); // 디버깅용
      setColumnSelection({
        isSelected: false,
        selectedColumn: null,
      });
    }
  };
};

/**
 * 간트 차트 전체 영역 마우스 무브 핸들러 (드래그 중)
 */
export const createGanttMouseMoveHandler = (
  dragState: DragState,
  dates: string[],
  taskNames: string[],
  ganttRef: React.RefObject<HTMLDivElement | null>,
  handleMouseEnter: (row: number, col: number) => void
) => {
  return (e: React.MouseEvent) => {
    if (dragState.isDragging && ganttRef.current) {
      const rect = ganttRef.current.getBoundingClientRect();
      const headerHeight = 40; // 헤더 높이
      const cellWidth = 60;
      const cellHeight = 40;

      // 스크롤 오프셋 고려
      const scrollLeft = ganttRef.current.scrollLeft;
      const scrollTop = ganttRef.current.scrollTop;

      const x = e.clientX - rect.left + scrollLeft;
      const y = e.clientY - rect.top - headerHeight + scrollTop;

      const col = Math.floor(x / cellWidth);
      const row = Math.floor(y / cellHeight);

      // 유효한 범위 내에서만 처리
      if (
        col >= 0 &&
        col < dates.length &&
        row >= 0 &&
        row < taskNames.length
      ) {
        handleMouseEnter(row, col);
      }
    }
  };
};
