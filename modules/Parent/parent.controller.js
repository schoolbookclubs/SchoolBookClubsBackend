import ParentToken from '../../models/parentToken.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import StudentModel from '../../models/Student.model.js';
import Parentmodel from '../../models/parent.model.js';
import Joi from 'joi';

dotenv.config();

const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    studentcodeinparent: Joi.string().required(),
    role: Joi.string().default('ولي أمر')
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const forgetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    newPassword: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

export const signup = async (req, res) => {
    try {
        // Validate request body
        const { error } = signupSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, email, password, studentcodeinparent, role } = req.body;

        // Check if student exists
        const student = await StudentModel.findOne({ studentCode: studentcodeinparent });
        if (!student) {
            return res.status(404).json({ message: 'كود الطالب الذي ادخلته غير صالح' });
        }

        // Check if parent already exists
        const existingParent = await Parentmodel.findOne({ email });
        if (existingParent) {
            return res.status(400).json({ message: 'البريد الالكتروني مسجل بالفعل' });
        }

        // Create new parent - password will be hashed by the pre-save hook
        const parent = new Parentmodel({
            name,
            email,
            password,
            studentcodeinparent,
            role
        });
        await parent.save();

        // Generate token
        const token = jwt.sign({ 
            _id: parent._id.toString(), 
            email: parent.email, 
            studentCode: parent.studentcodeinparent, 
            name: parent.name, 
            role: parent.role
        }, process.env.JWT_SECRET);

        // Save token
        const parentToken = new ParentToken({
            parentId: parent._id,
            token
        });
        await parentToken.save();

        res.status(201).json({message: `تم انشاء حساب كولي امر للطالب ${student.name} بنجاح`, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        // Validate request body
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password } = req.body;

        // Find parent
        const parent = await Parentmodel.findOne({ email });
        if (!parent) {
            return res.status(401).json({ message: 'البريد الالكتروني غير صالح' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, parent.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'كلمة المرور غير صالحة' });
        }

        // Get stored token
        const parentToken = await ParentToken.findOne({ parentId: parent._id });
        if (!parentToken) {
            return res.status(404).json({ message: 'Token not found' });
        }

        res.json({ message: 'تم تسجيل الدخول بنجاح', token: parentToken.token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const forgetPassword = async (req, res) => {
    try {
        // Validate request body
        const { error } = forgetPasswordSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, newPassword, confirmPassword } = req.body;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين' });
        }

        // Find parent by email
        const parent = await Parentmodel.findOne({ email });
        if (!parent) {
            return res.status(404).json({ message: 'البريد الالكتروني غير مسجل' });
        }

        // Update password - will be hashed by pre-save hook
        parent.password = newPassword;
        await parent.save();

        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateParent = async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'password'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'حدث خطاء في التحديث' });
        }

        const parent = await Parentmodel.findById(req.params.id);
        if (!parent) {
            return res.status(404).json({ message: 'ولي امر هذا الطالب غير موجود' });
        }

        updates.forEach(update => parent[update] = req.body[update]);
        await parent.save();

        res.json(parent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteParent = async (req, res) => {
    try {
        const parent = await Parentmodel.findByIdAndDelete(req.params.id);
        if (!parent) {
            return res.status(404).json({ message: 'ولي امر هذا الطالب غير موجود' });
        }

        // Delete associated token
        await ParentToken.findOneAndDelete({ parentId: parent._id });

        res.json({ message: 'تم حذف ولي الامر بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
