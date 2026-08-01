# Football PA Announcer Web App

## Product Requirements and Build Specification

> **Instructions for GitHub Copilot coding agent:** Build the application described in this document as a functional, responsive MVP. Treat this file as the primary source of truth. If a minor implementation detail is not specified, choose the simplest accessible solution that supports fast live-game use. Do not remove or substantially change a listed requirement without documenting the reason.

---

## 1. Product Summary

Create a responsive web application that helps a public-address announcer manage an American football game and quickly generate accurate, natural-sounding announcements.

The primary users are PA announcers at middle-school and high-school football games. They normally identify players by **jersey number**, not by names printed on jerseys. The application must therefore make jersey-number selection fast and prominent while performing player-name and pronunciation lookup behind the scenes.

The application is a **game manager and announcement assistant**, not primarily a statistics application. It should track the game state, calculate gains and losses, update down and distance, manage possession, and generate announcements from a small amount of play input.

### Primary goal

Allow the PA announcer to record most plays in a few quick taps while remaining on one live-game dashboard.

### Typical run-play workflow

1. Select **Run**.
2. Select the offensive ball carrier by jersey number.
3. Select one or more defensive tacklers by jersey number, if known.
4. Enter or tap the ending ball position.
5. Review the automatically generated announcement.
6. Commit the play to game history.

---

## 2. Initial Platform and Technical Direction

### Initial delivery

- Responsive static web application suitable for deployment to GitHub Pages.
- Tablet-first design, optimized for an iPad in landscape orientation.
- Must also work well in current laptop and desktop browsers.
- No server is required for the initial MVP.
- Store teams, rosters, preferences, current game state, and game history in browser storage.
- Design the code so cloud persistence or a packaged mobile app can be added later.

### Recommended technology

Use a modern static front-end stack that supports GitHub Pages, such as:

- React
- TypeScript
- Vite
- CSS Modules, standard CSS, or another maintainable responsive styling approach
- Vitest for unit tests
- Browser `localStorage` or IndexedDB for MVP persistence

The agent may use an equivalent static-web stack if needed, but the finished project must build and deploy cleanly to GitHub Pages.

### Deployment requirement

Include:

- A production build command
- GitHub Pages-compatible base-path handling
- A short README with local setup and deployment instructions
- An optional GitHub Actions workflow for automated Pages deployment

---

## 3. Design Principles

1. **Speed first, accuracy close behind.**
2. **One live-game screen.** Run, pass, interception, sack, and other play entry must occur through a dynamic panel on the dashboard, not by navigating to separate pages.
3. **Jersey numbers are the primary live-game controls.**
4. **Large touch targets.** Interactive elements should generally be at least 48 by 48 CSS pixels.
5. **Minimal typing during the game.**
6. **Persistent game context.** Score, quarter, possession, ball location, down, and distance should remain visible.
7. **Easy correction.** Undoing or editing the previous play must be obvious.
8. **Readable at a glance.** Use strong contrast, clear hierarchy, and avoid dense decorative elements.
9. **Landscape tablet first.** Scale gracefully to laptop widths and provide a usable portrait or narrow-width fallback.
10. **No hidden critical controls.** The main play-entry functions must not depend on hover states.

---

## 4. Information Architecture

The MVP should include these application areas:

1. **Home / Saved Games**
2. **Team and Roster Management**
3. **New Game Setup**
4. **Live Game Dashboard**
5. **Play History**
6. **Settings / Announcement Preferences**

During live play, the user should spend almost all their time on the **Live Game Dashboard**.

---

## 5. Team and Roster Management

### Team fields

Each team record must support:

- Unique ID
- School name
- Mascot
- Short display name or abbreviation
- Jersey color
- Contrasting text color, automatically suggested but manually adjustable
- Optional team logo
- Default quarterback jersey number
- Roster

Do not use generic “team colors” as the key visual identifier. Use the team's **jersey color**, because that is what the announcer sees from the press box.

