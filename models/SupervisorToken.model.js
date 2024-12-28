import mongoose from 'mongoose';

const SupervisorTokenSchema = new mongoose.Schema({
    SupervisorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'TeacherSupervisor',
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

const SupervisorTokenModel = mongoose.model('SupervisorToken', SupervisorTokenSchema);
export default SupervisorTokenModel;
