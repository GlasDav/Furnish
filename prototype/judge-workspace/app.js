// PROTOTYPE ONLY: three visual-language directions for the approved A — Studio structure.
const DIRECTIONS = { A: "Drafting Table", B: "Blueprint Signal", C: "Quiet Gallery" };

const state = {
  phase: "empty", selected: null, locked: false, compare: false, exported: false,
  validation: "ready",
  motion: new URLSearchParams(location.search).get("motion") === "reduced" ? "reduced" : "full",
  activity: [
    { actor: "system", text: "Prepared Room is ready" },
    { actor: "agent", text: "ChatGPT can read the Room" },
  ],
};

const furniture = {
  conversation: [
    ["rug", 320, 242, 250, 280, 0], ["sofa", 320, 92, 220, 88, 0],
    ["chair", 175, 250, 82, 82, 90], ["chair", 465, 250, 82, 82, 270],
    ["table", 320, 242, 120, 66, 0], ["console", 88, 250, 130, 42, 90],
    ["plant", 520, 92, 52, 52, 0],
  ],
  media: [
    ["rug", 330, 242, 250, 280, 90], ["sofa", 105, 242, 220, 88, 270],
    ["chair", 350, 130, 82, 82, 0], ["chair", 350, 350, 82, 82, 180],
    ["table", 255, 242, 120, 66, 0], ["console", 535, 242, 130, 42, 90],
    ["plant", 500, 90, 52, 52, 0],
  ],
};

function direction() {
  const key = (new URLSearchParams(location.search).get("variant") || "A").toUpperCase();
  return DIRECTIONS[key] ? key : "A";
}

function layout() {
  if (state.phase === "empty") return null;
  return state.phase === "replanned" ? "media" : "conversation";
}

function addActivity(actor, value) {
  state.activity.unshift({ actor: actor, text: value });
  state.activity = state.activity.slice(0, 4);
}

function icon(name) {
  const paths = {
    room: '<path d="M4 5h16v14H4zM4 14h16M9 14v5"/>',
    catalogue: '<path d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v5H4zM14 15h6v5h-6z"/>',
    variants: '<path d="M7 7h10v10H7zM4 4h10M4 4v10M20 10v10H10"/>',
    agent: '<path d="M8 7h8l3 4v6l-3 3H8l-3-3v-6zM9 13h.01M15 13h.01M9 17h6M12 3v4"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    export: '<path d="M12 3v12M7 8l5-5 5 5M5 14v6h14v-6"/>',
    check: '<path d="M5 12l4 4L19 6"/>',
  };
  return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + paths[name] + '</svg>';
}

function button(action, label, kind, disabled) {
  return '<button class="button ' + (kind || "secondary") + '" data-action="' + action + '" ' + (disabled ? "disabled" : "") + '>' + label + '</button>';
}

