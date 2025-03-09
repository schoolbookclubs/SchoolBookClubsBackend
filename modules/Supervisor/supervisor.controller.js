import Supervisormodel from '../../models/Supervisor.model.js';
import SupervisorTokenModel from '../../models/SupervisorToken.model.js';
import Schoolmodel from '../../models/School.model.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    host: 'mail.alephyaa.net',
    port: 465,
    secure: true,
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
    role: Joi.string().default('مشرف')
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

export const signupSupervisor = async (req, res) => {
    try {
        // Validate request body
        const { error } = signupSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, email, schoolCode, role } = req.body;

        // Check if supervisor already exists
        const existingSupervisor = await Supervisormodel.findOne({ email });
        if (existingSupervisor) {
            return res.status(400).json({ message: 'هذا المشرف مسجل بالفعل علي نظامنا' });
        }

        // Find the school by schoolCode
        const school = await Schoolmodel.findOne({ code:schoolCode });
        if (!school) {
            return res.status(404).json({ message: 'لم يتم العثور على المدرسة بهذا الكود' });
        }

        // Create new supervisor with schoolId
        const supervisor = new Supervisormodel({
            name,
            email,
            schoolCode,
            role,
            schoolId: school._id
        });
        await supervisor.save();

        // Generate token
        const token = jwt.sign(
            { id: supervisor._id, email, schoolCode, role },
            process.env.JWT_SECRET
        );

        // Save token to database
        const supervisorToken = new SupervisorTokenModel({
            SupervisorId: supervisor._id,
            token,
            schoolCode : supervisor.schoolCode
        });
        await supervisorToken.save();

        // Create complete profile link
        const completeProfileLink = `https://alephyaa.net/SchoolsBookClubs/CompleteProfileSupervisor?token=${token}`;

        // Send email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'تهانينا! تم إضافتك كمشرف - برنامج اندية القراءة المدرسية',
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
                            
                            <h1>🎉 تهانينا! تمت إضافتك كمشرف 🎉</h1>
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
            message: 'تم اضافة المشرف بنجاح في نظامنا وتم ارسال رابط استكمال البيانات على بريده الالكتروني',
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const completeProfileSupervisor = async (req, res) => {
    try {
        // Validate request body
        const { error } = completeProfileSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password, phone } = req.body;

        // Find supervisor
        const supervisor = await Supervisormodel.findOne({ email });
        if (!supervisor) {
            return res.status(404).json({ message: 'خطأ في البريد الالكتروني' });
        }

        // Update supervisor
        supervisor.password = password;
        supervisor.phone = phone;
        await supervisor.save();

        res.json({status: 200,success: true, message: 'تم استكمال بيانات المشرف بنجاح' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginSupervisor = async (req, res) => {
    try {
        // Validate request body
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, password } = req.body;

        // Find supervisor
        const supervisor = await Supervisormodel.findOne({ 
    email: { $regex: new RegExp(`^${email}$`, 'i') } 
});
        if (!supervisor) {
            return res.status(404).json({ message: 'بريد الكتروني غير صالح' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, supervisor.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
        }

        // Get token from database
        const tokenDoc = await SupervisorTokenModel.findOne({ SupervisorId: supervisor._id });
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

export const forgetPasswordSupervisor = async (req, res) => {
    try {
        // Validate request body
        const { error } = forgetPasswordSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { email, newPassword, confirmPassword } = req.body;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين' });
        }

        // Find supervisor by email
        const supervisor = await Supervisormodel.findOne({ email });
        if (!supervisor) {
            return res.status(404).json({ message: 'البريد الالكتروني غير مسجل' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.saltround));
        
        // Update password
        supervisor.password = hashedPassword;
        await supervisor.save();

       

        res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSupervisor = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        const supervisor = await Supervisormodel.findByIdAndUpdate(id, update, { new: true });
        if (!supervisor) {
            return res.status(404).json({ message: 'هذا المشرف غير موجود' });
        }

        res.json({status: 200,success: true, message: 'تم تحديث بيانات المشرف بنجاح' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSupervisor = async (req, res) => {
    try {
        const { id } = req.params;

        const supervisor = await Supervisormodel.findByIdAndDelete(id);
        if (!supervisor) {
            return res.status(404).json({ message: 'المشرف غير موجود' });
        }

        // Delete associated token
        await SupervisorTokenModel.deleteOne({ SupervisorId: id });

        res.json({status: 200,success: true, message: 'تم حذف المشرف بنجاح' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllSupervisors = async (req, res) => {
    try {
        const supervisors = await Supervisormodel.find().populate('schoolId', 'name code');
        res.json({status: 200,success: true, data: supervisors});
    } catch (error) {
        res.status(500).json({status: 500,success: false, message: error.message });
    }
};

export const getSupervisor = async (req, res) => {
    try {
        const { id } = req.params;

        const supervisor = await Supervisormodel.findById(id).populate('schoolId', 'name code');
        if (!supervisor) {
            return res.status(404).json({status: 404,success: false, message: 'المشرف غير موجود' });
        }

        res.json({status: 200,success: true, data: supervisor});

    } catch (error) {
        res.status(500).json({status: 500,success: false, message: error.message });
    }
};

export const generateVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find the teacher
        const supervisor = await Supervisormodel.findOne({ email });
        if (!supervisor) {
            return res.status(404).json({ message: "المشرف غير موجود" });
        }

        // Check if verification code already exists
        if (supervisor.verifiedCode) {
            return res.status(400).json({ 
                message: "لديك بالفعل رمز تحقق صالح. يرجى استخدام الرمز المرسل مسبقاً " 
            });
        }

        // Generate a random 6-digit code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save the code to database
        supervisor.verifiedCode = verificationCode;
        await supervisor.save();

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: 'mail.alephyaa.net',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        // Create HTML email template
        const htmlEmail = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                    border-radius: 10px 10px 0 0;
                }
                .content {
                    padding: 20px;
                    background-color: white;
                    border-radius: 0 0 10px 10px;
                    text-align: center;
                    
                }
                .code {
                    font-size: 32px;
                    font-weight: bold;
                    color: #4CAF50;
                    text-align: center;
                    padding: 20px;
                    margin: 20px 0;
                    background-color: #f0f0f0;
                    border-radius: 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 20px;
                    color: #666;
                }
                .icon {
                    font-size: 48px;
                    text-align: center;
                    margin-bottom: 20px;
                    font-size: 25px;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>أندية القراءة المدرسية</h1>
                </div>
                <div class="content">
                    <div class="icon">📚</div>
                    <h2 >مرحباً ${supervisor.name}</h2>
                    <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بك. الرجاء استخدام الرمز التالي:</p>
                    <div class="code">${verificationCode}</div>
                    <p> الرجاء عدم مشاركة هذا الرمز مع أي شخص</p>
                    <div class="footer">
                        <p>مع تحيات فريق أندية القراءة المدرسية</p>
                            <p>© 2024 جميع الحقوق محفوظة </p>
                            <p style="text-decoration: none;">www.alephyaa.net</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "رمز التحقق - أندية القراءة المدرسية",
            html: htmlEmail
        });

        res.status(200).json({ message: "تم إرسال رمز التحقق بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء إرسال رمز التحقق", error: error.message });
    }
};

export const verifyCodeAndResetPassword = async (req, res) => {
    try {
        const { email, verificationCode, newPassword, confirmPassword } = req.body;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "كلمات المرور غير متطابقة" });
        }

        // Find teacher and verify code
        const supervisor = await Supervisormodel.findOne({ 
            email, 
            verifiedCode: verificationCode 
        });

        if (!supervisor) {
            return res.status(400).json({ message: "رمز التحقق غير صحيح" });
        }

        // Update password and remove verification code
        supervisor.password = newPassword;
        supervisor.verifiedCode = undefined;
        await supervisor.save();

        res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور", error: error.message });
    }
};
