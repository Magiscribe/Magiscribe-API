import { pubsubClient } from '../utils/clients';

// A number that we'll increment over time to simulate subscription events
let currentNumber = 0;

// In the background, increment a number every second and notify subscribers when it changes.
function incrementNumber() {
  currentNumber++;
  pubsubClient.publish('NUMBER_INCREMENTED', { timeAlive: currentNumber });
  setTimeout(incrementNumber, 1000);
}

// Start incrementing
incrementNumber();

const subscription = {
  timeAlive: {
    subscribe: () => pubsubClient.asyncIterator(['NUMBER_INCREMENTED']),
  },
  predictionAdded: {
    subscribe: () => pubsubClient.asyncIterator(['PREDICTION_ADDED']),
  },
};

export default subscription;