### Player fields

Each roster player must support:

- Unique ID
- Jersey number, stored as text to support values such as `0` and `00`
- First name
- Last name
- Display name
- Phonetic pronunciation
- Position
- Optional unit designation: offense, defense, special teams, or multiple
- Active/inactive status

Players may share a jersey number. If duplicates exist, the live selector must make the distinction visible using position, unit, or name after the number is tapped.

### Manual roster entry

Provide a form to:

- Add a player
- Edit a player
- Remove or deactivate a player
- Set the default quarterback
- Sort the displayed roster by numeric jersey number

### CSV import

Provide:

- File picker or drag-and-drop area
- Downloadable CSV template
- Import preview
- Validation messages
- Ability to correct or skip invalid rows
- Duplicate-number warning without automatically rejecting the import

Recommended CSV headers:

```csv
jerseyNumber,firstName,lastName,displayName,phoneticPronunciation,position,unit,active
12,Nathan,Smith,Nathan Smith,NAY-thun Smith,QB,Offense,true
33,Nathan,Bryant,Nathan Bryant,NAY-thun BRY-ant,RB,Offense,true
44,Michael,Johnson,Michael Johnson,MY-kul JON-sun,LB,Defense,true
```

At minimum, `jerseyNumber` and `displayName` are required. Column matching should be case-insensitive where practical.

---

## 6. New Game Setup

Before starting a game, collect:

- Home team
- Visiting team
- Which team is positioned on the left side of the field from the press-box viewpoint
- Which team is positioned on the right side
- Initial possession
- Starting ball position
- Starting down
- Starting distance
- Quarter
- Optional initial score and clock

### Ball-position entry

Represent a field position as:

- Team whose side of the field the ball is on
- Yard line from 1 through 49
- Midfield as 50
- Goal line when applicable

Examples:

- Spartans 35
- Hornets 44
- 50-yard line

The setup flow should prevent impossible values and clearly distinguish the two sides of the field.

---

## 7. Live Game Dashboard

## 7.1 Overall layout

The live dashboard is the hero experience. On a landscape tablet, organize it into the following persistent regions:

1. Game status header
2. Compact horizontal football field
3. Quick play-type controls
4. Dynamic play-entry panel
5. Announcement preview and play actions
6. Compact recent-play history or history drawer

The dashboard must not require page navigation to switch between run and pass entry. Selecting a play type updates the dynamic entry panel in place.

### Suggested landscape layout

```text
+------------------------------------------------------------------+
| Home/Visitor, score, quarter, clock, possession, down & distance |
+------------------------------------------------------------------+
| Compact field: left team | yard marks | ball | right team        |
+------------------+-------------------------+---------------------+
| Play-type panel  | Dynamic player entry    | Announcement        |
|                  | and end-ball position   | preview/actions     |
+------------------+-------------------------+---------------------+
| Recent plays / Undo last play / game controls                    |
+------------------------------------------------------------------+
```

On narrower screens, regions may stack, but the current game state and primary controls must remain easy to reach.

## 7.2 Persistent game-status header

Display:

- Home and visiting school/mascot names
- Jersey-color indicators
- Scores
- Quarter
- Optional game clock
- Possession
- Current ball position
- Current down and distance

The possession team should be visually obvious without relying only on color.

## 7.3 Mock football field

Display a horizontal field from the press-box perspective at midfield.

Include:

- Team assigned to the left side
- Team assigned to the right side
- Yard-line markings
- 50-yard line
- Current ball marker
- Direction of possession
- Optional line to gain
- Previous line of scrimmage after a play is being entered

The user must be able to tap the field to enter the ending ball position. Because tapping is not always precise, the selected location must be adjustable before the play is committed.

## 7.4 Flexible ending-ball-position entry

Support both methods simultaneously:

### Visual method

- Tap or click the football field.
- Convert the selected location to a specific team side and yard line.
- Show the interpreted spot clearly.

