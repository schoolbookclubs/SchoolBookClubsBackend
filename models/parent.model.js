import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();
const parentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role :{
        type: String,
        default: 'ولي أمر'
    },
    studentCode: {
        type: String,
        required: true,
        ref: 'Student'
    }
}, {
    timestamps: true
});

// Hash password before saving
parentSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, process.env.saltround);
    }
    next();
});

const Parent = mongoose.model('Parent', parentSchema);
export default Parent;
