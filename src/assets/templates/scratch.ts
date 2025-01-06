import { Edge, Node } from '@xyflow/react';

const templateDefault: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    {
      id: '0',
      type: 'start',
      position: { x: 0, y: 0 },
      data: {
        text: 'This is text that will be displayed on the start screen',
        requireName: true,
        requireEmail: true,
      },
    },
  ],
  edges: [],
};

export default templateDefault;
