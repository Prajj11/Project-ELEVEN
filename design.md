# Design & Gameplay Specifications
## PROJECT ELEVEN: AGENTIC FOOTBALL ARENA

---

### 1. 3D World & Pitch Environment

#### 1.1 Coordinate System & Scale
The 3D pitch adheres to a standard right-handed Cartesian coordinate system:
- **X-axis**: Pitch Width ($[-15\text{ m}, +15\text{ m}]$, total $30\text{ m}$).
- **Y-axis**: Height above ground ($Y = 0$ is the grass surface).
- **Z-axis**: Pitch Length ($[-25\text{ m}, +25\text{ m}]$, total $50\text{ m}$).
- **Blue Goal**: Positioned at $Z = -25\text{ m}$.
- **Red Goal**: Positioned at $Z = +25\text{ m}$.

#### 1.2 Pitch Markings & Dimensions
- **Playable Field**: $50\text{ m} \times 30\text{ m}$ (optimized for high-intensity 5v5 small-sided play).
- **Lines**: White markings ($0.12\text{ m}$ width) rendered just above the turf:
  - Touchlines ($Z = \pm 25\text{ m}$, $X = \pm 15\text{ m}$)
  - Halfway Line ($Z = 0$)
  - Center Circle (Radius $4.5\text{ m}$) & Center Spot ($[0, 0, 0]$)
  - Penalty Areas: Width $14\text{ m}$, depth $8\text{ m}$ extending in front of each goal.
  - Penalty Spots ($Z = \pm 19\text{ m}$).
- **Goals**:
  - Width: $4.5\text{ m}$ (from $X = -2.25$ to $X = +2.25$).
  - Height: $2.2\text{ m}$.
  - Depth: $1.5\text{ m}$ back into the netting.
  - Net: White semi-transparent hexagonal or grid mesh with physical backstop collision.

#### 1.3 Stadium & Lighting
- **Atmosphere**: Modern, night-time electric football arena aesthetic.
- **Lighting**:
  - 4 stadium floodlights positioned at pitch corners creating crisp directional shadows.
  - Subtle ambient sky light ensuring high visibility across all pitch quadrants.
- **Surrounding Arena**: Low-poly stadium grandstands with dynamic LED advertising boards surrounding the pitch perimeter.

---

### 2. Character & Player Visual Design

#### 2.1 Procedural 3D Footballer Model
Each footballer is constructed procedurally (or via clean modular meshes) with proper hierarchical rigging:
- **Head**: Spherical/stylized low-poly mesh with facial visor/hair tone.
- **Torso**: Athletic jersey with team colors and back squad number ($1$ to $5$).
- **Arms & Hands**: Articulated shoulder/elbow limbs for running and balance balance.
- **Legs & Feet**: Team shorts, high socks, and football boots with studs.

#### 2.2 Team Color Palettes & Contrast
- **Blue Team**: Electric Cyan/Royal Blue (`#0284c7` & `#38bdf8`) with white accents.
- **Red Team**: Crimson/Blaze Orange (`#e11d48` & `#fb7185`) with black accents.
- **Goalkeepers**: High-visibility neon kits (Volt Yellow `#eab308` for Blue GK, Neon Violet `#a855f7` for Red GK) to ensure instantaneous role recognition.

#### 2.3 Visual Identification & HUD Markers
- **Controlled Player Indicator**:
  - Floating illuminated cyan/gold chevron marker above the head.
  - Ground-projected circular stamina halo with directional forward indicator.
- **AI Teammates**: Distinctive jersey numbers with optional tactical role labels in debug/expanded mode.
- **Opponent Marker**: Subtle red ground indicator when challenging for possession.

---

### 3. Ball Physics & Interaction Design

#### 3.1 Ball Specs & Dynamics
- **Radius**: $0.22\text{ m}$ (standard Size 5 regulation equivalent).
- **Mass**: $0.45\text{ kg}$.
- **Restitution (Bounciness)**: $0.72$ against grass; $0.4$ against goalposts.
- **Friction & Rolling Resistance**: Decelerates naturally on turf; air drag applied to aerial shots.

#### 3.2 Mechanics & Ball Control
- **Possession Radius**: $1.1\text{ m}$ from player center.
- **Close Dribbling**: When moving, the ball is guided dynamically $0.6\text{ m}$ ahead of the player's facing direction.
- **Tackle Window**: An opponent within $1.4\text{ m}$ executing a tackle action dislodges the ball with outward momentum and applies a $0.8\text{ s}$ recovery delay to the dribbler.
- **Shooting Arc**: Directional impulse combining ground power ($18\text{ m/s}$) with vertical loft ($2\text{–}6\text{ m/s}$) based on charge time.
- **Passing Arc**: Direct, crisp ground passes ($12\text{–}15\text{ m/s}$) with leading target interpolation for moving teammates.

---

### 4. Camera Systems

#### 4.1 Follow Camera (Primary / Default)
- Elevated third-person isometric broadcast angle.
- Height: $14\text{ m}$, Offset: $Z \pm 16\text{ m}$, LookAt point dampened between the controlled player and the active ball position.
- Smooth camera spring/dampening ($0.08\text{ s}$ smooth time) preventing abrupt jerking during fast turns.

#### 4.2 Tactical / Ball-Tracking Camera (Secondary)
- Wider field overview ($22\text{ m}$ height) tracking the pitch centroid between ball and attacking players, offering optimal passing lane visibility.
- Toggleable via `C` key or in-game Settings menu.

---

### 5. UI/UX & HUD Design System

#### 5.1 Design Language
- **Theme**: Premium dark esports aesthetic (`#090d16` background, translucent glassmorphic surfaces, `#1e293b` borders).
- **Typography**: Clean, geometric sans-serif (Inter / Outfit) with high numerical scannability for timer and score.

#### 5.2 Key HUD Elements
1. **Top Scoreboard**:
   - Centered top bar displaying `BLUE [ 1 - 0 ] RED`.
   - Authoritative countdown match clock (`02:45`).
   - Active possession indicator badge.
2. **Bottom Status & Controls**:
   - Player Card: Assigned role (`ATTACKER`), Sprint stamina bar (`100%`).
   - Quick action prompt chips (`[E] PASS`, `[SPACE] SHOOT`, `[Q] TACKLE`).
3. **Tactical Observability Drawer (Collapsible)**:
   - Positioned on right screen margin.
   - Live Team Strategy badge (`HIGH_PRESS`, `COUNTER_ATTACK`).
   - Pressing intensity meter & formation layout.
   - Latest tactical AI decision rationale with timestamp (e.g., *"Red team pushed forward; switching to counter-attack"*).
4. **Goal Overlay**:
   - Full-width celebration banner: *"GOAL! BLUE TEAM SCORES!"*.
   - Replay/celebration camera focus (3-second duration).
5. **Post-Match Analytics Screen**:
   - Comprehensive match scorecard (Goals, Possession %, Shots on Target, Tackles, Pass Accuracy).
   - Tactical timeline showing how each team's LLM adapted strategies over time.

---

### 6. Sound & Haptic Feedback Design
- **Kick Sound**: Crisp physical thud on ball strike.
- **Tackle Sound**: Turf slide and foot challenge audio.
- **Whistle**: Referee whistle on Kickoff, Goal, and Full-time.
- **Goal Ambience**: Crowd cheer and goal siren burst.
- **Audio Controls**: Master, Sound Effects, and Ambience sliders in Settings with full local persistence.