### Manual method

- Select the team side from a dropdown or segmented control.
- Enter or adjust the yard line.
- Provide plus and minus controls suitable for touch.
- Include a one-tap midfield option.

Both methods must stay synchronized.

---

## 8. Jersey-Number Selection

### General behavior

- Display only active players from the appropriate team's roster.
- Sort jersey numbers in ascending numeric order.
- Use large touch-friendly number buttons.
- The jersey number must be the most prominent text.
- After selection, show the player's name, position, and phonetic pronunciation.
- Provide a way to clear or change a selection.
- If duplicate jersey numbers exist, prompt the user to choose the correct player.

### Suggested number grid

```text
[ 1 ] [ 2 ] [ 4 ] [ 7 ] [ 8 ]
[10 ] [11 ] [12 ] [15 ] [18 ]
[21 ] [24 ] [28 ] [33 ] [34 ]
[44 ] [52 ] [72 ] [81 ] [88 ]
```

Do not show nonexistent numbers merely to make the grid complete.

### Optional speed enhancement

A recent/frequent row may appear above the full grid, but it must not replace the ascending roster grid.

---

## 9. Play Types and Dynamic Entry Requirements

Provide large quick-select controls for at least:

- Run
- Pass complete
- Pass incomplete
- Sack
- Interception
- Fumble
- Penalty
- Punt
- Kickoff
- Field goal
- Extra point
- Two-point conversion
- Touchdown
- Safety
- Other / manual announcement

The MVP can emphasize the most common controls and place less common play types in a `More` menu, provided they remain easy to access.

## 9.1 Run

Inputs:

- Ball carrier, required
- Primary tackler, optional
- Additional tackler or assist tacklers, optional and repeatable
- Ending ball position, required
- Touchdown toggle or automatic touchdown detection
- Optional out-of-bounds result

## 9.2 Pass complete

Inputs:

- Passer, prepopulated from the possession team's default quarterback
- Receiver, required
- Primary tackler, optional
- Additional tacklers, optional and repeatable
- Ending ball position, required
- Touchdown toggle or automatic detection
- Optional out-of-bounds result

The user must be able to override the default passer.

## 9.3 Pass incomplete

Inputs:

- Passer, prepopulated from the default quarterback
- Intended receiver, optional
- Defender credited with breakup, optional
- Optional reason: dropped, broken up, thrown away, spike

An incomplete pass normally leaves the ball at the previous line of scrimmage and advances the down.

## 9.4 Sack

Inputs:

- Quarterback, prepopulated from the default quarterback
- Primary sacking defender, required when known
- Assist defender or defenders, optional
- Ending ball position, required

## 9.5 Interception

Inputs:

- Passer, prepopulated from the offense's default quarterback
- Intended receiver, optional
- Interceptor, required
- Return tackler or tacklers, optional
- Ending ball position, required

Committing an interception changes possession. The ending spot is where the intercepted team's return ends, not where the pass was caught unless there was no return.

## 9.6 Fumble

Inputs:

- Fumbling player, optional
- Player forcing the fumble, optional
- Recovering player, optional
- Recovering team, required
- Return tackler or tacklers, optional when applicable
- Ending ball position, required

Possession changes only when the opposing team recovers.

## 9.7 Punt and kickoff

Support:

- Kicker or punter
- Returner, optional
- Tackler or tacklers, optional
- Fair catch, touchback, out of bounds, blocked, or returned
- Ending ball position
- Possession update

## 9.8 Penalty

The penalty workflow must not force the announcer to know all officiating details immediately.

Support:

- Penalty team
- Penalty type, optional
- Jersey number, optional
- Accepted, declined, or offsetting
- Enforcement result
- New ball position
- Replay down or automatic first down where manually specified
- Free-text announcement override

For MVP, allow the user to manually set the resulting down, distance, possession, and ball spot after a penalty.

---

