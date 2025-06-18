/**
 * 태스크 위치로 스크롤하는 유틸리티 함수들
 */

/**
 * 특정 태스크 위치로 스크롤
 */
export const scrollToTask = (
  ganttRef: React.RefObject<HTMLDivElement | null>,
  taskRow: number,
  taskStartCol: number,
  taskEndCol: number,
  animated: boolean = true
) => {
  if (!ganttRef.current) return;

  const container = ganttRef.current;
  const cellWidth = 60;
  const cellHeight = 40;
  const headerHeight = 40;

  // 태스크의 중심 위치 계산
  const taskCenterCol = Math.floor((taskStartCol + taskEndCol) / 2);
  const taskCenterX = taskCenterCol * cellWidth;
  const taskCenterY = taskRow * cellHeight + headerHeight;

  // 컨테이너의 보이는 영역 크기
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // 스크롤할 위치 계산 (태스크가 중앙에 오도록)
  const scrollLeft = Math.max(0, taskCenterX - containerWidth / 2);
  const scrollTop = Math.max(0, taskCenterY - containerHeight / 2);

  if (animated) {
    container.scrollTo({
      left: scrollLeft,
      top: scrollTop,
      behavior: "smooth",
    });
  } else {
    container.scrollLeft = scrollLeft;
    container.scrollTop = scrollTop;
  }
};

/**
 * 특정 셀 위치로 스크롤
 */
export const scrollToCell = (
  ganttRef: React.RefObject<HTMLDivElement | null>,
  row: number,
  col: number,
  animated: boolean = true
) => {
  if (!ganttRef.current) return;

  const container = ganttRef.current;
  const cellWidth = 60;
  const cellHeight = 40;
  const headerHeight = 40;

  // 셀의 위치 계산
  const cellX = col * cellWidth;
  const cellY = row * cellHeight + headerHeight;

  // 컨테이너의 보이는 영역 크기
  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  // 현재 스크롤 위치
  const currentScrollLeft = container.scrollLeft;
  const currentScrollTop = container.scrollTop;

  // 셀이 보이는 영역에 있는지 확인
  const isVisible =
    cellX >= currentScrollLeft &&
    cellX + cellWidth <= currentScrollLeft + containerWidth &&
    cellY >= currentScrollTop &&
    cellY + cellHeight <= currentScrollTop + containerHeight;

  // 보이지 않는 경우에만 스크롤
  if (!isVisible) {
    const scrollLeft = Math.max(0, cellX - containerWidth / 2);
    const scrollTop = Math.max(0, cellY - containerHeight / 2);

    if (animated) {
      container.scrollTo({
        left: scrollLeft,
        top: scrollTop,
        behavior: "smooth",
      });
    } else {
      container.scrollLeft = scrollLeft;
      container.scrollTop = scrollTop;
    }
  }
};

/**
 * 드래그 영역으로 스크롤
 */
export const scrollToDragArea = (
  ganttRef: React.RefObject<HTMLDivElement | null>,
  startRow: number,
  startCol: number,
  endRow: number,
  endCol: number,
  animated: boolean = true
) => {
  if (!ganttRef.current) return;

  // 드래그 영역의 중심 위치 계산
  const centerRow = Math.floor((startRow + endRow) / 2);
  const centerCol = Math.floor((startCol + endCol) / 2);

  scrollToCell(ganttRef, centerRow, centerCol, animated);
};
