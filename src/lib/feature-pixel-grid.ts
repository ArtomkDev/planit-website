// Fit whole square cells between both panel edges, then extend that lattice
// outward using whole cells only. The hidden panel interior absorbs no rounding.
export function fitFeaturePixelGrid(
  width: number,
  height: number,
  panelLeft: number,
  panelWidth: number,
  targetCellSize: number,
) {
  const panelColumns = Math.max(1, Math.round(panelWidth / targetCellSize));
  const cellSize = panelWidth / panelColumns;
  const horizontalOffset = panelLeft - Math.floor((panelLeft + 1e-7) / cellSize) * cellSize;
  const columns = Math.max(1, Math.floor((width - horizontalOffset + 1e-7) / cellSize));
  const rows = Math.max(1, Math.floor((height + 1e-7) / cellSize));
  return {
    cellSize,
    columns,
    rows,
    horizontalOffset,
    verticalOffset: (height - rows * cellSize) / 2,
  };
}