## 10. Defensive Tackler Selection

Defensive players are a core input, not an afterthought.

### Requirements

- Run and completed-pass panels must include defensive tackler selection.
- Show the opposing team's active roster in ascending jersey-number order.
- Allow one primary tackler.
- Allow zero or more assist tacklers.
- Make tackler entry optional so a play can be committed quickly when the announcer does not identify the defender.
- For sacks, change the wording and label to sacking defender.
- For interception and fumble returns, allow return tacklers from the team that was previously on offense.
- Include a setting to include or omit tacklers from generated announcements by default.

Suggested interaction:

1. First defender tapped becomes the primary tackler.
2. Additional defenders become assists.
3. Tapping a selected defender again removes that selection.
4. Provide a clear visual distinction between primary and assist selections.

---

## 11. Game-State and Field-Position Logic

Use a normalized internal coordinate for field math. One recommended model is an integer from `0` through `100`, measured from the possession team's own goal line at the start of the current play. Carefully convert the coordinate when possession changes.

### Required calculations

The app must calculate or update:

- Gain or loss from the previous ball spot to the ending spot
- Down
- Distance to first down
- First down
- Turnover on downs
- Possession changes
- Touchdown
- Safety
- Ball position
- Drive history

### Standard-play behavior

For a normal run or completed pass:

- Determine gain or loss from start and end positions.
- If the offense reaches or passes the line to gain, set first and 10 unless the ball is closer than 10 yards to the goal line.
- Otherwise increment the down and reduce the distance by the gained yardage.
- On fourth down without a first down, change possession at the ending spot unless another result overrides it.

For incomplete passes:

- Keep ball position unchanged.
- Increment the down.
- Keep distance unchanged unless special handling is selected.

### Important limitation

High-school rules and penalty enforcement can vary. Do not silently apply complicated rule assumptions when uncertain. Provide editable game-state fields and a review step before committing unusual plays.

### Game-state review

Before a play is committed, show the proposed next state:

- Ball position
- Possession
- Down and distance
- Score change, if any

Allow the user to override these values.

---

## 12. Announcement Generation

Announcements should be generated immediately as inputs become complete, then finalized when the play is committed.

### Style goals

- Professional and concise
- Natural when read aloud
- Correct singular/plural usage
- Avoid unnecessary repetition
- Use school mascot or configured short team name
- Use jersey number and player display name
- Use full words such as “third down and four” where preferred

### Announcement settings

Allow preferences for:

- Include or omit player names
- Include or omit tacklers
- Say jersey numbers as `Number 33` or `33`
- Use ordinal words or short display format for downs
- Use mascot, school name, or short team name
- Include phonetic pronunciation as a visible helper, but do not put phonetic spelling into the spoken announcement
- Auto-generate immediately or require a review action

### Example: run

> Number 33 Nathan Bryant on the carry for the Spartans, brought down by Number 44 Michael Johnson after a gain of three yards to the Spartans 44-yard line. It will be third down and four for the Spartans.

### Example: run with assist

> Number 33 Nathan Bryant on the carry for the Spartans, tackled by Number 44 Michael Johnson with help from Number 52 David Williams. A gain of three yards to the Spartans 44-yard line. It will be third down and four.

### Example: pass complete

> Nathan Smith completes the pass to Number 88 Tyler Jones for a gain of seven yards to the Spartans 48-yard line. First down, Spartans.

### Example: incomplete pass

> Nathan Smith's pass intended for Number 88 Tyler Jones is incomplete. It will be second down and seven for the Spartans.

### Example: sack

> Quarterback Nathan Smith is sacked by Number 44 Michael Johnson for a loss of five yards back to the Spartans 36-yard line.

### Example: interception

> Nathan Smith's pass intended for Number 88 Tyler Jones is intercepted by Number 24 Michael Brown and returned to the Hornets 35-yard line. First down, Hornets.

### Preview actions

Provide:

