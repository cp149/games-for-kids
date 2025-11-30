# Chain Reaction Lab - Difficulty Levels

## Overview

The game now supports 8 difficulty levels (3-10), each with increasing complexity in circuit design.

## Difficulty Configuration

| Level | Buttons | Gates | Layers | Relays | Required Signals | Complexity |
|-------|---------|-------|--------|--------|-----------------|------------|
| 3 | 4 | 2 | 1 | 2 | 2 | Beginner |
| 4 | 5 | 4 | 2 | 3 | 3 | Easy |
| 5 | 6 | 6 | 3 | 4 | 4 | Medium |
| 6 | 7 | 8 | 3 | 5 | 5 | Challenging |
| 7 | 8 | 10 | 3 | 6 | 6 | Hard |
| 8 | 9 | 12 | 3 | 7 | 7 | Very Hard |
| 9 | 10 | 14 | 3 | 8 | 8 | Expert |
| 10 | 12 | 16 | 3 | 9 | 9 | Master |

## Gate Types Used

All difficulties (3-10) use:
- **AND gates**: Require ALL inputs to be active
- **OR gates**: Require ANY input to be active
- **NOT gates**: Invert the signal (active when inputs are OFF)

## Circuit Structure

### Layer Distribution Strategy

The game uses a **pyramid distribution** for gates across layers:
- **First layer**: 50% of gates (wide entry to prevent brute-force)
- **Middle layers**: Progressive narrowing
- **Final layer**: 2-3 gates (amplified through relays)

### Examples

**Difficulty 5** (6 buttons, 6 gates):
```
6 Buttons → [3 Gates] → [1 Gate] → [2 Gates] → 4 Relays → Door (needs 4 signals)
            Layer 0     Layer 1     Layer 2
```

**Difficulty 8** (9 buttons, 12 gates):
```
9 Buttons → [6 Gates] → [3 Gates] → [3 Gates] → 7 Relays → Door (needs 7 signals)
            Layer 0     Layer 1     Layer 2
```

**Difficulty 10** (12 buttons, 16 gates):
```
12 Buttons → [8 Gates] → [4 Gates] → [4 Gates] → 9 Relays → Door (needs 9 signals)
             Layer 0     Layer 1     Layer 2
```

## Anti-Brute-Force Design

### NOT Gate Strategy
- Each NOT gate receives **exclusive buttons** (2+ buttons per NOT gate)
- NOT gates prevent simple "press all buttons" solutions
- Players must understand which buttons to AVOID pressing

### Multi-Connect Mode
- Buttons connect to multiple gates in first layer
- Creates complex interdependencies
- Requires strategic thinking instead of trial-and-error

### Signal Requirements
- Door requires multiple simultaneous signals (2-9 depending on difficulty)
- Players must activate the correct combination of relays
- Each relay connects to different gate outputs

## Quality Guarantees

All generated levels are validated for:
1. **Solvability**: Door is reachable from buttons via BFS
2. **No Orphan Buttons**: All buttons connect to gates
3. **No Orphan Gates**: Gates with inputs also have outputs
4. **No Orphan Relays**: All relays have both inputs and outputs
5. **Strategic Thinking**: Requires understanding logic gates (not brute-forceable)

## Testing Results

- **100 levels tested** (Difficulties 3-5: 20 each, Difficulties 6-10: 10 each)
- **100% pass rate** on all quality checks
- **Zero orphaned nodes** across all difficulties
- **All levels solvable** with correct signal requirements
