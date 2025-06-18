import { ColumnSelection } from "../_components/gantt-chart";

// ==========================================
// 선택 관련 유틸리티 함수들
// ==========================================

/**
 * 열 선택 상태 토글
 */
export const toggleColumnSelection = (
  currentSelection: ColumnSelection,
  columnIndex: number
): ColumnSelection => {
  if (
    currentSelection.isSelected &&
    currentSelection.selectedColumn === columnIndex
  ) {
    // 같은 열을 다시 클릭하면 선택 해제
    return { isSelected: false, selectedColumn: -1 };
  } else {
    // 새로운 열 선택
    return { isSelected: true, selectedColumn: columnIndex };
  }
};

/**
 * 열 선택 해제
 */
export const clearColumnSelection = (): ColumnSelection => {
  return { isSelected: false, selectedColumn: -1 };
};

/**
 * 특정 열이 선택되었는지 확인
 */
export const isColumnSelected = (
  columnSelection: ColumnSelection,
  columnIndex: number
): boolean => {
  return (
    columnSelection.isSelected && columnSelection.selectedColumn === columnIndex
  );
};

/**
 * 선택된 열의 모든 셀에 대한 정보 반환
 */
export const getSelectedColumnCells = (
  columnSelection: ColumnSelection,
  totalRows: number
): Array<{ row: number; col: number }> => {
  if (
    !columnSelection.isSelected ||
    columnSelection.selectedColumn === null ||
    columnSelection.selectedColumn === -1
  ) {
    return [];
  }

  const cells = [];
  const selectedCol = columnSelection.selectedColumn;
  for (let row = 0; row < totalRows; row++) {
    cells.push({ row, col: selectedCol });
  }
  return cells;
};

/**
 * 다중 선택 지원을 위한 유틸리티 (향후 확장용)
 */
export interface MultiSelection {
  selectedColumns: number[];
  selectedCells: Array<{ row: number; col: number }>;
}

/**
 * 다중 열 선택 토글 (향후 확장용)
 */
export const toggleMultiColumnSelection = (
  currentSelection: MultiSelection,
  columnIndex: number
): MultiSelection => {
  const isCurrentlySelected =
    currentSelection.selectedColumns.includes(columnIndex);

  if (isCurrentlySelected) {
    return {
      ...currentSelection,
      selectedColumns: currentSelection.selectedColumns.filter(
        (col) => col !== columnIndex
      ),
    };
  } else {
    return {
      ...currentSelection,
      selectedColumns: [...currentSelection.selectedColumns, columnIndex],
    };
  }
};
