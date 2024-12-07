import mongoose from 'mongoose';
import config from '@config';
import log from '@log';

let connection: mongoose.Connection;

const init = async () => {
  // add your own uri below
  const uri = config.mongodb.url;

  if (connection) {
    return;
  }

  log.debug(
    `Establishing neural link to hive mind (Connecting to MongoDB at ${uri})`,
  );
  mongoose.connect(uri, {
    authSource: 'admin', // The admin table is the default table for authentication.
    user: config.mongodb.username,
    pass: config.mongodb.password,
  });

  connection = mongoose.connection;

  return new Promise((resolve, reject) => {
    connection.on('open', () => {
      log.info(`Connected to MongoDB at ${config.mongodb.url}`);
      resolve(undefined);
    });

    connection.on('error', (error) => {
      log.error(
        `Error connecting to MongoDB at ${config.mongodb.url}: ${error.message}`,
      );
      reject(error);
    });
  });
};

// Creates a database object that automatically connects to the database using closure
export const database = (() => {
  return {
    init,

    get connection() {
      if (!connection) {
        init();
      }
      return connection;
    },
  };
})();

export default database;
