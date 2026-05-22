import bcrypt from 'bcryptjs';
import connectDB from './db.js'; // Dodaj .js na końcu
import { User } from './models.js'; // Dodaj .js na końcu

export const handler = async (event) => {
  try {
    await connectDB();
    
    // Sprawdź czy baza działa
    const adminExists = await User.findOne({ role: 'admin' });
    
    if (adminExists) {
      return { 
        statusCode: 403, 
        body: JSON.stringify({ message: "Konto administratora już istnieje w bazie MongoDB." }) 
      };
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
      body: JSON.stringify({ message: "SUKCES! Stworzono konto: admin@e-dekor.pl z hasłem: admin123. Możesz się teraz zalogować." })
    };
  } catch (error) {
    console.error("Błąd init-admin:", error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};