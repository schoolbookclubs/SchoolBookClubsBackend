import mongoose from 'mongoose';

const studentTokenSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  schoolCode: { type: String }
});

const StudentTokenModel = mongoose.model('StudentToken', studentTokenSchema);

export default StudentTokenModel;
