console.log('Starting seeder test...');

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/socialsight', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB successfully!');
  process.exit(0);
}).catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
