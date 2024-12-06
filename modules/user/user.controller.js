import UserModel from '../../models/User.model.js';
import TokenModel from '../../models/token.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import dotenv from 'dotenv';
dotenv.config();
// Validation schemas
const signupSchema = Joi.object({
    name: Joi.string().required().min(3).max(50),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(6),
    role: Joi.string().valid('طالب', 'معلم', 'ولي امر')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const forgetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string().required().min(6),
    confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
});

export const signup = async (req, res) => {
    try {
        // Validate request body
        const { error } = signupSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(Number(process.env.saltround));
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new UserModel({
            name,
            email,
            password: hashedPassword,
            role: role || 'طالب'
        });
        await user.save();

        // Generate token
        const token = jwt.sign(
            { userId: user._id, name: user.name, email: user.email, role: user.role },
            process.env.JWT_SECRET
        );

        // Store token
        const userToken = new TokenModel({
            userId: user._id,
            token,
            userAgent: req.headers['user-agent'] || ''
        });
        await userToken.save();

        res.status(201).json({
            message: 'تم انشاء الحساب بنجاح',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

export const studentLogin = async (req, res) => {
    try {
        // Validate request body
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'بريد الكتروني غير صالح' });
        }

        // Check if user is a student
        if (user.role !== 'طالب') {
            return res.status(403).json({ message: 'غير مصرح للدخول. هذا المسار مخصص للطلاب فقط' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
        }

       // Get existing valid token
       const existingToken = await TokenModel.findOne({ 
        userId: user._id,
        isValid: true
    });

    if (!existingToken) {
        return res.status(400).json({ message: 'No valid token found. Please signup again.' });
    }

    res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        token: existingToken.token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const teacherLogin = async (req, res) => {
    try {
        // Validate request body
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'بريد الكتروني غير صالح' });
        }

        // Check if user is a teacher
        if (user.role !== 'معلم') {
            return res.status(403).json({ message: 'غير مصرح للدخول. هذا المسار مخصص للمعلمين فقط' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
        }

       // Get existing valid token
       const existingToken = await TokenModel.findOne({ 
        userId: user._id,
        isValid: true
    });

    if (!existingToken) {
        return res.status(400).json({ message: 'No valid token found. Please signup again.' });
    }

    res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        token: existingToken.token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const parentLogin = async (req, res) => {
    try {
        // Validate request body
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'بريد الكتروني غير صالح' });
        }

        // Check if user is a parent
        if (user.role !== 'ولي امر') {
            return res.status(403).json({ message: 'غير مصرح للدخول. هذا المسار مخصص لأولياء الأمور فقط' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
        }

       // Get existing valid token
       const existingToken = await TokenModel.findOne({ 
        userId: user._id,
        isValid: true
    });

    if (!existingToken) {
        return res.status(400).json({ message: 'No valid token found. Please signup again.' });
    }

    res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        token: existingToken.token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        // Validate request body
        const { error } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, password } = req.body;

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'بريد الكتروني غير صالح' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'كلمة المرور غير صالحة' });
        }

        // Get existing valid token
        const existingToken = await TokenModel.findOne({ 
            userId: user._id,
            isValid: true
        });

        if (!existingToken) {
            return res.status(400).json({ message: 'No valid token found. Please signup again.' });
        }

        res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح',
            token: existingToken.token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });
    }
};

export const forgetPassword = async (req, res) => {
    try {
        // Validate request body
        const { error } = forgetPasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { email, newPassword } = req.body;

        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'بريد الكتروني غير صالح' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(Number(process.env.saltround));
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        // Invalidate all existing tokens for this user
        await TokenModel.updateMany(
            { userId: user._id },
            { isValid: false }
        );

        res.status(200).json({ message: 'تم تحديث كلمة المرور بنجاح. يرجى تسجيل الدخول باستخدام كلمة المرور الجديدة' });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في تحديث كلمة المرور', error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(400).json({ message: 'Token is required' });
        }

        // Invalidate the token
        await TokenModel.findOneAndUpdate(
            { token },
            { isValid: false }
        );

        res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging out', error: error.message });
    }
};