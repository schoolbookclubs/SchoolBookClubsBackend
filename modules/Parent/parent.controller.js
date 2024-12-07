import Parent from '../../models/parent.model.js';
import ParentToken from '../../models/parentToken.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import StudentModel from '../../models/student.model.js';
import dotenv from 'dotenv';
dotenv.config();

class ParentController {
    // Signup new parent
    static async signup(req, res) {
        try {
            const { name, email, password, studentCode,role } = req.body;

            // Check if student exists
            const student = await StudentModel.findOne({ code: studentCode });
            if (!student) {
                return res.status(404).json({ message: 'كود الطالب الذي ادخلته غير صالح' });
            }

            // Check if parent already exists
            const existingParent = await Parent.findOne({ email });
            if (existingParent) {
                return res.status(400).json({ message: 'البريد الالكتروني مسجل بالفعل' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, parseInt(process.env.saltround));

            // Create new parent
            const parent = new Parent({
                name,
                email,
                password: hashedPassword,
                studentCode,
                role
            });
            await parent.save();

            // Generate token
            const token = jwt.sign({ _id: parent._id.toString(), email: parent.email, studentCode: parent.studentCode , name: parent.name , role: parent.role}, process.env.JWT_SECRET);

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
    }

    // Login parent
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Find parent
            const parent = await Parent.findOne({ email });
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
    }

    // Update parent
    static async update(req, res) {
        try {
            const updates = Object.keys(req.body);
            const allowedUpdates = ['name', 'email', 'password'];
            const isValidOperation = updates.every(update => allowedUpdates.includes(update));

            if (!isValidOperation) {
                return res.status(400).json({ message: 'حدث خطاء في التحديث' });
            }

            const parent = await Parent.findById(req.params.id);
            if (!parent) {
                return res.status(404).json({ message: 'ولي امر هذا الطالب غير موجود' });
            }

            updates.forEach(update => parent[update] = req.body[update]);
            await parent.save();

            res.json(parent);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Delete parent
    static async delete(req, res) {
        try {
            const parent = await Parent.findByIdAndDelete(req.params.id);
            if (!parent) {
                return res.status(404).json({ message: 'ولي امر هذا الطالب غير موجود' });
            }

            // Delete associated token
            await ParentToken.findOneAndDelete({ parentId: parent._id });

            res.json({ message: 'تم حذف ولي الامر بنجاح' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Forget Password
    static async forgetPassword(req, res) {
        try {
            const { email, newPassword, confirmPassword } = req.body;

            // Check if passwords match
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين' });
            }

            // Find parent by email
            const parent = await Parent.findOne({ email });
            if (!parent) {
                return res.status(404).json({ message: 'البريد الالكتروني غير مسجل' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.saltround));
            
            // Update password
            parent.password = hashedPassword;
            await parent.save();

          

            res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default ParentController;
