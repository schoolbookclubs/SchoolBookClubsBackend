import StudentTokenModel from '../../models/StudentToken.model.js';
import SchoolModel from '../../models/School.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import StudentModel from '../../models/Student.model.js';
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

// Generate random 6-digit student code
const generateStudentCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const signup = async (req, res) => {
    try {
        const { name, email, password, schoolCode, role, grade } = req.body;

        // Check if school exists
        const school = await SchoolModel.findOne({ code: schoolCode });
        if (!school) {
            return res.status(404).json({ message: 'كود المدرسة غير صالح' });
        }

        // Check if email already exists
        const existingStudent = await StudentModel.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: 'البريد الالكتروني موجود بالفعل' });
        }

        // Generate unique student code
        let studentCode;
        let isUnique = false;
        while (!isUnique) {
            studentCode = generateStudentCode();
            const existing = await StudentModel.findOne({ studentCode });
            if (!existing) isUnique = true;
        }


        // Create new student
        const student = new StudentModel({
            name,
            email,
            password,
            schoolCode,
            studentCode,
            role,
            grade,
            schoolId: school._id
        });
        await student.save();

        // Generate token
        const token = jwt.sign(
            { id: student._id, email: student.email, studentCode: student.studentCode,schoolCode:student.schoolCode,role:student.role,name:student.name,grade:student.grade },
            process.env.JWT_SECRET
        );

        // Save token
        await new StudentTokenModel({ studentId: student._id, token,schoolCode:student.schoolCode }).save();

        // Send welcome email
        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'تهانينا! تم إضافتك كطالب في المدرسة - برنامج اندية القراءة المدرسية',
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
                        .warning {
                            background: #fff3e0;
                            padding: 20px;
                            border-radius: 12px;
                            margin: 25px 0;
                            border-right: 6px solid #e65100;
                        }
                        .warning p {
                            color: #e65100;
                            margin: 0;
                            font-weight: 600;
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
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>مرحباً بك في برنامج اندية القراءة المدرسية</h1>
                        </div>
                        <div class="content">
                            <h2>عزيزي ${name}</h2>
                            <p>نرحب بك في مدرستنا! فيما يلي بياناتك المهمة</p>
                            
                            <div class="school-info">
                                <h2>معلومات المدرسة والطالب</h2>
                                <p>اسم المدرسة: <strong>${school.name}</strong></p>
                                <p>كود المدرسة: <strong>${schoolCode}</strong></p>
                                <p>كودك الخاص: <strong>${studentCode}</strong></p>
                                <p>اسم الطالب: <strong>${name}</strong></p>
                               <p><strong>${email}</strong> : البريد الإلكتروني</p>

                            </div>

                            <div class="warning">
                                <p><strong>هام:</strong> برجاء الاحتفاظ بكودك الخاص ومشاركته فقط مع ولي أمرك.
                                لا تشاركه مع أصدقائك تجنباً لأي مشاكل</p>
                            </div>

                            <p>مع أطيب التحيات<br>فريق ${school.name}</p>
                        </div>
                        
                        <div class="footer">
                            <p>هذا البريد الإلكتروني تم إرساله تلقائيًا. في حالة وجود أي مشكلة، يُرجى مراسلتنا على</p>
                            <p>schools@alephyaa.net</p>
                            <p>© 2024 جميع الحقوق محفوظة</p>
                            <p>www.alephyaa.net</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({ 
            success: true, 
            message: 'تم انشاء الحساب بنجاح ,رجاءا التحقق من بريدك الالكتروني لاستلام الكود الخاص بك', 
            token 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find student
        const student = await StudentModel.findOne({ email });
        if (!student) {
            return res.status(404).json({ message: 'بريد الكتروني غير صالح' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
        }

        // Get existing token
        const existingToken = await StudentTokenModel.findOne({ studentId: student._id });
        const token = existingToken ? existingToken.token : jwt.sign(
            { id: student._id, email: student.email, studentCode: student.studentCode },
            process.env.JWT_SECRET
        );

        // Save new token if not exists
        if (!existingToken) {
            await new StudentTokenModel({ studentId: student._id, token }).save();
        }

        res.json({ success: true, message: 'تم تسجيل الدخول بنجاح', token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: 'كلمتا المرور غير متطابقتين' });
        }

        // Find student
        const student = await StudentModel.findOne({ email });
        if (!student) {
            return res.status(404).json({ message: 'البريد الالكتروني غير موجود' });
        }

        // Update password - no need to hash here as it's handled by the pre-save hook
        student.password = newPassword;
        await student.save();

        // Delete existing tokens
        await StudentTokenModel.deleteMany({ studentId: student._id });

        // Generate new token
        const token = jwt.sign(
            { id: student._id, email: student.email, studentCode: student.studentCode },
            process.env.JWT_SECRET
        );

        // Save new token
        await new StudentTokenModel({ studentId: student._id, token }).save();

        res.json({ 
            success: true, 
            message: 'تم تغيير كلمة مرور الطالب بنجاح', 
            token 
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password } = req.body;

        const updateData = { name, email };
        if (password) {
            updateData.password = await bcrypt.hash(password, parseInt(process.env.saltround));
        }

        const student = await StudentModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!student) {
            return res.status(404).json({ message: 'هذا الطالب غير موجود علي نظامنا' });
        }

        res.json({ success: true, message: 'تم تحديث بيانات الطالب بنجاح' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const student = await StudentModel.findByIdAndDelete(id);
        if (!student) {
            return res.status(404).json({ message: 'الطالب غير موجود علي نظامنا' });
        }

        // Delete associated tokens
        await StudentTokenModel.deleteMany({ studentId: id });

        res.json({ success: true, message: 'تم حذف الطالب بنجاح' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStudentsBySchoolCode = async (req, res) => {
    try {
        // Validate school code is provided in the request body
        const { schoolCode } = req.body;
            console.log(schoolCode);
        if (!schoolCode) {
            return res.status(400).json({
                status: 'خطأ',
                message: 'يجب تقديم الكود المدرسي'
            });
        }

        // Find students with the specified school code
        const students = await StudentModel.find({ 
            schoolCode: schoolCode 
        }).select('-password'); // Exclude password field

        // Check if any students found
        if (students.length === 0) {
            return res.status(404).json({
                status: 'خطأ',
                message: 'لم يتم العثور على طلاب للكود المدرسي المقدم'
            });
        }

        res.status(200).json({
            status: 'نجاح',
            results: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            status: 'خطأ',
            message: 'حدث خطأ أثناء استرداد الطلاب: ' + error.message
        });
    }
};

export const generateVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find the teacher
        const student = await StudentModel.findOne({ email });
        if (!student) {
            return res.status(404).json({ message: "الطالب غير موجود" });
        }

        // Check if verification code already exists
        if (student.verifiedCode) {
            return res.status(400).json({ 
                message: "لديك بالفعل رمز تحقق صالح. يرجى استخدام الرمز المرسل مسبقاً " 
            });
        }

        // Generate a random 6-digit code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Save the code to database
        student.verifiedCode = verificationCode;
        await student.save();

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
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
                    <h2 >مرحباً ${student.name}</h2>
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
        const student = await StudentModel.findOne({ 
            email, 
            verifiedCode: verificationCode 
        });

        if (!student) {
            return res.status(400).json({ message: "رمز التحقق غير صحيح" });
        }

        // Update password and remove verification code
        student.password = newPassword;
        student.verifiedCode = undefined;
        await student.save();

        res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
        res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور", error: error.message });
    }
};

//عرض جميع الطلاب من خلال كود المدرسة الاتي من params
export const getallStudentsBySchoolCode = async (req, res) => {
    try {
        // Validate school code is provided in the request body
        const { schoolCode } = req.params;
        if (!schoolCode) {
            return res.status(400).json({
                status: 'خطاء',
                message: 'يجب تقديم الكود المدرسي'
            });
        }

        // Find students with the specified school code
        const students = await StudentModel.find({ 
            schoolCode: schoolCode 
        })

        // Check if any students found
        if (students.length === 0) {
            return res.status(404).json({
                status: 'خطاء',
                message: 'لم يتم العثور على طلاب للكود المدرسي المقدم'
            });
        }

        res.status(200).json({
            status: 'نجاح',
            results: students.length,
            data: students
        });
    } catch (error) {
        res.status(500).json({
            status: 'خطاء',
            message: 'حدث خطاء اثناء استرداد الطلاب: ' + error.message
        });
    }
};