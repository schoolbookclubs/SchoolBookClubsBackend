import mongoose from 'mongoose';

const TeacherTokenSchema = new mongoose.Schema({
  teacherId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Teacher',
    required: true 
  },
  token: { 
    type: String, 
    required: true 
  },
  schoolCode: { 
    type: String
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
  }
});

const TeacherTokenModel = mongoose.model('TeacherToken', TeacherTokenSchema);
export default TeacherTokenModel;
