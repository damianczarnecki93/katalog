import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  indeks: { type: String, required: true, unique: true },
  ean: { type: String },
  nazwa: { type: String },
  cena: { type: Number },
}, { timestamps: true });

const CatalogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  url: { type: String, required: true },
  logo: { type: String },
  isChristmas: { type: Boolean, default: false },
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Catalog = mongoose.models.Catalog || mongoose.model('Catalog', CatalogSchema);