function furnitureSymbol(item, index) {
  const type = item[0], width = item[3], height = item[4];
  let x = item[1], y = item[2], rotation = item[5];
  if (type === "sofa" && layout() === "conversation") {
    if (state.validation === "blocked") { x = 575; y = 155; rotation = 90; }
    else if (["moved", "locked"].includes(state.phase)) { x = 105; y = 242; rotation = 270; }
  }
  const selected = state.selected === type && type === "sofa";
  const locked = type === "sofa" && state.locked;
  let inside = "";
  if (type === "sofa") {
    inside = '<rect class="body" x="' + (-width / 2) + '" y="' + (-height / 2) + '" width="' + width + '" height="' + height + '" rx="12"/><rect class="cushion" x="' + (-width / 2 + 18) + '" y="' + (-height / 2 + 12) + '" width="' + (width / 2 - 22) + '" height="' + (height - 24) + '" rx="8"/><rect class="cushion" x="4" y="' + (-height / 2 + 12) + '" width="' + (width / 2 - 22) + '" height="' + (height - 24) + '" rx="8"/><path class="detail" d="M' + (-width / 2 + 14) + ' ' + (-height / 2 + 8) + 'v' + (height - 16) + 'M' + (width / 2 - 14) + ' ' + (-height / 2 + 8) + 'v' + (height - 16) + '"/>';
  } else if (type === "chair") {
    inside = '<rect class="body" x="' + (-width / 2) + '" y="' + (-height / 2) + '" width="' + width + '" height="' + height + '" rx="14"/><rect class="cushion" x="' + (-width / 2 + 14) + '" y="' + (-height / 2 + 14) + '" width="' + (width - 28) + '" height="' + (height - 28) + '" rx="10"/><path class="detail" d="M' + (-width / 2 + 9) + ' ' + (-height / 2 + 13) + 'h' + (width - 18) + '"/>';
  } else if (type === "table") {
    inside = '<rect class="body" x="' + (-width / 2) + '" y="' + (-height / 2) + '" width="' + width + '" height="' + height + '" rx="' + (direction() === "C" ? 32 : 8) + '"/><path class="detail" d="M' + (-width / 2 + 14) + ' 0h' + (width - 28) + '"/>';
  } else if (type === "console") {
    inside = '<rect class="body" x="' + (-width / 2) + '" y="' + (-height / 2) + '" width="' + width + '" height="' + height + '" rx="5"/><path class="detail" d="M' + (-width / 6) + ' ' + (-height / 2) + 'v' + height + 'M' + (width / 6) + ' ' + (-height / 2) + 'v' + height + '"/>';
  } else if (type === "rug") {
    inside = '<rect class="body" x="' + (-width / 2) + '" y="' + (-height / 2) + '" width="' + width + '" height="' + height + '" rx="10"/><path class="rug-lines" d="M' + (-width / 2 + 20) + ' ' + (-height / 2 + 24) + 'h' + (width - 40) + 'M' + (-width / 2 + 20) + ' ' + (height / 2 - 24) + 'h' + (width - 40) + '"/>';
  } else {
    inside = '<circle class="body" r="' + (width / 2) + '"/><path class="detail" d="M0-18V18M-18 0H18M-13-13L13 13M13-13L-13 13"/>';
  }
  return '<g class="furniture furniture-' + type + (selected ? " selected" : "") + '" data-item="' + type + '" data-index="' + index + '" transform="translate(' + x + ' ' + y + ') rotate(' + rotation + ')">' + inside + (locked ? '<g class="lock-mark" transform="translate(0,-62)"><circle r="15"/><path d="M-5-2v-4a5 5 0 0110 0v4M-7-2h14v10H-7z"/></g>' : "") + '</g>';
}

function roomSvg(which, mini) {
  const content = which ? furniture[which].map(furnitureSymbol).join("") : '<g class="empty-state"><circle cx="320" cy="228" r="31"/><path d="M320 214v28M306 228h28"/><text x="320" y="282">Prepared Room is ready</text><text class="sub" x="320" y="305">ChatGPT can read its bounds and openings</text></g>';
  const id = mini ? "mini-grid" : "room-grid";
  return '<svg class="room-svg" viewBox="0 0 640 490" role="img" aria-label="Prepared Room ' + (which || "ready") + '"><defs><pattern id="' + id + '" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20"/></pattern></defs><rect class="room-paper" x="20" y="20" width="600" height="450" rx="4"/><rect class="room-grid" x="20" y="20" width="600" height="450" fill="url(#' + id + ')"/><path class="circulation" d="M80 425H575V65"/><path class="wall" d="M20 20H230M470 20H620V65M620 245V470H170M80 470H20V20"/><path class="window" d="M230 20H470"/><path class="balcony" d="M620 65V245"/><path class="door" d="M80 470H170M170 470A90 90 0 00110 385"/>' + content + (mini ? "" : '<text class="dimension" x="320" y="487">6.0 m</text><text class="dimension" transform="translate(637 245) rotate(90)">4.5 m</text><text class="opening-label" x="350" y="13">WINDOW</text><text class="opening-label" transform="translate(632 155) rotate(90)">BALCONY</text>') + '</svg>';
}

function validationMarkup() {
  const content = {
    ready: ["ready", "Room readable", "Bounds and openings are available to ChatGPT."],
    valid: ["valid", "Valid Layout", "Room bounds, openings, circulation and locks pass."],
    warning: ["warning", "Check clearance", "The sofa is 120 mm from the preferred circulation buffer."],
    blocked: ["blocked", "Layout blocked", "The sofa overlaps the balcony clearance. Move it before locking."],
  }[state.validation];
  return '<section class="validation-card ' + content[0] + '"><div class="validation-icon">' + (content[0] === "valid" ? icon("check") : content[0] === "blocked" ? "!" : content[0] === "warning" ? "△" : "·") + '</div><div><span class="eyebrow">Validation</span><strong>' + content[1] + '</strong><p>' + content[2] + '</p></div></section>';
}

