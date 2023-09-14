require("dotenv").config();

const PORT = process.env.PORT;
const MONGODB_URI =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

const API_KEY = process.env.API_KEY;

module.exports = {
  MONGODB_URI,
  PORT,
  API_KEY,
};
