/**
 * Level definitions for Chain Reaction Lab
 * Each level defines mechanisms and their connections
 */

export const levels = [
  {
    id: 0,
    title: 'First Connection',
    description: 'Learn the basics - click a button to activate the door',
    par: 1,
    mechanisms: [
      {
        type: 'button',
        id: 'A',
        x: 0.3,
        y: 0.5
      },
      {
        type: 'door',
        x: 0.7,
        y: 0.5,
        requiredSignals: 1
      }
    ],
    connections: [
      { from: 0, to: 1, color: '#00ffff' }
    ]
  },

  {
    id: 1,
    title: 'Double Trigger',
    description: 'Both buttons must be activated',
    par: 2,
    mechanisms: [
      {
        type: 'button',
        id: 'A',
        x: 0.3,
        y: 0.4
      },
      {
        type: 'button',
        id: 'B',
        x: 0.3,
        y: 0.6
      },
      {
        type: 'door',
        x: 0.7,
        y: 0.5,
        requiredSignals: 2
      }
    ],
    connections: [
      { from: 0, to: 2, color: '#00ffff' },
      { from: 1, to: 2, color: '#ff00ff' }
    ]
  },

  {
    id: 2,
    title: 'Chain Reaction',
    description: 'One button triggers a relay',
    par: 1,
    mechanisms: [
      {
        type: 'button',
        id: 'A',
        x: 0.2,
        y: 0.5
      },
      {
        type: 'relay',
        id: 'R',
        x: 0.5,
        y: 0.5
      },
      {
        type: 'door',
        x: 0.8,
        y: 0.5,
        requiredSignals: 1
      }
    ],
    connections: [
      { from: 0, to: 1, color: '#00ffff' },
      { from: 1, to: 2, color: '#ffaa00' }
    ]
  },

  {
    id: 3,
    title: 'Triangle Network',
    description: 'All buttons must be active',
    par: 3,
    mechanisms: [
      {
        type: 'button',
        id: 'A',
        x: 0.3,
        y: 0.3
      },
      {
        type: 'button',
        id: 'B',
        x: 0.5,
        y: 0.6
      },
      {
        type: 'button',
        id: 'C',
        x: 0.7,
        y: 0.3
      },
      {
        type: 'door',
        x: 0.7,
        y: 0.7,
        requiredSignals: 3
      }
    ],
    connections: [
      { from: 0, to: 3, color: '#00ffff' },
      { from: 1, to: 3, color: '#ff00ff' },
      { from: 2, to: 3, color: '#ffff00' }
    ]
  },

  {
    id: 4,
    title: 'Relay Race',
    description: 'Chain through multiple relays',
    par: 2,
    mechanisms: [
      {
        type: 'button',
        id: 'A',
        x: 0.15,
        y: 0.3
      },
      {
        type: 'button',
        id: 'B',
        x: 0.15,
        y: 0.7
      },
      {
        type: 'relay',
        id: 'R1',
        x: 0.5,
        y: 0.3
      },
      {
        type: 'relay',
        id: 'R2',
        x: 0.5,
        y: 0.7
      },
      {
        type: 'door',
        x: 0.85,
        y: 0.5,
        requiredSignals: 2
      }
    ],
    connections: [
      { from: 0, to: 2, color: '#00ffff' },
      { from: 1, to: 3, color: '#ff00ff' },
      { from: 2, to: 4, color: '#ffaa00' },
      { from: 3, to: 4, color: '#ff8800' }
    ]
  },

  {
    id: 5,
    title: 'Cross Circuit',
    description: 'Crossing paths - watch the connections',
    par: 2,
    mechanisms: [
      {
        type: 'button',
        id: 'A',
        x: 0.2,
        y: 0.3
      },
      {
        type: 'button',
        id: 'B',
        x: 0.2,
        y: 0.7
      },
      {
        type: 'relay',
        id: 'R1',
        x: 0.5,
        y: 0.3
      },
      {
        type: 'relay',
        id: 'R2',
        x: 0.5,
        y: 0.7
      },
      {
        type: 'door',
        x: 0.8,
        y: 0.3,
        requiredSignals: 1
      },
      {
        type: 'door',
        x: 0.8,
        y: 0.7,
        requiredSignals: 1
      }
    ],
    connections: [
      { from: 0, to: 2, color: '#00ffff' },
      { from: 1, to: 3, color: '#ff00ff' },
      { from: 2, to: 4, color: '#ffaa00' },
      { from: 3, to: 5, color: '#00ff88' }
    ]
  },

  {
    id: 6,
    title: 'Diamond Grid',
    description: 'Four corners, one goal',
    par: 3,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.5, y: 0.2 },
      { type: 'button', id: 'B', x: 0.2, y: 0.5 },
      { type: 'button', id: 'C', x: 0.8, y: 0.5 },
      { type: 'button', id: 'D', x: 0.5, y: 0.8 },
      { type: 'door', x: 0.5, y: 0.5, requiredSignals: 3 }
    ],
    connections: [
      { from: 0, to: 4, color: '#00ffff' },
      { from: 1, to: 4, color: '#ff00ff' },
      { from: 2, to: 4, color: '#ffff00' },
      { from: 3, to: 4, color: '#00ff88' }
    ]
  },

  {
    id: 7,
    title: 'Split Signal',
    description: 'One source, two paths',
    par: 1,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.5 },
      { type: 'relay', id: 'R1', x: 0.45, y: 0.5 },
      { type: 'relay', id: 'R2', x: 0.65, y: 0.3 },
      { type: 'relay', id: 'R3', x: 0.65, y: 0.7 },
      { type: 'door', x: 0.85, y: 0.5, requiredSignals: 2 }
    ],
    connections: [
      { from: 0, to: 1, color: '#00ffff' },
      { from: 1, to: 2, color: '#ff00ff' },
      { from: 1, to: 3, color: '#ffaa00' },
      { from: 2, to: 4, color: '#00ff88' },
      { from: 3, to: 4, color: '#ff8800' }
    ]
  },

  {
    id: 8,
    title: 'First Logic Gate - AND',
    description: 'Both buttons needed',
    par: 2,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.4 },
      { type: 'button', id: 'B', x: 0.2, y: 0.6 },
      { type: 'logic-gate', gateType: 'AND', id: 'G1', x: 0.5, y: 0.5 },
      { type: 'door', x: 0.8, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 2, color: '#ff6666' },
      { from: 1, to: 2, color: '#ff6666' },
      { from: 2, to: 3, color: '#ff6666' }
    ]
  },

  {
    id: 9,
    title: 'OR Gate',
    description: 'Any button works',
    par: 1,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.35 },
      { type: 'button', id: 'B', x: 0.2, y: 0.5 },
      { type: 'button', id: 'C', x: 0.2, y: 0.65 },
      { type: 'logic-gate', gateType: 'OR', id: 'O1', x: 0.5, y: 0.5 },
      { type: 'door', x: 0.8, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 3, color: '#66ccff' },
      { from: 1, to: 3, color: '#66ccff' },
      { from: 2, to: 3, color: '#66ccff' },
      { from: 3, to: 4, color: '#66ccff' }
    ]
  },

  {
    id: 10,
    title: 'AND + Relay',
    description: 'Logic gate with delay',
    par: 2,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.15, y: 0.4 },
      { type: 'button', id: 'B', x: 0.15, y: 0.6 },
      { type: 'logic-gate', gateType: 'AND', id: 'G1', x: 0.4, y: 0.5 },
      { type: 'relay', id: 'R1', x: 0.6, y: 0.5 },
      { type: 'door', x: 0.85, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 2, color: '#ff6666' },
      { from: 1, to: 2, color: '#ff6666' },
      { from: 2, to: 3, color: '#ffaa00' },
      { from: 3, to: 4, color: '#00ff88' }
    ]
  },

  {
    id: 11,
    title: 'XOR Gate - Only One',
    description: 'Exactly one button',
    par: 1,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.4 },
      { type: 'button', id: 'B', x: 0.2, y: 0.6 },
      { type: 'logic-gate', gateType: 'XOR', id: 'X1', x: 0.5, y: 0.5 },
      { type: 'door', x: 0.8, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 2, color: '#cc66ff' },
      { from: 1, to: 2, color: '#cc66ff' },
      { from: 2, to: 3, color: '#cc66ff' }
    ]
  },

  {
    id: 12,
    title: 'AND vs OR',
    description: 'Compare two gates',
    par: 2,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.35 },
      { type: 'button', id: 'B', x: 0.2, y: 0.5 },
      { type: 'button', id: 'C', x: 0.2, y: 0.65 },
      { type: 'logic-gate', gateType: 'AND', id: 'G1', x: 0.5, y: 0.4 },
      { type: 'logic-gate', gateType: 'OR', id: 'O1', x: 0.5, y: 0.6 },
      { type: 'door', x: 0.8, y: 0.4, requiredSignals: 1 },
      { type: 'door', x: 0.8, y: 0.6, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 3, color: '#ff6666' },
      { from: 1, to: 3, color: '#ff6666' },
      { from: 1, to: 4, color: '#66ccff' },
      { from: 2, to: 4, color: '#66ccff' },
      { from: 3, to: 5, color: '#ff6666' },
      { from: 4, to: 6, color: '#66ccff' }
    ]
  },

  {
    id: 13,
    title: 'XOR with Three',
    description: 'XOR challenge',
    par: 1,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.35 },
      { type: 'button', id: 'B', x: 0.2, y: 0.5 },
      { type: 'button', id: 'C', x: 0.2, y: 0.65 },
      { type: 'logic-gate', gateType: 'XOR', id: 'X1', x: 0.45, y: 0.4 },
      { type: 'logic-gate', gateType: 'XOR', id: 'X2', x: 0.45, y: 0.6 },
      { type: 'logic-gate', gateType: 'OR', id: 'O1', x: 0.7, y: 0.5 },
      { type: 'door', x: 0.9, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 3, color: '#cc66ff' },
      { from: 1, to: 3, color: '#cc66ff' },
      { from: 1, to: 4, color: '#cc66ff' },
      { from: 2, to: 4, color: '#cc66ff' },
      { from: 3, to: 5, color: '#66ccff' },
      { from: 4, to: 5, color: '#66ccff' },
      { from: 5, to: 6, color: '#00ff88' }
    ]
  },

  {
    id: 14,
    title: 'Three Gates Mix',
    description: 'AND + OR + XOR',
    par: 3,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.15, y: 0.25 },
      { type: 'button', id: 'B', x: 0.15, y: 0.5 },
      { type: 'button', id: 'C', x: 0.15, y: 0.75 },
      { type: 'logic-gate', gateType: 'AND', id: 'G1', x: 0.45, y: 0.35 },
      { type: 'logic-gate', gateType: 'OR', id: 'O1', x: 0.45, y: 0.65 },
      { type: 'logic-gate', gateType: 'XOR', id: 'X1', x: 0.7, y: 0.5 },
      { type: 'door', x: 0.9, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 3, color: '#ff6666' },
      { from: 1, to: 3, color: '#ff6666' },
      { from: 1, to: 4, color: '#66ccff' },
      { from: 2, to: 4, color: '#66ccff' },
      { from: 3, to: 5, color: '#cc66ff' },
      { from: 4, to: 5, color: '#cc66ff' },
      { from: 5, to: 6, color: '#00ff88' }
    ]
  },

  {
    id: 15,
    title: 'Logic Gates + Relay',
    description: 'Combine everything',
    par: 3,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.15, y: 0.35 },
      { type: 'button', id: 'B', x: 0.15, y: 0.5 },
      { type: 'button', id: 'C', x: 0.15, y: 0.65 },
      { type: 'logic-gate', gateType: 'XOR', id: 'X1', x: 0.35, y: 0.4 },
      { type: 'logic-gate', gateType: 'OR', id: 'O1', x: 0.35, y: 0.6 },
      { type: 'relay', id: 'R1', x: 0.55, y: 0.5 },
      { type: 'logic-gate', gateType: 'AND', id: 'A1', x: 0.75, y: 0.5 },
      { type: 'door', x: 0.9, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 3, color: '#cc66ff' },
      { from: 1, to: 3, color: '#cc66ff' },
      { from: 1, to: 4, color: '#66ccff' },
      { from: 2, to: 4, color: '#66ccff' },
      { from: 3, to: 5, color: '#ffaa00' },
      { from: 4, to: 6, color: '#66ccff' },
      { from: 5, to: 6, color: '#ff6666' },
      { from: 6, to: 7, color: '#00ff88' }
    ]
  },

  {
    id: 16,
    title: 'NOT Gate - Reverse',
    description: 'Leave buttons OFF',
    par: 0,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.4 },
      { type: 'button', id: 'B', x: 0.2, y: 0.6 },
      { type: 'logic-gate', gateType: 'NOT', id: 'N1', x: 0.5, y: 0.5 },
      { type: 'door', x: 0.8, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 2, color: '#ffcc66' },
      { from: 1, to: 2, color: '#ffcc66' },
      { from: 2, to: 3, color: '#ffcc66' }
    ]
  },

  {
    id: 17,
    title: 'NOT + AND Chain',
    description: 'Reverse then combine',
    par: 1,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.15, y: 0.35 },
      { type: 'button', id: 'B', x: 0.15, y: 0.5 },
      { type: 'button', id: 'C', x: 0.15, y: 0.65 },
      { type: 'logic-gate', gateType: 'NOT', id: 'N1', x: 0.4, y: 0.35 },
      { type: 'logic-gate', gateType: 'AND', id: 'A1', x: 0.65, y: 0.5 },
      { type: 'door', x: 0.9, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 3, color: '#ffcc66' },
      { from: 1, to: 4, color: '#ff6666' },
      { from: 2, to: 4, color: '#ff6666' },
      { from: 3, to: 4, color: '#ffcc66' },
      { from: 4, to: 5, color: '#ff6666' }
    ]
  },

  {
    id: 18,
    title: 'NAND Gate',
    description: 'NOT both buttons',
    par: 0,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.4 },
      { type: 'button', id: 'B', x: 0.2, y: 0.6 },
      { type: 'logic-gate', gateType: 'NAND', id: 'NA1', x: 0.5, y: 0.5 },
      { type: 'door', x: 0.8, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 2, color: '#ff9999' },
      { from: 1, to: 2, color: '#ff9999' },
      { from: 2, to: 3, color: '#ff9999' }
    ]
  },

  {
    id: 19,
    title: 'NOR Gate',
    description: 'NOT any button',
    par: 0,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.2, y: 0.35 },
      { type: 'button', id: 'B', x: 0.2, y: 0.5 },
      { type: 'button', id: 'C', x: 0.2, y: 0.65 },
      { type: 'logic-gate', gateType: 'NOR', id: 'NO1', x: 0.5, y: 0.5 },
      { type: 'door', x: 0.8, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 3, color: '#99ccff' },
      { from: 1, to: 3, color: '#99ccff' },
      { from: 2, to: 3, color: '#99ccff' },
      { from: 3, to: 4, color: '#99ccff' }
    ]
  },

  {
    id: 20,
    title: 'Master Challenge',
    description: 'All gates combined',
    par: 2,
    mechanisms: [
      { type: 'button', id: 'A', x: 0.1, y: 0.25 },
      { type: 'button', id: 'B', x: 0.1, y: 0.5 },
      { type: 'button', id: 'C', x: 0.1, y: 0.75 },
      { type: 'logic-gate', gateType: 'XOR', id: 'X1', x: 0.3, y: 0.375 },
      { type: 'logic-gate', gateType: 'NOT', id: 'N1', x: 0.3, y: 0.625 },
      { type: 'logic-gate', gateType: 'AND', id: 'A1', x: 0.5, y: 0.35 },
      { type: 'logic-gate', gateType: 'NAND', id: 'NA1', x: 0.5, y: 0.65 },
      { type: 'logic-gate', gateType: 'OR', id: 'O1', x: 0.7, y: 0.5 },
      { type: 'door', x: 0.9, y: 0.5, requiredSignals: 1 }
    ],
    connections: [
      { from: 0, to: 3, color: '#cc66ff' },
      { from: 1, to: 3, color: '#cc66ff' },
      { from: 2, to: 4, color: '#ffcc66' },
      { from: 3, to: 5, color: '#cc66ff' },
      { from: 4, to: 5, color: '#ffcc66' },
      { from: 1, to: 6, color: '#ff9999' },
      { from: 2, to: 6, color: '#ff9999' },
      { from: 5, to: 7, color: '#ff6666' },
      { from: 6, to: 7, color: '#ff9999' },
      { from: 7, to: 8, color: '#00ff88' }
    ]
  }
];

export default levels;