function nextAction() {
  if (state.validation === "blocked") return "Resolve the blocked sofa position";
  if (state.phase === "empty") return "Ask ChatGPT to furnish for conversation";
  if (state.phase === "conversation") return "Move the sofa to the west wall";
  if (state.phase === "moved") return "Lock the sofa in place";
  if (state.phase === "locked") return "Ask ChatGPT to replan for media";
  if (!state.compare) return "Compare the two preserved Variants";
  return "Export the Media Variant";
}

function actions() {
  if (state.phase === "empty") return button("plan", icon("agent") + " Simulate agent furnishing", "primary");
  if (state.validation === "blocked") return button("fix", "Move sofa to clear opening", "primary");
  if (state.phase === "conversation") return button("move", "Move sofa west", "primary") + button("block", "Preview blocked state", "quiet");
  if (state.phase === "moved") return button("lock", icon("lock") + " Lock sofa", "primary") + button("warn", "Preview warning", "quiet");
  if (state.phase === "locked") return button("replan", icon("agent") + " Simulate agent replan", "primary");
  return button("compare", "Compare Variants", "primary") + button("export", icon("export") + " Export", "secondary");
}

function activityMarkup() {
  return state.activity.map(function (entry, index) {
    const label = entry.actor === "agent" ? "AG" : entry.actor === "human" ? "YOU" : "SYS";
    return '<li class="' + entry.actor + (index === 0 ? " latest" : "") + '"><span class="actor-mark">' + label + '</span><span>' + entry.text + '</span><time>' + (index === 0 ? "now" : index + "m") + '</time></li>';
  }).join("");
}

function comparison() {
  if (!state.compare) return "";
  return '<div class="overlay" role="dialog" aria-label="Compare Variants"><section class="compare"><header><div><span class="eyebrow">Preserved Variants</span><h2>Compare without overwriting</h2></div>' + button("compare", "Close", "quiet") + '</header><div class="compare-grid"><article><div>' + roomSvg("conversation", true) + '</div><h3>Conversation Variant</h3><p>Face-to-face seating around a shared table.</p></article><article class="current"><div>' + roomSvg("media", true) + '</div><h3>Media Variant <span>Current</span></h3><p>Seating faces the console while the Locked Item stays put.</p></article></div></section></div>';
}

function prototypeBar(key) {
  return '<nav class="prototype-bar" aria-label="Prototype directions"><button data-switch="prev" aria-label="Previous direction">←</button><span><small>Visual direction</small><b>' + key + ' — ' + DIRECTIONS[key] + '</b></span><button data-switch="next" aria-label="Next direction">→</button><button class="motion-toggle" data-action="motion">Motion: ' + (state.motion === "reduced" ? "Reduced" : "Full") + '</button></nav>';
}

