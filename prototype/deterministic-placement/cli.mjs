import readline from "node:readline";
import {
  createPreparedState,
  movedAndLockedSofaState,
  planPreparedVariant,
  runAcceptanceProbes,
  templates,
  validateCandidateLayout,
} from "./planner.mjs";

const bold = "\x1b[1m";
const dim = "\x1b[2m";
const reset = "\x1b[0m";
const green = "\x1b[32m";
const red = "\x1b[31m";
const violet = "\x1b[35m";

if (process.argv.includes("--acceptance")) {
  const acceptance = runAcceptanceProbes();
  process.stdout.write(`${JSON.stringify(acceptance, null, 2)}\n`);
  process.exitCode = acceptance.passed ? 0 : 1;
} else {
  startInteractivePrototype();
}

function startInteractivePrototype() {
  if (!process.stdin.isTTY) {
    process.stderr.write("Interactive mode needs a terminal. Use --acceptance for a non-interactive run.\n");
    process.exitCode = 1;
    return;
  }

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();

  let frame = runConversation();
  render(frame);

  process.stdin.on("keypress", (_character, key) => {
    if (key.ctrl && key.name === "c") quit();

    const actions = {
      "1": runConversation,
      "2": runMedia,
      o: runOverlapProbe,
      b: runBoundsProbe,
      l: runLockProbe,
      r: runRouteProbe,
      a: runAllProbes,
    };

    if (key.name === "q") quit();
    if (actions[key.name]) {
      frame = actions[key.name]();
      render(frame);
    }
  });
}

function quit() {
  process.stdin.setRawMode(false);
  process.stdin.pause();
  process.stdout.write("\x1b[2J\x1b[H");
  process.exit(0);
}

function runConversation() {
  const state = createPreparedState();
  const result = planPreparedVariant({ state, intent: "conversation" });
  return { scenario: "Conversation template from an empty Working Layout", state, result };
}

function runMedia() {
  const state = movedAndLockedSofaState();
  const result = planPreparedVariant({ state, intent: "media" });
  return { scenario: "Media template after the human moves and locks sofa-1", state, result };
}

function runOverlapProbe() {
  const state = createPreparedState();
  const items = structuredClone(templates.conversation);
  Object.assign(items.find(({ itemId }) => itemId === "plant-1"), { xMm: 3_150, yMm: 2_000 });
  const result = validateCandidateLayout({ revision: state.revision, candidateItems: items });
  return { scenario: "Reject plant-1 overlapping coffee-1", state, result, items };
}

function runBoundsProbe() {
  const state = createPreparedState();
  const items = structuredClone(templates.conversation);
  Object.assign(items.find(({ itemId }) => itemId === "plant-1"), { xMm: 5_900, yMm: 1_400 });
  const result = validateCandidateLayout({ revision: state.revision, candidateItems: items });
  return { scenario: "Reject plant-1 outside the Room", state, result, items };
}

function runLockProbe() {
  const state = movedAndLockedSofaState();
  const items = structuredClone(templates.media);
  Object.assign(items.find(({ itemId }) => itemId === "sofa-1"), { xMm: 800, locked: true });
  const result = validateCandidateLayout({
    revision: state.revision,
    candidateItems: items,
    lockedItems: state.workingLayout.items.filter(({ locked }) => locked),
  });
  return { scenario: "Reject a 50 mm change to Locked Item sofa-1", state, result, items };
}

function runRouteProbe() {
  const state = createPreparedState();
  const items = structuredClone(templates.conversation);
  Object.assign(items.find(({ itemId }) => itemId === "plant-1"), { xMm: 5_550, yMm: 3_000 });
  const result = validateCandidateLayout({ revision: state.revision, candidateItems: items });
  return { scenario: "Reject plant-1 blocking the east leg of the Circulation Route", state, result, items };
}

function runAllProbes() {
  return {
    scenario: "Acceptance probes",
    state: createPreparedState(),
    acceptance: runAcceptanceProbes(),
  };
}

function render(frame) {
  process.stdout.write("\x1b[2J\x1b[H");
  process.stdout.write(`${bold}DETERMINISTIC PLACEMENT — THROWAWAY PROTOTYPE${reset}\n`);
  process.stdout.write(`${dim}Authored templates · Locked Item overlay · atomic validator${reset}\n\n`);
  process.stdout.write(`${bold}Scenario${reset}\n${frame.scenario}\n\n`);

  if (frame.acceptance) {
    renderAcceptance(frame.acceptance);
  } else {
    const result = frame.result;
    const validation = result.validation ?? result;
    const items = result.items ?? frame.items ?? frame.state.workingLayout.items;
    const valid = result.ok !== false && validation.valid;

    process.stdout.write(`${bold}State${reset}  revision ${frame.state.revision} · ${items.length} items\n`);
    for (let index = 0; index < items.length; index += 2) {
      const cells = items.slice(index, index + 2).map(formatItem);
      process.stdout.write(`${cells.join("  ")}\n`);
    }

    process.stdout.write(`\n${bold}Structured evidence${reset}\n`);
    process.stdout.write(`ok: ${result.ok}  valid: ${valid}  revision: ${result.revision}\n`);
    process.stdout.write(`fingerprint: ${validation.candidateFingerprint ?? "none"}\n`);
    const checks = validation.checks ?? [];
    for (let index = 0; index < checks.length; index += 4) {
      const cells = checks.slice(index, index + 4).map((check) => {
        const marker = check.passed ? `${green}PASS${reset}` : `${red}FAIL${reset}`;
        return `${marker} ${check.checkId}`;
      });
      process.stdout.write(`${cells.join("  ")}\n`);
    }
    for (const entry of validation.violations ?? result.error?.violations ?? []) {
      process.stdout.write(`${red}${entry.code}${reset} ${entry.message}\n`);
    }
  }

  process.stdout.write(
    `\n${bold}[1]${reset} conversation  ${bold}[2]${reset} media+lock  ${bold}[o]${reset} overlap  ${bold}[b]${reset} bounds  ${bold}[l]${reset} lock  ${bold}[r]${reset} route  ${bold}[a]${reset} all  ${bold}[q]${reset} quit\n`,
  );
}

function formatItem(placedItem) {
  const lock = placedItem.locked ? `${violet} L${reset}` : "  ";
  const cell = `${placedItem.itemId.padEnd(15)} ${placedItem.xMm.toString().padStart(4)},${placedItem.yMm
    .toString()
    .padStart(4)} ${placedItem.rotationDeg.toString().padStart(3)}°${lock}`;
  return cell.padEnd(34);
}

function renderAcceptance(acceptance) {
  const overall = acceptance.passed ? `${green}PASS${reset}` : `${red}FAIL${reset}`;
  process.stdout.write(`${bold}Acceptance${reset}  ${overall}\n`);
  for (const [name, probe] of Object.entries(acceptance.probes)) {
    const marker = probe.passed ? `${green}PASS${reset}` : `${red}FAIL${reset}`;
    const evidence = probe.violationCodes.length ? probe.violationCodes.join(", ") : probe.candidateFingerprint;
    process.stdout.write(`${marker} ${name.padEnd(28)} ${dim}${evidence}${reset}\n`);
  }
}