- Edit announcement text
- Copy to clipboard
- Commit/save play
- Cancel entry
- Optional browser text-to-speech preview as a nonessential enhancement

An edited announcement should be stored with the play without altering the underlying reusable template.

---

## 13. Score, Clock, Quarter, and Possession Controls

For MVP:

- Score correction must be manually available.
- Touchdown, field goal, extra point, two-point conversion, and safety workflows may propose score changes.
- Quarter must be editable.
- Clock may be manually entered or optionally operated as a simple countdown.
- The app should not depend on an accurate running clock to function.
- Possession must always be manually correctable.

---

## 14. Play History, Editing, and Undo

Store every committed play with:

- Sequence number
- Quarter and clock value
- Starting game state
- Play type
- Selected offensive players
- Selected defensive players
- Starting and ending ball positions
- Calculated gain/loss
- Ending game state
- Generated announcement
- Edited announcement, if changed
- Timestamp

### History functionality

- Show the most recent plays on the dashboard.
- Open a complete play history view or drawer.
- Allow a play to be reviewed.
- Provide **Undo Last Play** as a persistent, obvious control.
- Undo must restore the full prior game state.
- If editing an earlier play would affect later state, warn the user and either recalculate subsequent plays or limit MVP editing to the latest play.

For the MVP, fully supporting undo and correction of the latest play is required. Editing arbitrary earlier plays is optional.

---

## 15. Suggested Data Model

Use clear TypeScript interfaces or equivalent models. A suggested starting point follows.

```ts
type TeamSide = 'home' | 'away';
type Unit = 'offense' | 'defense' | 'special-teams' | 'multiple';
type PlayType =
  | 'run'
  | 'pass-complete'
  | 'pass-incomplete'
  | 'sack'
  | 'interception'
  | 'fumble'
  | 'penalty'
  | 'punt'
  | 'kickoff'
  | 'field-goal'
  | 'extra-point'
  | 'two-point-conversion'
  | 'touchdown'
  | 'safety'
  | 'other';

interface Player {
  id: string;
  jerseyNumber: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  phoneticPronunciation?: string;
  position?: string;
  unit?: Unit;
  active: boolean;
}

interface Team {
  id: string;
  schoolName: string;
  mascot: string;
  shortName: string;
  abbreviation: string;
  jerseyColor: string;
  jerseyTextColor: string;
  logoDataUrl?: string;
  defaultQuarterbackPlayerId?: string;
  roster: Player[];
}

interface FieldPosition {
  territoryTeamId: string | null;
  yardLine: number;
  isMidfield: boolean;
  isGoalLine?: boolean;
}

interface GameState {
  homeTeamId: string;
  awayTeamId: string;
  leftFieldTeamId: string;
  rightFieldTeamId: string;
  possessionTeamId: string;
  quarter: number;
  clock?: string;
  homeScore: number;
  awayScore: number;
  down: 1 | 2 | 3 | 4;
  distance: number;
  ballPosition: FieldPosition;
  lineToGain?: FieldPosition;
  status: 'setup' | 'live' | 'halftime' | 'final';
}

interface PlayParticipants {
  passerId?: string;
  ballCarrierId?: string;
  receiverId?: string;
  intendedReceiverId?: string;
  interceptorId?: string;
  fumblerId?: string;
  recoveringPlayerId?: string;
  primaryDefenderId?: string;
  assistDefenderIds: string[];
  returnTacklerIds: string[];
}

interface PlayRecord {
  id: string;
  sequence: number;
  playType: PlayType;
  startState: GameState;
  endState: GameState;
  participants: PlayParticipants;
  endBallPosition?: FieldPosition;
  gainLoss?: number;
  announcement: string;
  editedAnnouncement?: string;
  notes?: string;
  createdAt: string;
}
```

Deep-clone or immutably snapshot game state in each play record so undo reliably restores the previous values.

---

## 16. Responsive Behavior

