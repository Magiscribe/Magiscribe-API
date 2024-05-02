import { PubSub } from 'graphql-subscriptions';

const pubsub = new PubSub();

// A number that we'll increment over time to simulate subscription events
let currentNumber = 0;

// In the background, increment a number every second and notify subscribers when it changes.
function incrementNumber() {
  currentNumber++;
  pubsub.publish('NUMBER_INCREMENTED', { timeAlive: currentNumber });
  setTimeout(incrementNumber, 1000);
}

// Start incrementing
incrementNumber();

const subscription = {
  timeAlive: {
    subscribe: () => pubsub.asyncIterator(['NUMBER_INCREMENTED']),
  },
};

export default subscription;
