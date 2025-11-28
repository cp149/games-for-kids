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
        x: 0.4,
        y: 0.3
      },
      {
        type: 'relay',
        id: 'R2',
        x: 0.4,
        y: 0.7
      },
      {
        type: 'relay',
        id: 'R3',
        x: 0.65,
        y: 0.5
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
      { from: 3, to: 4, color: '#ff8800' },
      { from: 4, to: 5, color: '#00ff88' }
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
  }
];

export default levels;
