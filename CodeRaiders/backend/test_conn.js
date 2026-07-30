import mongoose from 'mongoose';
import fs from 'fs';

function log(msg) {
    fs.appendFileSync('conn_test.log', msg + '\n');
    console.log(msg);
}

log('Starting DB connection test...');
log('MONGO_URI is defined');

mongoose.connect('mongodb+srv://llsweetweaponll:ghd87GvnPyv6rFx9@cluster0.bvy4f0c.mongodb.net/coderaiders?appName=Cluster0', {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
})
  .then(() => {
    log('SUCCESS: Connected to MongoDB Atlas!');
    process.exit(0);
  })
  .catch((err) => {
    log('FAILURE: Could not connect to MongoDB Atlas: ' + err.message);
    process.exit(1);
  });
