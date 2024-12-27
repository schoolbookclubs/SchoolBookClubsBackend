import mongoose from 'mongoose';

const generalSupervisorTokenSchema = new mongoose.Schema({
  generalSupervisorId: { type: mongoose.Schema.Types.ObjectId, ref: 'GeneralSupervisor' },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now } // Token expires in 30 days
});

const GeneralSupervisorTokenModel = mongoose.model('GeneralSupervisorToken', generalSupervisorTokenSchema);

export default GeneralSupervisorTokenModel;
