const connectDB = require('./db');
const { Catalog } = require('./models');

exports.handler = async (event) => {
  try {
    await connectDB();
    const catalogs = await Catalog.find({});
    return { statusCode: 200, body: JSON.stringify(catalogs) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};