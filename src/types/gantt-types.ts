// ==========================================
// 간트 차트 관련 타입 정의
// ==========================================

/**
 * 태스크 타입
 */
export type Task = {
  id: string;
  name?: string;
  startDate: string;
  endDate: string;
  row: number;
  color: string;
};

/**
 * 휴일 타입
 */
export type Holiday = {
  date: string; // YYYY-MM-DD 형식
  name: string; // 휴일명
  isHoliday: boolean; // 휴일 여부
};

/**
 * 날짜 범위 타입
 */
export type DateRange = {
  startYear: number;
  startMonth: number;
  endYear: number;
  endMonth: number;
};

/**
 * 컨텍스트 메뉴 상태 타입
 */
export type ContextMenuState = {
  show: boolean;
  x: number;
  y: number;
  row: number;
  col: number;
  task?: Task;
};

/**
 * 드래그 상태 타입
 */
export type DragState = {
  isDragging: boolean;
  dragType: "new" | "move" | "resize-start" | "resize-end";
  taskId?: string;
  startPos?: { row: number; col: number };
  currentPos?: { row: number; col: number };
  clickOffset?: number;
  startTime?: number;
  startMousePos?: { x: number; y: number };
};

/**
 * 드래그 선택 영역 상태 타입
 */
export type DragSelection = {
  isSelected: boolean;
  startPos?: { row: number; col: number };
  endPos?: { row: number; col: number };
};

/**
 * 열 선택 상태 타입
 */
export type ColumnSelection = {
  isSelected: boolean;
  selectedColumn: number | null;
};

/**
 * 월 선택 상태 타입
 */
export type MonthSelection = {
  isSelected: boolean;
  selectedMonth: string | null;
  startIndex: number;
  endIndex: number;
};

/**
 * 다중 선택 타입 (향후 확장용)
 */
export type MultiSelection = {
  selectedColumns: number[];
  selectedCells: Array<{ row: number; col: number }>;
};

/**
 * 태스크 편집 모달 상태 타입
 */
export type TaskEditModalState = {
  show: boolean;
  task: Task | null;
};

/**
 * 간트 셀 Props 타입
 */
export type GanttCellProps = {
  rowIndex: number;
  colIndex: number;
  dates: string[];
  tasks: Task[];
  holidays: Holiday[];
  dragState: DragState;
  dragSelection: DragSelection;
  columnSelection: ColumnSelection;
  monthSelection: MonthSelection;
  onMouseDown: (
    rowIndex: number,
    colIndex: number,
    e: React.MouseEvent
  ) => void;
  onMouseEnter: (rowIndex: number, colIndex: number) => void;
  onContextMenu: (
    rowIndex: number,
    colIndex: number,
    e: React.MouseEvent
  ) => void;
  onTaskClick?: (task: Task, e: React.MouseEvent) => void;
  onResizeStart?: (rowIndex: number, colIndex: number, taskId: string) => void;
  onResizeEnd?: (rowIndex: number, colIndex: number, taskId: string) => void;
};

/**
 * 간트 헤더 Props 타입
 */
export type GanttHeaderProps = {
  dates: string[];
  holidays: Holiday[];
  columnSelection: ColumnSelection;
  monthSelection: MonthSelection;
  onColumnClick: (colIndex: number, e: React.MouseEvent) => void;
  onMonthClick: (monthKey: string, startIndex: number, count: number) => void;
};

/**
 * 컨텍스트 메뉴 Props 타입
 */
export type ContextMenuProps = {
  show: boolean;
  x: number;
  y: number;
  task?: Task;
  onCreateTask: () => void;
  onDeleteTask: (taskId: string) => void;
};

/**
 * 태스크 편집 모달 Props 타입
 */
export type TaskEditModalProps = {
  show: boolean;
  task: Task | null;
  onSave: (taskId: string, newName: string) => void;
  onCancel: () => void;
};

/**
 * 태스크 리스트 Props 타입
 */
export type TaskListProps = {
  tasks: Task[];
  onDeleteTask: (taskId: string) => void;
};
