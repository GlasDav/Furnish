import type { CatalogueItem, PlacedItem } from '@/lib/planner';

const SCALE = 0.1;
const INSET = 20;
const HORIZONTAL_PADDING = 5;
const VERTICAL_PADDING = 3;
const MIN_FONT_SIZE = 8;

type Rect = { left: number; right: number; top: number; bottom: number };

function measureLine(line: string, fontSize: number) {
  return line.length * fontSize * 0.5;
}

function wrapLabel(name: string, maxWidth: number, fontSize: number) {
  return name.split(/\s+/).reduce<string[]>((lines, word) => {
    const current = lines.at(-1);
    if (!current || measureLine(`${current} ${word}`, fontSize) > maxWidth) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
    return lines;
  }, []);
}

function fitLabel(name: string, visualWidth: number, visualHeight: number, compact: boolean) {
  const maximumFontSize = compact ? 12 : 11;
  const layoutAtFontSize = (fontSize: number) => {
    const lines = wrapLabel(name, visualWidth - HORIZONTAL_PADDING * 2, fontSize);
    const lineHeight = fontSize + 2;
    return {
      lines,
      fontSize,
      lineHeight,
      width: Math.max(...lines.map((line) => measureLine(line, fontSize))) + HORIZONTAL_PADDING * 2,
      height: lines.length * lineHeight + VERTICAL_PADDING * 2,
    };
  };
  const fits = (layout: ReturnType<typeof layoutAtFontSize>) => layout.width <= visualWidth - 4 && layout.height <= visualHeight - 4;

  for (let fontSize = maximumFontSize; fontSize >= MIN_FONT_SIZE; fontSize -= 1) {
    const layout = layoutAtFontSize(fontSize);
    if (!fits(layout)) continue;
    const slightlySmaller = fontSize > MIN_FONT_SIZE ? layoutAtFontSize(fontSize - 1) : null;
    return slightlySmaller && fits(slightlySmaller) && slightlySmaller.lines.length < layout.lines.length
      ? slightlySmaller
      : layout;
  }

  return layoutAtFontSize(MIN_FONT_SIZE);
}

function overlaps(left: Rect, right: Rect) {
  return left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top;
}

function boundsAt(x: number, y: number, width: number, height: number): Rect {
  return { left: x - width / 2, right: x + width / 2, top: y - height / 2, bottom: y + height / 2 };
}

export function createFurnitureLabels(items: PlacedItem[], catalogue: CatalogueItem[], compact = false) {
  const catalogueById = new Map(catalogue.map((item) => [item.catalogueItemId, item]));
  const labelledItems = items.flatMap((item) => {
    const definition = catalogueById.get(item.catalogueItemId);
    if (!definition) return [];

    const rotated = item.rotationDeg === 90 || item.rotationDeg === 270;
    const visualWidth = (rotated ? definition.depthMm : definition.widthMm) * SCALE;
    const visualHeight = (rotated ? definition.widthMm : definition.depthMm) * SCALE;
    const x = INSET + item.xMm * SCALE;
    const y = INSET + item.yMm * SCALE;

    return [{
      item,
      definition,
      visualWidth,
      visualHeight,
      x,
      y,
      itemBounds: boundsAt(x, y, visualWidth, visualHeight),
      ...fitLabel(definition.name, visualWidth, visualHeight, compact),
    }];
  });

  const solidBounds = labelledItems.filter(({ definition }) => definition.solid).map(({ itemBounds }) => itemBounds);
  const placedBackgroundLabels: Rect[] = [];

  return labelledItems.map((label) => {
    let x = label.x;
    let y = label.y;

    if (!label.definition.solid) {
      const inset = 8;
      const candidateXs = [
        label.x,
        label.itemBounds.left + label.width / 2 + inset,
        label.itemBounds.right - label.width / 2 - inset,
      ];
      const candidateYs = [
        label.itemBounds.bottom - label.height / 2 - inset,
        label.itemBounds.top + label.height / 2 + inset,
        label.y,
      ];
      const candidate = candidateYs
        .flatMap((candidateY) => candidateXs.map((candidateX) => ({ x: candidateX, y: candidateY })))
        .find((entry) => {
          const bounds = boundsAt(entry.x, entry.y, label.width, label.height);
          return !solidBounds.some((solid) => overlaps(bounds, solid))
            && !placedBackgroundLabels.some((placed) => overlaps(bounds, placed));
        });
      if (candidate) ({ x, y } = candidate);
      placedBackgroundLabels.push(boundsAt(x, y, label.width, label.height));
    }

    return {
      itemId: label.item.itemId,
      name: label.definition.name,
      lines: label.lines,
      fontSize: label.fontSize,
      lineHeight: label.lineHeight,
      width: label.width,
      height: label.height,
      x,
      y,
    };
  });
}
