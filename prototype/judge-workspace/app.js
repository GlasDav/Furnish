// Three variants of the one-screen judge workspace, switchable via ?variant=.

const VARIANTS = {
  A: "Studio",
  B: "Guided runway",
  C: "Stage mode",
};

const STEPS = [
  { key: "read", short: "Read room", label: "Agent reads the Prepared Room" },
  { key: "furnish", short: "Furnish", label: "Agent creates a Conversation Variant" },
  { key: "move", short: "Move", label: "You move the sofa" },
  { key: "lock", short: "Lock", label: "You lock the sofa" },
  { key: "replan", short: "Replan", label: "Agent creates a Media Variant" },
  { key: "compare", short: "Compare", label: "You compare both Variants" },
  { key: "export", short: "Export", label: "You export the chosen Layout" },
];

const state = {
  phase: "empty",
  selected: null,
  sofa: { x: 315, y: 75, rotation: 0 },
  locked: false,
  compare: false,
  exported: false,
  activity: ["Prepared Room ready", "Waiting for ChatGPT"],
};

const positions = {
  conversation: [
    ["sofa", 315, 75, 210, 90, 0, "Sofa"],
    ["armchair", 220, 315, 80, 80, 180, "Chair"],
    ["armchair", 410, 315, 80, 80, 180, "Chair"],
    ["coffee", 315, 200, 120, 60, 0, "Coffee"],
    ["side", 175, 75, 50, 50, 0, "Side"],
    ["side", 455, 75, 50, 50, 0, "Side"],
    ["console", 37.5, 210, 150, 45, 90, "Media"],
    ["rug", 315, 220, 200, 300, 90, "Rug"],
    ["lamp", 120, 125, 40, 40, 0, "Lamp"],
    ["plant", 480, 140, 50, 50, 0, "Plant"],
  ],
  media: [
    ["sofa", 75, 225, 210, 90, 270, "Sofa"],
    ["armchair", 350, 90, 80, 80, 0, "Chair"],
    ["armchair", 350, 320, 80, 80, 180, "Chair"],
    ["coffee", 230, 210, 120, 60, 0, "Coffee"],
    ["side", 145, 145, 50, 50, 0, "Side"],
    ["side", 145, 305, 50, 50, 0, "Side"],
    ["console", 477.5, 225, 150, 45, 90, "Media"],
    ["rug", 285, 225, 200, 300, 90, "Rug"],
    ["lamp", 220, 335, 40, 40, 0, "Lamp"],
    ["plant", 460, 70, 50, 50, 0, "Plant"],
  ],
};

function currentVariant() {
  const requested = new URLSearchParams(location.search).get("variant")?.toUpperCase();
  return VARIANTS[requested] ? requested : "A";
}

function currentLayout() {
  if (state.phase === "empty") return null;
  return state.phase === "replanned" ? "media" : "conversation";
}

function completedStep() {
  const order = { empty: 0, conversation: 2, moved: 3, locked: 4, replanned: 5 };
  let completed = order[state.phase];
  if (state.compare) completed = Math.max(completed, 6);
  if (state.exported) completed = 7;
  return completed;
}

function nextInstruction() {
  if (state.phase === "empty") return "Ask ChatGPT to furnish for conversation";
  if (state.phase === "conversation") return "Move the sofa to the west wall";
  if (state.phase === "moved") return "Lock the sofa in place";
  if (state.phase === "locked") return "Ask ChatGPT to replan for media";
  if (!state.compare) return "Compare the two preserved Variants";
  return "Export the Media Variant";
}

function addActivity(message) {
  state.activity = [message, ...state.activity].slice(0, 4);
}

function button(action, label, kind = "secondary", disabled = false) {
  return `<button class="button ${kind}" data-action="${action}" ${disabled ? "disabled" : ""}>${label}</button>`;
}

