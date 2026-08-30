import type { CatalogueItem, PlacedItem } from '@/lib/planner';

const SCALE = 0.1;
const INSET = 20;

export function createFurnitureLabels(items: PlacedItem[], catalogue: CatalogueItem[]) {
  const catalogueById = new Map(catalogue.map((item) => [item.catalogueItemId, item]));

  return items.flatMap((item) => {
    const definition = catalogueById.get(item.catalogueItemId);
    if (!definition) return [];

    const rotated = item.rotationDeg === 90 || item.rotationDeg === 270;
    const visualDepth = rotated ? definition.widthMm : definition.depthMm;
    const rugOffset = definition.solid ? 0 : visualDepth * SCALE / 2 - 12;

    return [{
      itemId: item.itemId,
      name: definition.name,
      x: INSET + item.xMm * SCALE,
      y: INSET + item.yMm * SCALE + rugOffset,
    }];
  });
}
