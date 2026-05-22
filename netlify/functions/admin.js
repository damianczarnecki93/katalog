import connectDB from './db.js';
import { Product, User, Catalog } from './models.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const auth = (event) => {
  const authHeader = event.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret');
  } catch (err) { return null; }
};

export const handler = async (event) => {
  const user = auth(event);
  if (!user || user.role !== 'admin') return { statusCode: 401, body: 'Unauthorized' };

  try {
    await connectDB();
    const { action, type, data } = JSON.parse(event.body);

    if (action === 'import') {
      if (type === 'products') {
        for (const item of data) {
          await Product.updateOne({ indeks: item.indeks }, { $set: item }, { upsert: true });
        }
        return { statusCode: 200, body: JSON.stringify({ message: 'Produkty zaimportowane' }) };
      }
      if (type === 'users') {
        for (const u of data) {
          const hashedPassword = await bcrypt.hash(u.password, 10);
          await User.updateOne({ email: u.email }, { $set: { ...u, password: hashedPassword } }, { upsert: true });
        }
        return { statusCode: 200, body: JSON.stringify({ message: 'Użytkownicy zaimportowani' }) };
      }
    }
    if (action === 'save_catalog') {
      await Catalog.create(data);
      return { statusCode: 200, body: 'Katalog zapisany' };
    }
    return { statusCode: 400, body: 'Invalid action' };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ message: error.message }) };
  }
};