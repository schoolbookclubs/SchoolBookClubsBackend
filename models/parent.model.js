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
    phone :{
        type: String,
        trim: true,
        required: true
    },
    role :{
        type: String,
        default: 'ولي أمر'
    },
    studentcodeinparent: {
        type: String,
        required: true,
    },
    schoolCode: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Hash password before saving
parentSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, parseInt(process.env.saltround));
    }
    next();
});

const Parentmodel = mongoose.model('Parent', parentSchema);
export default Parentmodel;
