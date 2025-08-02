// Define mongodb query that retrieve informaiton about token usage and update the quota collection.
// Schedule execution? server.ts runs it on an interval OR EventBridge way. 
// Top level function, when run, runs the stored procedue
// Add code to server.ts that for now has a TODO comment, run it every 1 hour, we shuld use a cron tab for that 10am. vs 10:34am.
// HORIZONTAL SCALING PROBLEM -> Double compute if two servers, good problem to have