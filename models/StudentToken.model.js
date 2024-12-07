import mongoose from 'mongoose';

const studentTokenSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now } // Token expires in 30 days
});

const StudentTokenModel = mongoose.model('StudentToken', studentTokenSchema);

export default StudentTokenModel;
