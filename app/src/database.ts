import mongoose from 'mongoose';
import config from '@config';
import log from '@log';

let database: mongoose.Connection;

const connect = () => {
  // add your own uri below
  const uri = config.database.url;

  if (database) {
    return;
  }

  mongoose.connect(uri, {
    authSource: 'admin', //
    user: config.database.username,
    pass: config.database.password,
  });

  database = mongoose.connection;
};

const disconnect = () => {
  if (!database) {
    return;
  }
  mongoose.disconnect();
};

const init = async () => {
  connect();

  return new Promise((resolve, reject) => {
    database.on('open', () => {
      log.info(`Connected to MongoDB at ${config.database.url}`);
      resolve(undefined);
    });

    database.on('error', (error) => {
      log.error(
        `Error connecting to MongoDB at ${config.database.url}: ${error.message}`,
      );
      reject(error);
    });
  });
};

const connection = () => {
  if (!database) {
    connect();
  }
  return database;
};

export default {
  connect,
  disconnect,
  init,
  connection,
};
