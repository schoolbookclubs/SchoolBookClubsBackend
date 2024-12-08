import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
const TeacherSchema = new mongoose.Schema({
  name: { type: String},
  email: { type: String, unique: true },
  password: { type: String },
  phone: { type: String },
  role: { type: String, default: 'معلم'},
  schoolCode: { type: String},
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }

});

// Encrypt the password before saving
TeacherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.saltround));
  next();
});

const Teachermodel = mongoose.model('Teacher', TeacherSchema);

export default Teachermodel;
