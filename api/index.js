const app = require('../server/app');
const connectDB = require('../server/config/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB Atlas connection error in serverless handler:', error.message);
  }
  return app(req, res);
};
