import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
const SupervisorSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String, unique: true },
  password: { type: String },
  phone: { type: String },
  role: { type: String, default: 'مشرف'},
  schoolCode: { type: String},
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
  verifiedCode: { type: String }
});

// Encrypt the password before saving
SupervisorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.saltround));
  next();
});

const Supervisormodel = mongoose.model('Supervisor', SupervisorSchema);

export default Supervisormodel;