### Primary breakpoint: landscape tablet

Target a viewport around 1024 by 768 CSS pixels and larger.

- Keep status header compact.
- Use a three-column working area when space permits.
- Keep number-grid buttons large enough for fingers.
- Allow panels to scroll internally only when necessary.
- Avoid making the entire page excessively tall during live play.

### Desktop/laptop

- Expand spacing and panel widths.
- Do not make touch buttons unnecessarily small.
- Keep the same information order as tablet.

### Narrow or portrait screens

- Stack play types, participant selection, ball spot, and announcement preview.
- Use sticky game status and sticky commit/cancel actions where practical.
- Preserve all functionality even if the narrow layout is not the primary use case.

---

## 17. Visual Direction

Create a clean sports-operations interface rather than a consumer fantasy-football aesthetic.

### Use

- Neutral dark or light application shell with strong contrast
- Team jersey colors as controlled accents
- Clear selected/unselected states
- Rounded but not overly decorative cards
- Large numeric controls
- Simple field markings
- Icons only when accompanied by labels for critical actions

### Avoid

- Tiny text
- Excessive gradients
- Overly realistic field graphics that reduce readability
- Color-only status indicators
- Small dropdowns for common live actions
- Separate pages for each play type

---

## 18. Accessibility

- Meet WCAG AA contrast where practical.
- All functions must work with keyboard as well as touch/mouse.
- Use visible focus indicators.
- Provide accessible names for jersey buttons, such as `Select number 33 Nathan Bryant`.
- Do not use color as the only selection cue.
- Use semantic controls and regions.
- Announce important state changes through an appropriate ARIA live region without creating excessive screen-reader noise.
- Support browser zoom without breaking the layout.

---

## 19. Persistence and Recovery

- Autosave the active game after every meaningful change.
- Restore an interrupted game after browser refresh or accidental tab closure.
- Allow the user to start a new game without silently deleting the previous game.
- Provide export and import of game data as JSON if feasible.
- Keep saved team rosters separate from individual game snapshots.

---

## 20. Error Handling and Validation

Handle these cases clearly:

- CSV with missing required fields
- Duplicate jersey numbers
- Default quarterback missing from active roster
- Invalid yard line
- Same team selected as both home and visitor
- Ending ball position inconsistent with selected scoring result
- Attempt to commit without required participants
- Browser storage unavailable or full
- Accidental attempt to leave an active game

Warnings should not unnecessarily block the user during live action. Allow an explicit override when the app's football calculation may be wrong.

---

## 21. MVP Scope

### Required for MVP

- Responsive GitHub Pages-compatible web app
- Team creation and editing
- Jersey color, school name, mascot, and abbreviation
- Manual player entry
- CSV roster import with preview and validation
- Default quarterback setting
- New-game setup
- Single-screen live dashboard
- Horizontal press-box field view
- Field tap and manual ball-spot entry
- Ascending jersey-number grids
- Run workflow
- Pass complete workflow
- Pass incomplete workflow
- Sack workflow
- Interception workflow
- Primary and assist tackler selection
- Gain/loss calculation
- Basic down, distance, first down, possession, and scoring updates
- Announcement preview and editing
- Commit play
- Recent play history
- Undo last play
- Browser persistence and active-game recovery
- Automated tests for core field and down-distance calculations

### Strongly preferred if time permits

- Fumble workflow
- Punt and kickoff workflows
- Penalty override workflow
- Score controls
- JSON backup/restore
- Browser text-to-speech preview
- Recent-player shortcuts

### Future, not necessary for MVP

- Native iOS/Android app
- User accounts
- Cloud synchronization
- Shared stat-crew collaboration
- Full team and player statistics
- Live scoreboard integration
- Audio recording of pronunciations
- Automatic speech recognition
- External sports-data integrations

---

## 22. Acceptance Criteria

The MVP is successful when all of the following are true:

