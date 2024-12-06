import mongoose from 'mongoose';

const schoolSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
});

const Schoolmodel = mongoose.model('School', schoolSchema);

export default Schoolmodel;
