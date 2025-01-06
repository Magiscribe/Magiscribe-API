import { Edge, Node } from '@xyflow/react';

const templateBranchInquiry: { nodes: Node[]; edges: Edge[] } = {
  nodes: [
    {
      id: '0',
      type: 'start',
      position: {
        x: 0,
        y: 348.5,
      },
      data: {
        data: {
          text: 'This is text that will be displayed on the start screen',
          requireName: true,
          requireEmail: true,
        },
      },
      measured: {
        width: 384,
        height: 47,
      },
    },
    {
      id: 'v2mq',
      type: 'information',
      position: {
        x: 534,
        y: 266.5,
      },
      data: {
        text: 'Welcome to our inquiry. We value your feedback to help us improve our services.',
        dynamicGeneration: false,
      },
      measured: {
        width: 384,
        height: 211,
      },
    },
    {
      id: 'f7nh',
      type: 'question',
      position: {
        x: 1068,
        y: 57.5,
      },
      data: {
        type: 'rating-single',
        text: 'How would you rate your overall experience with our service?',
        ratings: ['Very Poor', 'Poor', 'Average', 'Good', 'Excellent'],
      },
      measured: {
        width: 384,
        height: 629,
      },
    },
    {
      id: 'c3pt',
      type: 'condition',
      position: {
        x: 1602,
        y: 300.5,
      },
      data: {
        text: "If the user's rating is 'Good' or 'Excellent', route to node y8wj. Otherwise, route to node l5rb.",
      },
      measured: {
        width: 384,
        height: 143,
      },
    },
    {
      id: 'y8wj',
      type: 'question',
      position: {
        x: 2136,
        y: 0,
      },
      data: {
        type: 'open-ended',
        text: 'What aspects of our service did you find most satisfying?',
        dynamicGeneration: false,
      },
      measured: {
        width: 384,
        height: 297,
      },
    },
    {
      id: 'l5rb',
      type: 'question',
      position: {
        x: 2136,
        y: 447,
      },
      data: {
        type: 'open-ended',
        text: 'What areas do you think we need to improve?',
        dynamicGeneration: false,
      },
      measured: {
        width: 384,
        height: 297,
      },
    },
    {
      id: 'h6td',
      type: 'question',
      position: {
        x: 2670,
        y: 57.5,
      },
      data: {
        type: 'rating-multi',
        text: 'Which of the following areas should we focus on improving?',
        ratings: [
          'Customer Service',
          'Product Quality',
          'Website Usability',
          'Delivery Speed',
          'Price Competitiveness',
        ],
      },
      measured: {
        width: 384,
        height: 629,
      },
    },
    {
      id: 'b9gx',
      type: 'condition',
      position: {
        x: 3204,
        y: 300.5,
      },
      data: {
        text: "If 'Customer Service' is selected in node h6td, route to node s4kf. Otherwise, route to node m1vz.",
      },
      measured: {
        width: 384,
        height: 143,
      },
    },
    {
      id: 's4kf',
      type: 'question',
      position: {
        x: 3738,
        y: 340.25,
      },
      data: {
        type: 'open-ended',
        text: 'Can you provide specific examples of how we can improve our customer service?',
        dynamicGeneration: false,
      },
      measured: {
        width: 384,
        height: 297,
      },
    },
    {
      id: 'm1vz',
      type: 'question',
      position: {
        x: 4272,
        y: 223.5,
      },
      data: {
        type: 'open-ended',
        text: 'Do you have any additional comments or suggestions for improvement?',
        dynamicGeneration: false,
      },
      measured: {
        width: 384,
        height: 297,
      },
    },
    {
      id: 'w3jq',
      type: 'information',
      position: {
        x: 4806,
        y: 254.5,
      },
      data: {
        text: 'Thank you for taking the time to complete our inquiry. Your feedback is invaluable in helping us improve our services.',
        dynamicGeneration: false,
      },
      measured: {
        width: 384,
        height: 235,
      },
    },
    {
      id: 'r7dx',
      type: 'end',
      position: {
        x: 5340,
        y: 348.5,
      },
      data: {
        text: '',
      },
      measured: {
        width: 384,
        height: 47,
      },
    },
  ],
  edges: [
    {
      id: '788d83dd-ddea-41fe-b42c-7ccdeeb0e79d',
      source: '0',
      target: 'v2mq',
    },
    {
      id: '56dac8a9-9eff-4d6d-923a-14a19f6f9193',
      source: 'v2mq',
      target: 'f7nh',
    },
    {
      id: 'd28e0b52-e463-4481-9aca-3ab4c16ac1b1',
      source: 'f7nh',
      target: 'c3pt',
    },
    {
      id: '81ee1159-bb52-49e2-8a4b-46d06d09cc2b',
      source: 'c3pt',
      target: 'y8wj',
    },
    {
      id: '1c5be03b-29c5-4485-b102-0d36c5ba22da',
      source: 'c3pt',
      target: 'l5rb',
    },
    {
      id: 'dc9ccdbe-c13a-44d7-aa95-cf22cc9a4a01',
      source: 'y8wj',
      target: 'h6td',
    },
    {
      id: '39a32a7c-3eb4-46f6-9496-a1c9189736e5',
      source: 'l5rb',
      target: 'h6td',
    },
    {
      id: 'a91bab91-53ec-45c4-ac58-d3d117c9d0db',
      source: 'h6td',
      target: 'b9gx',
    },
    {
      id: 'd98f3cd3-d080-42dd-a9a3-77af5024e301',
      source: 'b9gx',
      target: 's4kf',
    },
    {
      id: '4532cf87-74fe-4561-b1c9-2beeb282e6eb',
      source: 'b9gx',
      target: 'm1vz',
    },
    {
      id: '33fc5ae6-7ee9-4ae6-9ad5-b67f28faa8b4',
      source: 's4kf',
      target: 'm1vz',
    },
    {
      id: '50ba5a7f-e5f9-4f18-9d36-58fe9873c474',
      source: 'm1vz',
      target: 'w3jq',
    },
    {
      id: '5d7952f0-fb6c-4ffa-ba64-19d463b9b7f1',
      source: 'w3jq',
      target: 'r7dx',
    },
  ],
};

export default templateBranchInquiry;