function render() {
  const key = direction(), currentLayout = layout();
  document.documentElement.dataset.motion = state.motion;
  document.querySelector("#app").innerHTML = '<div class="workspace direction-' + key.toLowerCase() + '"><header class="topbar"><a class="brand" href="#"><span class="brand-mark">F</span><span>Furnish</span></a><div class="project"><b>Prepared living room</b><span>Saved locally</span></div><div class="connection"><i></i><span>ChatGPT connected</span></div><button class="reset" data-action="reset">Reset</button></header><main class="studio"><aside class="tool-shelf"><button class="active">' + icon("room") + '<span>Room</span></button><button>' + icon("catalogue") + '<span>Catalogue</span></button><button>' + icon("variants") + '<span>Variants</span><em>' + (state.phase === "replanned" ? "2" : currentLayout ? "1" : "0") + '</em></button></aside><section class="canvas-card"><header class="canvas-heading"><div><span class="eyebrow">Prepared Room</span><h1>' + (currentLayout ? (currentLayout === "media" ? "Media Variant" : "Conversation Variant") : "6.0 × 4.5 m") + '</h1></div><span class="canvas-status ' + state.validation + '">' + (state.validation === "valid" ? "✓ Valid Layout" : state.validation === "blocked" ? "× Blocked" : state.validation === "warning" ? "△ Review" : "Ready") + '</span></header><div class="room-wrap">' + roomSvg(currentLayout, false) + '</div><footer class="legend"><span><i class="opening-key"></i> Openings</span><span><i class="route-key"></i> 900 mm Circulation Route</span><span>Click the sofa to inspect it</span></footer></section><aside class="inspector"><section class="next-card"><span class="turn-label ' + (["empty", "locked"].includes(state.phase) ? "agent" : "human") + '">' + (["empty", "locked"].includes(state.phase) ? "Agent turn" : "Your turn") + '</span><span class="eyebrow">Next action</span><h2>' + nextAction() + '</h2><div class="actions">' + actions() + '</div></section>' + validationMarkup() + '<section class="selection-card"><span class="eyebrow">Selection</span>' + (state.selected === "sofa" ? '<h3>Standard sofa ' + (state.locked ? '<span>Locked</span>' : "") + '</h3><dl><div><dt>Size</dt><dd>2.1 × 0.9 m</dd></div><div><dt>Position</dt><dd>West wall</dd></div></dl>' : '<p>Select an item to see dimensions, position and lock state.</p>') + '</section><section class="activity-card"><header><span class="eyebrow">Shared activity</span><span class="live">Live</span></header><ul>' + activityMarkup() + '</ul></section></aside></main>' + comparison() + (state.exported ? '<div class="toast">' + icon("check") + ' Media Variant exported as SVG</div>' : "") + '</div>' + prototypeBar(key);
}

function perform(action) {
  if (action === "plan") { state.phase = "conversation"; state.validation = "valid"; addActivity("agent", "Created Conversation Variant"); }
  else if (action === "move") { state.phase = "moved"; state.selected = "sofa"; state.validation = "valid"; addActivity("human", "Moved the sofa to the west wall"); }
  else if (action === "block") { state.selected = "sofa"; state.validation = "blocked"; addActivity("system", "Blocked overlap at balcony clearance"); }
  else if (action === "fix") { state.phase = "moved"; state.validation = "valid"; addActivity("human", "Moved sofa clear of the balcony"); }
  else if (action === "warn") { state.validation = "warning"; addActivity("system", "Flagged preferred circulation buffer"); }
  else if (action === "lock") { state.locked = true; state.phase = "locked"; state.validation = "valid"; addActivity("human", "Locked the sofa"); }
  else if (action === "replan") { state.phase = "replanned"; state.validation = "valid"; state.selected = null; addActivity("agent", "Created Media Variant around Locked Item"); }
  else if (action === "compare") state.compare = !state.compare;
  else if (action === "export") { state.exported = true; addActivity("human", "Exported Media Variant"); }
  else if (action === "motion") state.motion = state.motion === "full" ? "reduced" : "full";
  else if (action === "reset") Object.assign(state, { phase: "empty", selected: null, locked: false, compare: false, exported: false, validation: "ready", activity: [{ actor: "system", text: "Prepared Room is ready" }, { actor: "agent", text: "ChatGPT can read the Room" }] });
  render();
}

function switchDirection(delta) {
  const keys = Object.keys(DIRECTIONS);
  const next = keys[(keys.indexOf(direction()) + delta + keys.length) % keys.length];
  const params = new URLSearchParams(location.search);
  params.set("variant", next);
  history.replaceState({}, "", location.pathname + "?" + params.toString());
  render();
}

document.addEventListener("click", function (event) {
  const actionTarget = event.target.closest("[data-action]");
  const switchTarget = event.target.closest("[data-switch]");
  const item = event.target.closest("[data-item]");
  if (actionTarget) perform(actionTarget.dataset.action);
  if (switchTarget) switchDirection(switchTarget.dataset.switch === "next" ? 1 : -1);
  if (item && item.dataset.item === "sofa") { state.selected = "sofa"; render(); }
});

document.addEventListener("keydown", function (event) {
  const active = document.activeElement;
  if (["INPUT", "TEXTAREA"].includes(active && active.tagName) || (active && active.isContentEditable)) return;
  if (event.key === "ArrowLeft") switchDirection(-1);
  if (event.key === "ArrowRight") switchDirection(1);
});

window.addEventListener("popstate", render);
render();
