import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Teachermodel from '../../models/Teacher.model.js';
import TeacherTokenModel from '../../models/TeacherToken.model.js';
import Schoolmodel from '../../models/School.model.js';
dotenv.config();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Validation schemas
const signupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    schoolCode: Joi.string().required(),
    role: Joi.string().default('معلم')
});

const completeProfileSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().required()
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

export const signupTeacher = async (req, res) => {
    try {
        // Validate request body
        const { error } = signupSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, email, schoolCode, role } = req.body;

        // Check if teacher already exists
        const existingTeacher = await Teachermodel.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: 'هذا المعلم مسجل بالفعل علي نظامنا' });
        }
             // Get school details
        const school = await Schoolmodel.findOne({ code: schoolCode });
        if (!school) {
            return res.status(400).json({ message: 'كود المدرسة غير صحيح' });
        }
        // Create new teacher
        const teacher = new Teachermodel({
            name,
            email,
            schoolCode,
            role,
            schoolId: school._id
        });
        
        // Save teacher first and get the saved document
        const savedTeacher = await teacher.save();
        if (!savedTeacher) {
            return res.status(500).json({ message: 'Error saving teacher' });
        }

        // Generate token
        const token = jwt.sign(
            { id: savedTeacher._id, email, schoolCode, role },
            process.env.JWT_SECRET
        );

        try {
            // Save token to database
            const teacherToken = new TeacherTokenModel({
                teacherId: savedTeacher._id,
                token
            });
            await teacherToken.save();
        } catch (error) {
            // If token creation fails, delete the teacher to maintain consistency
            await Teachermodel.findByIdAndDelete(savedTeacher._id);
            return res.status(500).json({ message: 'Error creating teacher token' });
        }

        // Create complete profile link
        const completeProfileLink = `${process.env.FRONTEND_URL}/complete-profile-teacher?token=${token}`;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'تهانينا! تم إضافتك كمعلم - برنامج اندية القراءة المدرسية',
            html: `
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
                    <style>
                        body {
                            font-family: 'Tajawal', Arial, sans-serif;
                            line-height: 2;
                            color: #333;
                            margin: 0;
                            padding: 0;
                            background: #f4f4f9;
                            font-size: 18px;
                            font-weight: 500;
                        }
                        .container {
                            max-width: 700px;
                            margin: 20px auto;
                            background: #ffffff;
                            padding: 40px;
                            border-radius: 15px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                        }
                          .header {
                            text-align: center;
                            padding: 30px 0;
                            background: linear-gradient(135deg, #1a237e, #3949ab);
                            
                            border-radius: 15px 15px 0 0;
                            position: relative;
                        }
                   
                        .header h1 {
                            font-size: 32px;
                            margin: 0;
                            color: #fff;
                            font-weight: 700;
                        }
                        .content {
                            padding: 20px 30px;
                            text-align: center;
                        }
                        .content h2 {
                            font-size: 24px;
                            color: #333;
                            margin: 20px 0;
                            font-weight: 700;
                        }
                        .content p {
                            font-size: 20px;
                            font-weight: 500;
                        }
                        .school-info {
                            background: #f9f9f9;
                            padding: 25px;
                            border-radius: 12px;
                            text-align: right;
                            margin: 25px 0;
                            border-right: 6px solid #3949ab;
                        }
                        .school-info h2 {
                            font-size: 22px;
                            color: #3949ab;
                            margin-bottom: 15px;
                            font-weight: 700;
                        }
                        .school-info p {
                            font-size: 20px;
                            margin: 10px 0;
                            font-weight: 600;
                        }
                        .school-info strong {
                            font-weight: 700;
                            color: #1a237e;
                        }
                        .btn-primary {
                            background-color: #1a237e;
                            color: #ffffff !important;
                            padding: 18px 35px;
                            text-decoration: none;
                            border-radius: 12px;
                            display: inline-block;
                            font-size: 22px;
                            font-weight: 700;
                            margin-top: 25px;
                            transition: all 0.3s ease;
                            box-shadow: 0 4px 15px rgba(26, 35, 126, 0.2);
                        }
                        .btn-primary:hover {
                            background-color: #0d47a1;
                            transform: translateY(-2px);
                            box-shadow: 0 6px 20px rgba(26, 35, 126, 0.3);
                        }
                        .footer {
                            text-align: center;
                            margin-top: 35px;
                            padding-top: 25px;
                            border-top: 2px solid #eee;
                            color: #555;
                        }
                        .footer p {
                            margin: 8px 0;
                            font-size: 18px;
                            font-weight: 500;
                            text-decoration: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🎉 تهانينا! تمت إضافتك كمعلم 🎉</h1>
                        </div>
                        <div class="content">
                            <h2>مرحباً ${name}، يسعدنا انضمامك إلى فريق برنامج اندية القراءة المدرسية</h2>
                            <div class="school-info">
                                <h2>معلومات المدرسة</h2>
                                <p><strong>اسم المدرسة:</strong> ${school.name}</p>
                                <p><strong>كود المدرسة:</strong> ${school.code}</p>
                            </div>
                            <p>لاستكمال عملية التسجيل، يُرجى الضغط على الزر أدناه لتعيين كلمة المرور الخاصة بك واستكمال بياناتك</p>                            <a href="${completeProfileLink}" class="btn-primary">استكمال البيانات</a>
                        </div>
                           <div class="footer">
                            <p>هذا البريد الإلكتروني تم إرساله تلقائيًا. في حالة وجود أي مشكلة، يُرجى مراسلتنا على </p>
                            <p style="text-decoration: none;">schools@alephyaa.net</p>
                            <p>© 2024 جميع الحقوق محفوظة </p>
                            <p style="text-decoration: none;">www.alephyaa.net</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: 'تم اضافة المعلم بنجاح في نظامنا وتم ارسال رابط استكمال البيانات على بريده الالكتروني',
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const completeProfileTeacher = async (req, res) => {
    try {
        // Validate request body
        const { error } = completeProfileSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password, phone } = req.body;

     
        const teacher = await Teachermodel.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: 'خطأ في البريد الالكتروني' });
        }

        
        teacher.password = password;
        teacher.phone = phone;
        await teacher.save();

        res.json({status: 200,success: true, message: 'تم استكمال بيانات المعلم بنجاح' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginTeacher = async (req, res) => {
    try {
        // Validate request body
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password } = req.body;

        // Find teacher
        const teacher = await Teachermodel.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: 'بريد الكتروني غير صالح' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, teacher.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
        }

        // Get token from database
        const tokenDoc = await TeacherTokenModel.findOne({ TeacherId: teacher._id });
        if (!tokenDoc) {
            return res.status(404).json({ message: 'رمز التحقق غير صالح' });
        }

        res.json({
            status: 200,
            message: 'تم تسجيل الدخول بنجاح',
            token: tokenDoc.token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const forgetPasswordTeacher = async (req, res) => {
    try {
        // Validate request body
        const { error } = forgetPasswordSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, newPassword, confirmPassword } = req.body;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين' });
        }

        // Find teacher by email
        const teacher = await Teachermodel.findOne({ email });
        if (!teacher) {
            return res.status(404).json({ message: 'البريد الالكتروني غير مسجل' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.saltround));
        
        // Update password
        teacher.password = hashedPassword;
        await teacher.save();

      

        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        const teacher = await Teachermodel.findByIdAndUpdate(id, update, { new: true });
        if (!teacher) {
            return res.status(404).json({status: 404,success: false, message: 'هذا المعلم غير موجود' });
        }

        res.json({status: 200,success: true, message: 'تم تحديث بيانات المعلم بنجاح' });

    } catch (error) {
        res.status(500).json({status: 500,success: false, message: error.message });
    }
};

export const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teachermodel.findByIdAndDelete(id);
        if (!teacher) {
            return res.status(404).json({status: 404,success: false, message: 'المعلم غير موجود' });
        }

        // Delete associated token
        await TeacherTokenModel.deleteOne({ TeacherId: id });

        res.json({status: 200,success: true, message: 'تم حذف المعلم بنجاح' });

    } catch (error) {
        res.status(500).json({status: 500,success: false, message: error.message });
    }
};

export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teachermodel.find().populate('schoolId', 'name code');
        res.json({status: 200,success: true, data: teachers});
    } catch (error) {
        res.status(500).json({status: 500,success: false, message: error.message });
    }
};

export const getTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const teacher = await Teachermodel.findById(id).populate('schoolId', 'name code');
        if (!teacher) {
            return res.status(404).json({status: 404,success: false, message: 'المعلم غير موجود' });
        }

        res.json({status: 200,success: true, data: teacher});

    } catch (error) {
        res.status(500).json({status: 500,success: false, message: error.message });
    }
};
