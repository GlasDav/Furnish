# Room Planning

Language for the shared human-agent room-planning experience.

## Language

**Planner State**:
The single canonical state shared by the user and agent, comprising the Room, Working Layout, and preserved Variants.
_Avoid_: App state, agent state, canvas state

**Room**:
A single rectangular interior space whose width and depth are entered by the user. Supported dimensions range from 2.5 to 12 metres per side.
_Avoid_: Floor plan, fixed room

**Prepared Room**:
The default Room preset used for the demonstration. It starts at 6.0 by 4.5 metres but remains user-resizable.
_Avoid_: Sample room, immutable room

**Opening**:
A bounded section of a Room wall representing a door, window, or balcony access.
_Avoid_: Gap, cut-out

**Door Swing**:
The orientation of a hinged door, combining its left or right hinge side with an inward or outward swing direction.
_Avoid_: Door direction

**Furniture Catalogue**:
The complete set of furniture available for users to browse and place, sourced from Kenney's CC0 Furniture Kit.
_Avoid_: Inventory, verified catalogue

**Layout-Verified Item**:
A Furniture Catalogue item whose real dimensions, placement footprint, anchor, top-down appearance, and export behaviour have been confirmed. Deterministic agent layouts use only these items.
_Avoid_: Supported item, preferred item

**Layout**:
An arrangement of selected Furniture Catalogue items at specific positions and rotations within a Room.
_Avoid_: Floor plan, design

**Working Layout**:
The mutable Layout shared by the user and agent. Edits, locks, validation, and undo affect it without changing preserved Variants.
_Avoid_: Active variant, draft variant

**Valid Layout**:
A Layout that satisfies every hard spatial constraint, including room containment, solid-item separation, opening clearance, circulation, and locks.
_Avoid_: Good layout, preferred layout

**Circulation Route**:
A connected clear path at least 900 millimetres wide between the designated entrance and balcony access.
_Avoid_: Walkway, aisle

**Locked Item**:
A placed furniture item that agent replanning must preserve without moving, rotating, or removing it.
_Avoid_: Pinned item, fixed furniture

**Layout Intent**:
The user's preferred organising goal for ranking Valid Layouts, such as conversation or media viewing.
_Avoid_: Layout type, hard constraint

**Variant**:
A named, immutable snapshot of a Layout that can be loaded or compared without being overwritten.
_Avoid_: Version, draft

**Conversation Variant**:
A Variant whose Layout Intent prioritises face-to-face seating around a shared table.
_Avoid_: Original layout, first layout

**Media Variant**:
A Variant whose Layout Intent prioritises seating toward a media console while preserving the user's Locked Items.
_Avoid_: Revised layout, second layout
