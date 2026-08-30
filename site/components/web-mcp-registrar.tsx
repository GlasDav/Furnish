'use client';

import { useEffect } from 'react';

import {
  plannerService,
  type LayoutIntent,
  type PlacedItem,
} from '@/lib/planner';

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: Record<string, boolean>;
  execute: (input: Record<string, unknown>) => unknown | Promise<unknown>;
};

type ModelContext = {
  registerTool: (definition: ToolDefinition, options: { signal: AbortSignal }) => Promise<void>;
};

const itemSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['itemId', 'catalogueItemId', 'xMm', 'yMm', 'rotationDeg', 'locked'],
  properties: {
    itemId: { type: 'string' },
    catalogueItemId: { type: 'string' },
    xMm: { type: 'integer' },
    yMm: { type: 'integer' },
    rotationDeg: { type: 'integer', enum: [0, 90, 180, 270] },
    locked: { type: 'boolean' },
  },
};

function invalidInput(error: unknown) {
  const revision = plannerService.getSnapshot().state.revision;
  return {
    ok: false,
    revision,
    error: {
      code: 'INVALID_INPUT',
      message: error instanceof Error ? error.message : 'The tool input was invalid.',
    },
  };
}

export function WebMcpRegistrar() {
  useEffect(() => {
    const modelContext = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (typeof modelContext?.registerTool !== 'function') {
      plannerService.setWebMcpStatus('manual');
      return;
    }

    const controller = new AbortController();
    const tools: ToolDefinition[] = [
      {
        name: 'read_planner_state',
        description: 'Read the complete revisioned Planner State, Layout-Verified catalogue, current validation, undo availability, and supported intents. Does not modify the planner.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        execute: async () => plannerService.readPlannerState(),
      },
      {
        name: 'validate_candidate_layout',
        description: 'Validate a complete candidate layout against the current Room and Locked Items without changing Planner State.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          required: ['expectedRevision', 'items'],
          properties: {
            expectedRevision: { type: 'integer', minimum: 1 },
            items: { type: 'array', items: itemSchema },
          },
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => {
          try {
            return plannerService.validateCandidate(Number(input.expectedRevision), input.items as PlacedItem[]);
          } catch (error) {
            return invalidInput(error);
          }
        },
      },
      {
        name: 'commit_variant',
        description: 'Atomically validate a complete Layout-Verified candidate, replace the Working Layout, and preserve an immutable named Variant. This visibly updates the shared page.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          required: ['expectedRevision', 'variantId', 'name', 'intent', 'items'],
          properties: {
            expectedRevision: { type: 'integer', minimum: 1 },
            variantId: { type: 'string', minLength: 1 },
            name: { type: 'string', minLength: 1 },
            intent: { type: 'string', enum: ['conversation', 'media'] },
            items: { type: 'array', items: itemSchema },
          },
        },
        execute: async (input) => {
          try {
            return plannerService.commitVariant({
              expectedRevision: Number(input.expectedRevision),
              variantId: String(input.variantId),
              name: String(input.name),
              intent: input.intent as LayoutIntent,
              items: input.items as PlacedItem[],
            });
          } catch (error) {
            return invalidInput(error);
          }
        },
      },
      {
        name: 'undo_last_change',
        description: 'Restore the previous complete Planner State at a new higher revision. This visibly updates the shared page.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          required: ['expectedRevision'],
          properties: { expectedRevision: { type: 'integer', minimum: 1 } },
        },
        execute: async (input) => plannerService.undo(Number(input.expectedRevision)),
      },
      {
        name: 'export_working_layout',
        description: 'Return the current Working Layout as SVG without changing Planner State.',
        inputSchema: {
          type: 'object',
          additionalProperties: false,
          required: ['expectedRevision'],
          properties: { expectedRevision: { type: 'integer', minimum: 1 } },
        },
        annotations: { readOnlyHint: true },
        execute: async (input) => plannerService.exportWorkingLayout(Number(input.expectedRevision)),
      },
    ];

    void (async () => {
      try {
        for (const tool of tools) {
          await modelContext.registerTool(tool, { signal: controller.signal });
        }
        plannerService.setWebMcpStatus('ready');
      } catch {
        controller.abort();
        plannerService.setWebMcpStatus('error');
      }
    })();

    return () => controller.abort();
  }, []);

  return null;
}
