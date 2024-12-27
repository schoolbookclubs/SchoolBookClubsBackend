import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

class GeneralSupervisorSchema extends mongoose.Schema {
    constructor() {
        super({
            name: {
                type: String,
                required: [true, 'Name is required'],
                trim: true
            },
            email: {
                type: String,
                required: [true, 'Email is required'],
                unique: true,
                trim: true,
                lowercase: true
            },
            phone: {
                type: String,
                required: [true, 'Phone number is required'],
                trim: true
            },
            password: {
                type: String,
                required: [true, 'Password is required'],
                trim: true
            },
            verificationCode: {
                type: String
            }
        }, { timestamps: true });

        this.pre('save', this.hashPassword);
        this.methods.comparePassword = this.comparePassword;
    }

    async hashPassword(next) {
        if (!this.isModified('password')) return next();
        
        try {
            const salt = await bcrypt.genSalt(parseInt(process.env.saltround));
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (error) {
            next(error);
        }
    }

    async comparePassword(candidatePassword) {
        return await bcrypt.compare(candidatePassword, this.password);
    }
}

const schema = new GeneralSupervisorSchema();
const GeneralSupervisorModel = mongoose.model('GeneralSupervisor', schema);

export default GeneralSupervisorModel;