1. A user can create two teams with school name, mascot, jersey color, abbreviation, and roster.
2. A user can import a roster from CSV and correct invalid rows before saving.
3. A user can set a default quarterback for each team.
4. A user can start a game by selecting teams, possession, ball spot, down, and distance.
5. The live dashboard is usable at a 1024 by 768 landscape viewport without horizontal scrolling.
6. The user remains on the same dashboard when switching between run, pass, sack, and interception entry.
7. Offensive and defensive players are selected using ascending jersey-number grids.
8. A run can include a ball carrier, primary tackler, optional assist tacklers, and end spot.
9. A completed pass uses the default quarterback but allows the passer to be changed.
10. The ending ball location can be entered by tapping the field or by manual side/yard-line entry.
11. The app calculates gain or loss from the starting and ending ball locations.
12. The app proposes the next down, distance, possession, and ball position.
13. The user can override the proposed next game state before committing.
14. A natural-language announcement is generated from the play data.
15. The user can edit, copy, and save the announcement.
16. Committed plays appear in recent history.
17. Undo Last Play restores the complete preceding game state.
18. Refreshing the browser restores the active game.
19. Core controls are comfortably usable by touch on a tablet.
20. Unit tests cover field-coordinate conversion, gain/loss, first-down calculation, turnover on downs, interception possession change, and undo-state restoration.

---

## 23. Suggested Delivery Order

Build in small, testable stages:

### Phase 1: Foundation

- Project setup
- Routing or view-state structure
- Data models
- Local persistence service
- Responsive application shell

### Phase 2: Teams and rosters

- Team form
- Manual player entry
- CSV import and preview
- Default quarterback selection

### Phase 3: Game setup and state engine

- New-game form
- Field-position model
- Down-and-distance engine
- Possession and score state
- Unit tests

### Phase 4: Live dashboard

- Persistent header
- Field view
- Play-type controls
- Dynamic entry panel
- Ascending player grids
- Ball-spot controls

### Phase 5: Core play workflows

- Run
- Pass complete
- Pass incomplete
- Sack
- Interception
- Tackler and assist selection

### Phase 6: Announcements and history

- Templates
- Preview/edit/copy
- Commit play
- History
- Undo last play

### Phase 7: Reliability and polish

- Active-game recovery
- Validation
- Accessibility pass
- Responsive testing
- GitHub Pages deployment

---

## 24. Initial Demo Data

Seed optional demo teams so the interface can be tested immediately.

### South Paulding Spartans

- Jersey color: White
- Default quarterback: Number 12 Nathan Smith

Players:

- 12 Nathan Smith, QB, pronunciation: `NAY-thun Smith`
- 33 Nathan Bryant, RB, pronunciation: `NAY-thun BRY-ant`
- 44 John Davis, LB, pronunciation: `John DAY-vis`
- 52 David Williams, LB, pronunciation: `DAY-vid WILL-yums`
- 88 Tyler Jones, WR, pronunciation: `TY-ler Jones`

### Hiram Hornets

- Jersey color: Black
- Default quarterback: Number 7 Marcus Green

Players:

- 2 Jordan Hill, DB, pronunciation: `JOR-dun Hill`
- 7 Marcus Green, QB, pronunciation: `MAR-kus Green`
- 24 Michael Brown, DB, pronunciation: `MY-kul Brown`
- 44 Michael Johnson, LB, pronunciation: `MY-kul JON-sun`
- 81 Chris Taylor, WR, pronunciation: `Chris TAY-lor`

The names are sample data only and should be easy to replace.

---

## 25. Final Coding-Agent Instruction

Begin by creating a working implementation plan and project structure, then build the MVP in the delivery order above. Prioritize the live-game workflow, touch usability, reliable football-state calculations, and undo behavior over decorative polish.

When a football situation is ambiguous, do not guess silently. Show the proposed result, allow the PA announcer to correct it, and preserve both the structured play data and the final announcement text.
