export const templateBranchInquiry = {
  data: {
    settings: {
      title: 'My First Inquiry - Coffee Flavors',
      goals: '',
      voice: 'aria',
      context: null,
      notifications: {
        recieveEmailOnResponse: null,
      },
    },
    graph: {
      nodes: [
        {
          id: '0',
          type: 'start',
          data: {
            text: "Welcome to Magiscribe Coffee's flavor suggestion survey! Help us create exciting new coffee flavors.",
            requireName: true,
            requireEmail: true,
          },
          position: {
            x: 0,
            y: 252.5,
          },
          measured: {
            width: 384,
            height: 351,
          },
        },
        {
          id: 'v2mq',
          type: 'information',
          data: {
            text: "We're looking to expand our coffee flavor offerings and value your input in creating new and exciting options.",
            dynamicGeneration: false,
          },
          position: {
            x: 534,
            y: 270.5,
          },
          measured: {
            width: 384,
            height: 315,
          },
        },
        {
          id: 'f7nh',
          type: 'question',
          data: {
            type: 'single-select',
            text: 'How satisfied are you with our current coffee flavor selection?',
            ratings: [
              'Very Unsatisfied',
              'Unsatisfied',
              'Neutral',
              'Satisfied',
              'Very Satisfied',
            ],
          },
          position: {
            x: 1068,
            y: 57.5,
          },
          measured: {
            width: 384,
            height: 741,
          },
          selected: false,
          dragging: false,
        },
        {
          id: 'b9gx',
          type: 'condition',
          data: {
            conditions: [
              {
                to: 's4kf',
                condition: "If 'Seasonal Flavors' is selected",
              },
              {
                to: 'm1vz',
                condition: 'If any other flavor category is selected',
              },
            ],
          },
          position: {
            x: 2136,
            y: 75,
          },
          measured: {
            width: 384,
            height: 706,
          },
        },
        {
          id: 'h6td',
          type: 'question',
          data: {
            type: 'multi-select',
            text: 'Which flavor categories interest you most for new coffee options?',
            ratings: [
              'Seasonal Flavors',
              'Nutty Blends',
              'Fruit-Infused',
              'Dessert-Inspired',
              'Spice Blends',
            ],
          },
          position: {
            x: 1602,
            y: 57.5,
          },
          measured: {
            width: 384,
            height: 741,
          },
          selected: false,
          dragging: false,
        },
        {
          id: 's4kf',
          type: 'question',
          data: {
            type: 'open-ended',
            text: 'What specific seasonal flavors would you like to see in our coffee selection?',
            dynamicGeneration: false,
          },
          position: {
            x: 2670,
            y: 0,
          },
          measured: {
            width: 384,
            height: 353,
          },
        },
        {
          id: 'm1vz',
          type: 'question',
          data: {
            type: 'open-ended',
            text: 'What specific flavors within your selected categories would you like to see in our coffee selection?',
            dynamicGeneration: false,
          },
          position: {
            x: 2670,
            y: 503,
          },
          measured: {
            width: 384,
            height: 353,
          },
        },
        {
          id: 'w3jq',
          type: 'information',
          data: {
            text: 'Thank you for helping us develop new coffee flavors! Your suggestions will help shape our future offerings.',
            dynamicGeneration: false,
          },
          position: {
            x: 3204,
            y: 270.5,
          },
          measured: {
            width: 384,
            height: 315,
          },
          selected: true,
          dragging: false,
        },
        {
          id: 'r7dx',
          type: 'end',
          position: {
            x: 3738,
            y: 400.5,
          },
          data: {
            text: '',
          },
          measured: {
            width: 384,
            height: 55,
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
          id: 'a91bab91-53ec-45c4-ac58-d3d117c9d0db',
          source: 'h6td',
          target: 'b9gx',
        },
        {
          id: 'd98f3cd3-d080-42dd-a9a3-77af5024e301',
          source: 'b9gx',
          target: 's4kf',
          data: {
            color: '#f87171',
          },
        },
        {
          id: '4532cf87-74fe-4561-b1c9-2beeb282e6eb',
          source: 'b9gx',
          target: 'm1vz',
          data: {
            color: '#fb923c',
          },
        },
        {
          id: '5d7952f0-fb6c-4ffa-ba64-19d463b9b7f1',
          source: 'w3jq',
          target: 'r7dx',
        },
        {
          source: 's4kf',
          target: 'w3jq',
          id: 'e6fadc1d-277f-4ee9-bedc-03ca5c999f9a',
        },
        {
          source: 'm1vz',
          target: 'w3jq',
          id: 'd0235ede-e723-4027-abcf-71897d58b022',
        },
        {
          source: 'f7nh',
          target: 'h6td',
          id: 'aa88a617-e874-40b8-bc16-d113db43270d',
        },
      ],
    },
    draftGraph: {
      nodes: [
        {
          id: '0',
          type: 'start',
          data: {
            text: "Welcome to Magiscribe Coffee's flavor suggestion survey! Help us create exciting new coffee flavors.",
            requireName: true,
            requireEmail: true,
          },
          position: {
            x: 0,
            y: 252.5,
          },
          measured: {
            width: 384,
            height: 351,
          },
        },
        {
          id: 'v2mq',
          type: 'information',
          data: {
            text: "We're looking to expand our coffee flavor offerings and value your input in creating new and exciting options.",
            dynamicGeneration: false,
          },
          position: {
            x: 534,
            y: 270.5,
          },
          measured: {
            width: 384,
            height: 315,
          },
        },
        {
          id: 'f7nh',
          type: 'question',
          data: {
            type: 'single-select',
            text: 'How satisfied are you with our current coffee flavor selection?',
            ratings: [
              'Very Unsatisfied',
              'Unsatisfied',
              'Neutral',
              'Satisfied',
              'Very Satisfied',
            ],
          },
          position: {
            x: 1068,
            y: 57.5,
          },
          measured: {
            width: 384,
            height: 741,
          },
          selected: false,
          dragging: false,
        },
        {
          id: 'b9gx',
          type: 'condition',
          data: {
            conditions: [
              {
                to: 's4kf',
                condition: "If 'Seasonal Flavors' is selected",
              },
              {
                to: 'm1vz',
                condition: 'If any other flavor category is selected',
              },
            ],
          },
          position: {
            x: 2136,
            y: 75,
          },
          measured: {
            width: 384,
            height: 706,
          },
        },
        {
          id: 'h6td',
          type: 'question',
          data: {
            type: 'multi-select',
            text: 'Which flavor categories interest you most for new coffee options?',
            ratings: [
              'Seasonal Flavors',
              'Nutty Blends',
              'Fruit-Infused',
              'Dessert-Inspired',
              'Spice Blends',
            ],
          },
          position: {
            x: 1602,
            y: 57.5,
          },
          measured: {
            width: 384,
            height: 741,
          },
          selected: false,
          dragging: false,
        },
        {
          id: 's4kf',
          type: 'question',
          data: {
            type: 'open-ended',
            text: 'What specific seasonal flavors would you like to see in our coffee selection?',
            dynamicGeneration: false,
          },
          position: {
            x: 2670,
            y: 0,
          },
          measured: {
            width: 384,
            height: 353,
          },
        },
        {
          id: 'm1vz',
          type: 'question',
          data: {
            type: 'open-ended',
            text: 'What specific flavors within your selected categories would you like to see in our coffee selection?',
            dynamicGeneration: false,
          },
          position: {
            x: 2670,
            y: 503,
          },
          measured: {
            width: 384,
            height: 353,
          },
        },
        {
          id: 'w3jq',
          type: 'information',
          data: {
            text: 'Thank you for helping us develop new coffee flavors! Your suggestions will help shape our future offerings.',
            dynamicGeneration: false,
          },
          position: {
            x: 3204,
            y: 270.5,
          },
          measured: {
            width: 384,
            height: 315,
          },
          selected: true,
          dragging: false,
        },
        {
          id: 'r7dx',
          type: 'end',
          position: {
            x: 3738,
            y: 400.5,
          },
          data: {
            text: '',
          },
          measured: {
            width: 384,
            height: 55,
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
          id: 'a91bab91-53ec-45c4-ac58-d3d117c9d0db',
          source: 'h6td',
          target: 'b9gx',
        },
        {
          id: 'd98f3cd3-d080-42dd-a9a3-77af5024e301',
          source: 'b9gx',
          target: 's4kf',
          data: {
            color: '#f87171',
          },
        },
        {
          id: '4532cf87-74fe-4561-b1c9-2beeb282e6eb',
          source: 'b9gx',
          target: 'm1vz',
          data: {
            color: '#fb923c',
          },
        },
        {
          id: '5d7952f0-fb6c-4ffa-ba64-19d463b9b7f1',
          source: 'w3jq',
          target: 'r7dx',
        },
        {
          source: 's4kf',
          target: 'w3jq',
          id: 'e6fadc1d-277f-4ee9-bedc-03ca5c999f9a',
        },
        {
          source: 'm1vz',
          target: 'w3jq',
          id: 'd0235ede-e723-4027-abcf-71897d58b022',
        },
        {
          source: 'f7nh',
          target: 'h6td',
          id: 'aa88a617-e874-40b8-bc16-d113db43270d',
        },
      ],
    },
  },
};

export default templateBranchInquiry;
