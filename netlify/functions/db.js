import mongoose from 'mongoose';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error("Brak zmiennej środowiskowej MONGODB_URI");
  }
  return mongoose.connect(process.env.MONGODB_URI);
};

export default connectDB;