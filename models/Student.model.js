import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  schoolCode: { type: String, required: true },
  studentCode: { type: String, required: true, unique: true },
  role: { type: String, default: 'طالب' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
}, {
  timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.saltround));
  next();
});

const StudentModel = mongoose.model('Student', studentSchema);

export default StudentModel;
