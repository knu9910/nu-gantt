/**
 * 간트 차트 전용 색상 정의
 * 간트 차트의 셀, 태스크, 선택 상태, 공휴일/주말 등의 색상만 관리
 */

export const GANTT_COLORS = {
  // 간트 셀
  CELL: {
    BACKGROUND: "#FFFFFF",
    BORDER: "#E5E7EB",
    HOVER: "#F3F4F6",
  },

  // 공휴일
  HOLIDAY: {
    TEXT: "#DC2626",
    BACKGROUND: "#FEE2E2",
    DATE_TEXT: "#DC2626",
  },

  // 주말
  WEEKEND: {
    TEXT: "#3B82F6",
    BACKGROUND: "#EFF6FF",
    DATE_TEXT: "#3B82F6",
  },

  // 선택된 영역
  SELECTED: {
    COLUMN_BACKGROUND: "#DBEAFE",
    COLUMN_BORDER: "#93C5FD",
    MONTH_BACKGROUND: "#BFDBFE",
    DRAG_BACKGROUND: "#FEF3C7",
    DRAG_BORDER: "#FBBF24",
  },

  // 헤더
  HEADER: {
    BACKGROUND: "#F9FAFB",
    TEXT: "#111827",
    BORDER: "#D1D5DB",
  },

  // 태스크
  TASK: {
    TEXT: "#FFFFFF",
    RESIZE_HANDLE_HOVER: "rgba(255, 255, 255, 0.2)",
    PREVIEW_BORDER: "#9CA3AF",
  },

  // 컨텍스트 메뉴
  CONTEXT_MENU: {
    HOVER_BACKGROUND: "#F3F4F6",
  },

  // 텍스트
  TEXT: {
    PRIMARY: "#111827",
    SECONDARY: "#6B7280",
    MUTED: "#9CA3AF",
  },
} as const;
