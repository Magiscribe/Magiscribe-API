import templateBranchInquiry from './branch-inquiry';
import templateLinearInquiry from './linear-inquiry';
import templateOpenEnded from './open-ended-inquiry';
import templateDefault from './scratch';

const templates = [
  {
    name: 'Linear Inquiry',
    description: 'Similar to a traditional survey where questions are asked in a fixed, linear order',
    allowGeneration: true,
    graph: templateLinearInquiry,
  },
  {
    name: 'Branching Inquiry',
    description: 'Questions that adapt based on user responses, leading to different questions or paths',
    allowGeneration: true,
    graph: templateBranchInquiry,
  },
  {
    name: 'Open Ended Inquiry',
    description: 'A flexible conversation format where users can freely navigate through various topics',
    allowGeneration: true,
    graph: templateOpenEnded,
  },
  {
    name: 'Start From Scratch',
    description: 'Create a custom inquiry from the ground up, with no predefined structure',
    allowGeneration: false,
    graph: templateDefault,
  },
];

export default templates;
