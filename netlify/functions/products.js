const connectDB = require('./db');
const { Product } = require('./models');

exports.handler = async (event) => {
  try {
    await connectDB();
    const { indeks } = event.queryStringParameters || {};
    if (indeks) {
      const product = await Product.findOne({ indeks: new RegExp(`^${indeks}$`, 'i') });
      return { 
        statusCode: product ? 200 : 404, 
        body: JSON.stringify(product || { message: 'Produkt nie znaleziony' }) 
      };
    }
    const products = await Product.find({}).limit(100);
    return { statusCode: 200, body: JSON.stringify(products) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};