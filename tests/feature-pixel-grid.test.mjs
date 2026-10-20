import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const source = await readFile('src/lib/feature-pixel-grid.ts', 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { fitFeaturePixelGrid } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} != ${expected}`);

test('both panel sides fall between whole cells at fractional responsive widths', () => {
  for (const panelWidth of [271, 301, 323.5, 342.5, 360, 449.5, 460]) {
    for (const sideSpace of [[8, 8], [12, 12], [130, 82], [82, 130]]) {
      for (const target of [11, 13]) {
        const [left, right] = sideSpace;
        const grid = fitFeaturePixelGrid(panelWidth + left + right, 604, left, panelWidth, target);
        const leftColumn = (left - grid.horizontalOffset) / grid.cellSize;
        const rightColumn = (left + panelWidth - grid.horizontalOffset) / grid.cellSize;
        near(leftColumn, Math.round(leftColumn));
        near(rightColumn, Math.round(rightColumn));
        assert.ok(Math.abs(grid.cellSize - target) < 0.4);
      }
    }
  }
});

test('outer boundaries contain whole cells and leave symmetric vertical space', () => {
  for (const height of [276, 300.5, 480, 556.375, 604, 700.25]) {
    const width = 672.5;
    const grid = fitFeaturePixelGrid(width, height, 130.25, 460, 11);
    assert.ok(grid.horizontalOffset >= -1e-6);
    assert.ok(grid.horizontalOffset + grid.columns * grid.cellSize <= width + 1e-6);
    assert.ok(grid.verticalOffset >= -1e-6);
    near(grid.verticalOffset, height - grid.verticalOffset - grid.rows * grid.cellSize);
    assert.ok(width - grid.horizontalOffset - grid.columns * grid.cellSize < grid.cellSize + 1e-6);
  }
});
