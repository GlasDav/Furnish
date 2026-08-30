import { CATALOGUE, CATALOGUE_SOURCE } from '@/lib/planner';

export async function GET() {
  return Response.json({
    source: CATALOGUE_SOURCE,
    catalogueVersion: 'kenney-furniture-kit-1.0+verified-1',
    items: CATALOGUE.map((item) => ({
      catalogueItemId: item.catalogueItemId,
      sourceModel: item.sourceModel,
      name: item.name,
      layoutVerified: item.layoutVerified,
      footprintProvisional: item.footprintProvisional,
    })),
  });
}