function icon(name) {
  const icons = {
    room: '<path d="M4 5h16v14H4zM4 14h16M9 14v5"/>',
    catalogue: '<path d="M4 5h5v5H4zM15 5h5v5h-5zM4 15h5v5H4zM15 15h5v5h-5z"/>',
    variants: '<path d="M7 7h10v10H7zM4 4h10M4 4v10M20 10v10H10"/>',
    agent: '<path d="M12 3v3M5 8l-2-2M19 8l2-2M5 16l-2 2M19 16l2 2M12 18v3M8 12h8M12 8v8"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    export: '<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/>',
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
}

function furnitureMarkup(layoutName, mini = false) {
  if (!layoutName) return "";
  const items = positions[layoutName].map((raw, index) => {
    let [type, x, y, width, height, rotation, label] = raw;
    if (type === "sofa" && layoutName === "conversation" && ["moved", "locked"].includes(state.phase)) {
      ({ x, y, rotation } = state.sofa);
    }
    const isSelected = state.selected === type && !mini;
    const classes = ["furniture", `item-${type}`, isSelected ? "selected" : "", type === "rug" ? "rug" : ""]
      .filter(Boolean)
      .join(" ");
    const lock = type === "sofa" && state.locked && !mini
      ? '<g class="svg-lock" transform="translate(0,-31)"><circle r="13"/><path d="M-5-2v-4a5 5 0 0110 0v4M-7-2h14v10H-7z"/></g>'
      : "";
    const text = mini || type === "rug" ? "" : `<text y="4">${label}</text>`;
    return `<g class="${classes}" data-item="${type}" data-index="${index}" transform="translate(${x} ${y}) rotate(${rotation})">
      <rect x="${-width / 2}" y="${-height / 2}" width="${width}" height="${height}" rx="${type === "sofa" || type === "armchair" ? 9 : 3}" />
      ${text}${lock}
    </g>`;
  });
  return items.sort((a, b) => (a.includes(" rug") ? -1 : b.includes(" rug") ? 1 : 0)).join("");
}

function roomSvg(layoutName = currentLayout(), mini = false) {
  const emptyMessage = !layoutName && !mini
    ? `<g class="empty-room"><circle cx="320" cy="205" r="28"/><path d="M320 193v24M308 205h24"/><text x="320" y="252">Prepared Room is ready</text><text class="sub" x="320" y="274">ChatGPT can read the room and place furniture</text></g>`
    : "";
  return `<svg class="room-svg" viewBox="0 0 640 490" role="img" aria-label="Prepared Room ${layoutName ? `${layoutName} layout` : "without furniture"}">
    <defs><pattern id="grid-${mini ? "mini" : "main"}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20"/></pattern></defs>
    <rect class="room-paper" x="20" y="20" width="600" height="450" rx="3"/>
    <rect class="room-grid" x="20" y="20" width="600" height="450" fill="url(#grid-${mini ? "mini" : "main"})"/>
    <path class="circulation" d="M80 425H575V65"/>
    <path class="wall" d="M20 20H230M470 20H620V65M620 245V470H170M80 470H20V20"/>
    <path class="window" d="M230 20H470"/>
    <path class="slider" d="M620 65V245"/>
    <path class="door" d="M80 470H170M170 470A90 90 0 00110 385"/>
    ${furnitureMarkup(layoutName, mini)}
    ${emptyMessage}
    ${mini ? "" : '<text class="dimension width" x="320" y="485">6.0 m</text><text class="dimension depth" transform="translate(635 245) rotate(90)">4.5 m</text><text class="opening-label" x="350" y="14">WINDOW</text><text class="opening-label" transform="translate(632 160) rotate(90)">BALCONY</text>'}
  </svg>`;
}

function canvas(extraClass = "") {
  const layoutName = currentLayout();
  return `<section class="canvas-panel ${extraClass}">
    <div class="canvas-heading">
      <div><span class="eyebrow">Prepared Room</span><h2>${layoutName ? (layoutName === "media" ? "Media Variant" : "Conversation Variant") : "6.0 × 4.5 m"}</h2></div>
      <div class="validity ${layoutName ? "valid" : "waiting"}">${layoutName ? "✓ Valid Layout" : "Ready"}</div>
    </div>
    <div class="room-wrap">${roomSvg()}</div>
    <div class="canvas-legend"><span><i class="opening-dot"></i> Openings</span><span><i class="route-dot"></i> 900 mm Circulation Route</span><span>Drag the sofa to move it</span></div>
  </section>`;
}

function agentAction() {
  if (state.phase === "empty") return button("agent-plan", "Simulate agent furnishing", "primary");
  if (state.phase === "locked") return button("agent-replan", "Simulate agent replan", "primary");
  return "";
}

function manualActions() {
  return [
    button("move-sofa", "Move sofa", state.phase === "conversation" ? "primary" : "secondary", state.phase === "empty" || state.phase === "replanned"),
    button("toggle-lock", state.locked ? "Unlock sofa" : "Lock sofa", state.phase === "moved" ? "primary" : "secondary", !["moved", "locked"].includes(state.phase)),
  ].join("");
}

function finishActions() {
  return [
    button("compare", state.compare ? "Close comparison" : "Compare Variants", state.phase === "replanned" && !state.compare ? "primary" : "secondary", state.phase !== "replanned"),
    button("export", state.exported ? "Exported ✓" : "Export SVG", state.compare ? "primary" : "secondary", state.phase !== "replanned"),
  ].join("");
}

function activityList() {
  return state.activity.map((item, index) => `<li class="${index === 0 ? "latest" : ""}"><span></span>${item}<time>${index === 0 ? "now" : `${index + 1}m`}</time></li>`).join("");
}

function progressRail(horizontal = false) {
  const done = completedStep();
  return `<ol class="progress ${horizontal ? "horizontal" : ""}">${STEPS.map((step, index) => {
    const status = index < done ? "done" : index === done ? "current" : "future";
    return `<li class="${status}"><span class="step-index">${index < done ? "✓" : index + 1}</span><span><b>${step.short}</b>${horizontal ? "" : `<small>${step.label}</small>`}</span></li>`;
  }).join("")}</ol>`;
}

function comparePanel() {
  if (!state.compare) return "";
  return `<div class="compare-overlay" role="dialog" aria-label="Compare Variants">
    <div class="compare-header"><div><span class="eyebrow">Preserved Variants</span><h2>Choose the Layout to export</h2></div>${button("compare", "Close", "quiet")}</div>
    <div class="compare-grid">
      <article><div class="mini-room">${roomSvg("conversation", true)}</div><h3>Conversation</h3><p>Face-to-face seating around a shared table.</p><button class="text-button" data-action="choose-conversation">View this Variant →</button></article>
      <article class="chosen"><div class="mini-room">${roomSvg("media", true)}</div><h3>Media <span>Current</span></h3><p>Seating faces the console; your Locked Item stays put.</p><button class="text-button" data-action="choose-media">Keep this Variant →</button></article>
    </div>
  </div>`;
}

function variantA() {
  return `<div class="workspace variant-a">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Furnish home"><span>F</span> Furnish</a>
      <div class="project-title"><b>Prepared living room</b><span>Saved locally</span></div>
      <div class="top-actions"><span class="agent-status"><i></i> ChatGPT connected</span>${button("reset", "Reset", "quiet")}${button("export", "Export", "dark", state.phase !== "replanned")}</div>
    </header>
    <main class="studio-grid">
      <aside class="tool-shelf">
        <button class="active">${icon("room")}<span>Room</span></button>
        <button>${icon("catalogue")}<span>Catalogue</span></button>
        <button>${icon("variants")}<span>Variants <em>${state.phase === "replanned" ? 2 : state.phase === "empty" ? 0 : 1}</em></span></button>
      </aside>
      ${canvas("studio-canvas")}
      <aside class="inspector">
        <div class="inspector-head"><span class="eyebrow">Next action</span><h2>${nextInstruction()}</h2></div>
        <div class="action-stack">${agentAction()}${manualActions()}${finishActions()}</div>
        <div class="selection-card">
          <span class="eyebrow">Selection</span>
          ${state.selected === "sofa" ? `<h3>Standard sofa ${state.locked ? '<span class="lock-chip">Locked</span>' : ""}</h3><dl><div><dt>Size</dt><dd>2.1 × 0.9 m</dd></div><div><dt>Position</dt><dd>${Math.round(state.sofa.x * 10)}, ${Math.round(state.sofa.y * 10)} mm</dd></div></dl>` : '<p>Click furniture to inspect it.</p>'}
        </div>
        <div class="activity-card"><div class="section-title"><span class="eyebrow">Shared activity</span><span class="live-dot">Live</span></div><ul>${activityList()}</ul></div>
      </aside>
    </main>
    ${comparePanel()}
  </div>`;
}

function guidedActionFor(index) {
  if (index === 0 && state.phase === "empty") return button("agent-plan", "Run agent", "primary");
  if (index === 2 && state.phase === "conversation") return button("move-sofa", "Move sofa", "primary");
  if (index === 3 && state.phase === "moved") return button("toggle-lock", "Lock sofa", "primary");
  if (index === 4 && state.phase === "locked") return button("agent-replan", "Run replan", "primary");
  if (index === 5 && state.phase === "replanned" && !state.compare) return button("compare", "Compare", "primary");
  if (index === 6 && state.phase === "replanned") return button("export", "Export", "primary");
  return "";
}

function variantB() {
  const done = completedStep();
  return `<div class="workspace variant-b">
    <header class="runway-header"><a class="brand" href="#"><span>F</span> Furnish</a><div><span class="eyebrow">Judge demo</span><b>Prepared living room</b></div><span class="agent-status"><i></i> Agent linked</span>${button("reset", "Start over", "quiet")}</header>
    <main class="runway-grid">
      <aside class="director-panel">
        <span class="eyebrow">Three-minute runway</span>
        <h1>Furnish together.</h1>
        <p>Follow one visible hand-off between ChatGPT and you.</p>
        <ol class="director-steps">${STEPS.map((step, index) => {
          const status = index < done ? "done" : index === done ? "current" : "future";
          return `<li class="${status}"><span class="step-index">${index < done ? "✓" : index + 1}</span><div><b>${step.label}</b>${index === done ? `<small>${index === 0 || index === 4 ? "Agent turn" : "Your turn"}</small>${guidedActionFor(index)}` : ""}</div></li>`;
        }).join("")}</ol>
      </aside>
      <section class="runway-stage">
        <div class="stage-top"><div><span class="eyebrow">Live workspace</span><h2>${currentLayout() ? `${currentLayout() === "media" ? "Media" : "Conversation"} Variant` : "Prepared Room"}</h2></div><div class="stage-badges"><span>6.0 × 4.5 m</span><span>${currentLayout() ? "Valid Layout" : "Ready"}</span></div></div>
        <div class="runway-room">${roomSvg()}</div>
        <div class="handoff"><span class="turn-avatar ${["empty", "locked"].includes(state.phase) ? "agent-turn" : "human-turn"}">${["empty", "locked"].includes(state.phase) ? icon("agent") : "YOU"}</span><div><span class="eyebrow">${["empty", "locked"].includes(state.phase) ? "ChatGPT’s turn" : "Your turn"}</span><b>${nextInstruction()}</b></div><span class="validity ${currentLayout() ? "valid" : "waiting"}">${currentLayout() ? "✓ Constraints clear" : "Room readable"}</span></div>
      </section>
    </main>
    ${comparePanel()}
  </div>`;
}

function stageDock() {
  if (state.phase === "empty") return button("agent-plan", `${icon("agent")} Agent furnish`, "primary");
  if (state.phase === "conversation") return button("move-sofa", "Move sofa west", "primary");
  if (state.phase === "moved") return button("toggle-lock", `${icon("lock")} Lock sofa`, "primary");
  if (state.phase === "locked") return button("agent-replan", `${icon("agent")} Agent replan`, "primary");
  return `${button("compare", "Compare 2 Variants", "primary")}${button("export", state.exported ? "Exported ✓" : `${icon("export")} Export`, "secondary")}`;
}

function variantC() {
  return `<div class="workspace variant-c">
    <header class="stage-header"><a class="brand inverse" href="#"><span>F</span> Furnish</a><div class="stage-title"><b>Prepared living room</b><span>6.0 × 4.5 m</span></div><div class="stage-header-actions"><span class="agent-status inverse"><i></i> ChatGPT</span>${button("reset", "↺", "glass")}</div></header>
    <main class="focus-stage">
      <div class="stage-callout"><span class="turn-pip ${["empty", "locked"].includes(state.phase) ? "agent" : "human"}"></span><div><span class="eyebrow">${["empty", "locked"].includes(state.phase) ? "Agent turn" : "Your turn"}</span><h1>${nextInstruction()}</h1></div></div>
      <div class="focus-room">${roomSvg()}</div>
      <div class="constraint-toast"><span>✓ Room bounds</span><span>✓ Openings</span><span>✓ 900 mm route</span>${state.locked ? "<span>✓ Sofa locked</span>" : ""}</div>
      <div class="variant-filmstrip"><span class="eyebrow">Variants</span>${currentLayout() ? '<button class="variant-thumb active" data-action="choose-conversation"><span>01</span> Conversation</button>' : ""}${state.phase === "replanned" ? '<button class="variant-thumb active" data-action="choose-media"><span>02</span> Media</button>' : ""}</div>
      <div class="stage-dock">${stageDock()}</div>
      <div class="stage-activity"><span class="pulse"></span>${state.activity[0]}</div>
    </main>
    ${comparePanel()}
  </div>`;
}

function prototypeSwitcher(active) {
  if (!location.pathname.includes("prototype") && location.hostname !== "localhost") return "";
  return `<nav class="prototype-switcher" aria-label="Prototype variants"><button data-switch="prev" aria-label="Previous variant">←</button><span><small>Prototype</small><b>${active} — ${VARIANTS[active]}</b></span><button data-switch="next" aria-label="Next variant">→</button></nav>`;
}

function render() {
  const active = currentVariant();
  const views = { A: variantA, B: variantB, C: variantC };
  document.querySelector("#app").innerHTML = `${views[active]()}${prototypeSwitcher(active)}${state.exported ? '<div class="export-toast">Media Variant exported as SVG <button data-action="dismiss-toast">×</button></div>' : ""}`;
}

function perform(action) {
  if (action === "agent-plan") {
    state.phase = "conversation";
    state.sofa = { x: 315, y: 75, rotation: 0 };
    state.selected = null;
    addActivity("ChatGPT created Conversation Variant");
  }
  if (action === "move-sofa") {
    state.phase = "moved";
    state.sofa = { x: 75, y: 225, rotation: 270 };
    state.selected = "sofa";
    addActivity("You moved the sofa to the west wall");
  }
  if (action === "toggle-lock") {
    state.locked = !state.locked;
    state.phase = state.locked ? "locked" : "moved";
    state.selected = "sofa";
    addActivity(`You ${state.locked ? "locked" : "unlocked"} the sofa`);
  }
  if (action === "agent-replan") {
    state.phase = "replanned";
    state.selected = null;
    addActivity("ChatGPT created Media Variant around Locked Item");
  }
  if (action === "compare") state.compare = !state.compare;
  if (action === "choose-conversation") {
    state.compare = false;
    addActivity("Viewing preserved Conversation Variant");
  }
  if (action === "choose-media") {
    state.compare = false;
    addActivity("Media Variant selected for export");
  }
  if (action === "export") {
    state.exported = true;
    addActivity("You exported the Media Variant");
  }
  if (action === "dismiss-toast") state.exported = false;
  if (action === "reset") {
    Object.assign(state, { phase: "empty", selected: null, sofa: { x: 315, y: 75, rotation: 0 }, locked: false, compare: false, exported: false, activity: ["Prepared Room ready", "Waiting for ChatGPT"] });
  }
  render();
}

function switchVariant(direction) {
  const keys = Object.keys(VARIANTS);
  const index = keys.indexOf(currentVariant());
  const next = keys[(index + direction + keys.length) % keys.length];
  const params = new URLSearchParams(location.search);
  params.set("variant", next);
  history.replaceState({}, "", `${location.pathname}?${params}`);
  render();
}

let drag = null;

document.addEventListener("pointerdown", (event) => {
  const item = event.target.closest("[data-item]");
  if (!item) return;
  state.selected = item.dataset.item;
  if (item.dataset.item === "sofa" && currentLayout() === "conversation" && !state.locked) {
    drag = { svg: item.closest("svg") };
  } else {
    render();
  }
});

document.addEventListener("pointerup", (event) => {
  if (!drag) return;
  const bounds = drag.svg.getBoundingClientRect();
  const x = ((event.clientX - bounds.left) / bounds.width) * 640 - 20;
  const y = ((event.clientY - bounds.top) / bounds.height) * 490 - 20;
  state.sofa = { x: Math.max(55, Math.min(545, x)), y: Math.max(55, Math.min(395, y)), rotation: state.sofa.rotation };
  state.phase = "moved";
  addActivity("You dragged the sofa to a new position");
  drag = null;
  render();
});

document.addEventListener("click", (event) => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  const direction = event.target.closest("[data-switch]")?.dataset.switch;
  if (action) perform(action);
  if (direction) switchVariant(direction === "next" ? 1 : -1);
});

document.addEventListener("keydown", (event) => {
  const tag = document.activeElement?.tagName;
  if (["INPUT", "TEXTAREA"].includes(tag) || document.activeElement?.isContentEditable) return;
  if (event.key === "ArrowRight") switchVariant(1);
  if (event.key === "ArrowLeft") switchVariant(-1);
});

window.addEventListener("popstate", render);
render();
