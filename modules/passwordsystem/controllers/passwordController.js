import { Password } from '../../../models/password.model.js';

class PasswordController {
    initializePassword = async (req, res) => {
        try {
            const existingPassword = await Password.findOne();
            if (!existingPassword) {
                const newPassword = new Password({ password: '123456' });
                await newPassword.save();
                return res.status(201).json({ message: 'تم إنشاء كلمة المرور الافتراضية بنجاح' });
            }
            return res.status(200).json({ message: 'كلمة المرور موجودة بالفعل' });
        } catch (error) {
            return res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
        }
    }

    login = async (req, res) => {
        try {
            const { password } = req.body;
            const passwordDoc = await Password.findOne();
            
            if (!passwordDoc) {
                return res.status(404).json({ message: 'لم يتم العثور على كلمة المرور في النظام' });
            }

            if (password !== passwordDoc.password) {
                return res.status(401).json({ message: 'كلمة المرور غير صحيحة' });
            }

            return res.status(200).json({ message: 'تم تسجيل الدخول بنجاح' });
        } catch (error) {
            return res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
        }
    }

    changePassword = async (req, res) => {
        try {
            const { oldPassword, newPassword, confirmNewPassword } = req.body;
            
            if (!oldPassword || !newPassword || !confirmNewPassword) {
                return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
            }

            if (newPassword !== confirmNewPassword) {
                return res.status(400).json({ message: 'كلمات المرور الجديدة غير متطابقة' });
            }

            const passwordDoc = await Password.findOne();
            
            if (!passwordDoc) {
                return res.status(404).json({ message: 'لم يتم العثور على كلمة المرور في النظام' });
            }

            if (oldPassword !== passwordDoc.password) {
                return res.status(401).json({ message: 'كلمة المرور القديمة غير صحيحة' });
            }

            passwordDoc.password = newPassword;
            await passwordDoc.save();

            return res.status(200).json({ message: 'تم تحديث كلمة المرور بنجاح' });
        } catch (error) {
            return res.status(500).json({ message: 'خطأ في الخادم', error: error.message });
        }
    }
}

export default new PasswordController();
