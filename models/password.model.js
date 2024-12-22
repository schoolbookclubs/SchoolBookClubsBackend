import mongoose from 'mongoose';

const passwordSchema = new mongoose.Schema({
    password: {
        type: String,
        default: '123456'
    }
});

export const Password = mongoose.model('Password', passwordSchema);
