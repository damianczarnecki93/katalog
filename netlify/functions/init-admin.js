const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const { User } = require('./models');

exports.handler = async (event) => {
  try {
    await connectDB();
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return { statusCode: 403, body: "Konto administratora już istnieje." };
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      email: 'admin@e-dekor.pl',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin'
    });

    return { 
      statusCode: 200, 
      body: "Stworzono konto: admin@e-dekor.pl z hasłem: admin123. Zaloguj się i usuń ten plik z GitHuba!" 
    };
  } catch (error) {
    return { statusCode: 500, body: error.message };
  }
};