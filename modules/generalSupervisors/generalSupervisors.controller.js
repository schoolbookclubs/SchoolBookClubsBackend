import GeneralSupervisorModel from "../../models/generalSupervisors.model.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import GeneralSupervisorTokenModel from "../../models/generalSupervisorstoken.model.js";
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
class GeneralSupervisorController {
    // Create new general supervisor
    async signup(req, res) {
        try {
            const { name, email,phone, password } = req.body;
    
          
    
            // Check if email already exists
            const existingGeneralSupervisor = await GeneralSupervisorModel.findOne({ email });
            if (existingGeneralSupervisor) {
                return res.status(400).json({ message: 'البريد الالكتروني موجود بالفعل' });
            }
    
    
            // Create new general supervisor
            const generalSupervisor = new GeneralSupervisorModel({
                name,
                email,
                phone,
                password
            });
            await generalSupervisor.save();
    
            res.status(201).json({ message: 'تم انشاء حسابك بنجاح' });
    
    
    
            const token = jwt.sign(
                { id: generalSupervisor._id, email: generalSupervisor.email },
                process.env.JWT_SECRET
            );
    
            // Save new token
            await new GeneralSupervisorTokenModel({ generalSupervisorId: generalSupervisor._id, token }).save();
    
          
    
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Login general supervisor
    async login(req, res) {
        try {
            const { email, password } = req.body;
    
            // Find general supervisor
            const generalSupervisor = await GeneralSupervisorModel.findOne({ 
            email: { $regex: new RegExp(`^${email}$`, 'i') } 
             });
            if (!generalSupervisor) {
                return res.status(404).json({ message: 'البريد الالكتروني غير صالح' });
            }
    
            // Check password
            const isMatch = await bcrypt.compare(password, generalSupervisor.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
            }
    
            // Get token from database
            const tokenDoc = await GeneralSupervisorTokenModel.findOne({ generalSupervisorId: generalSupervisor._id });
            if (!tokenDoc) {
                return res.status(400).json({ message: 'No token found' });
            }
    
    
            // Send token in response
            res.status(200).json({message: 'تم تسجيل الدخول بنجاح' ,token: tokenDoc.token });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    // Get all general supervisors
    async getAllSupervisors(req, res) {
        try {
            const supervisors = await GeneralSupervisorModel.find();
            res.status(200).json({
                status: 'success',
                results: supervisors.length,
                data: {
                    supervisors
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'fail',
                message: error.message
            });
        }
    }

    // Get single supervisor by ID
    async getSupervisor(req, res) {
        try {
            const supervisor = await GeneralSupervisorModel.findById(req.params.id);
            if (!supervisor) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No supervisor found with that ID'
                });
            }
            res.status(200).json({
                status: 'success',
                data: {
                    supervisor
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'fail',
                message: error.message
            });
        }
    }

    // Update supervisor
    async updateSupervisor(req, res) {
        try {
            const supervisor = await GeneralSupervisorModel.findByIdAndUpdate(
                req.params.id,
                req.body,
                {
                    new: true,
                    runValidators: true
                }
            );
            if (!supervisor) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No supervisor found with that ID'
                });
            }
            res.status(200).json({
                status: 'تم تحديث بيانات المشرف بنجاح',
                data: {
                    supervisor
                }
            });
        } catch (error) {
            res.status(400).json({
                status: 'حدث خطاء اثناء تحديث بيانات المشرف',
                message: error.message
            });
        }
    }

    // Delete supervisor
    async deleteSupervisor(req, res) {
        try {
            const supervisor = await GeneralSupervisorModel.findByIdAndDelete(req.params.id);
            if (!supervisor) {
                return res.status(404).json({
                    status: 'fail',
                    message: 'No supervisor found with that ID'
                });
            }
            await GeneralSupervisorTokenModel.deleteOne({ generalSupervisorId: supervisor._id });
            res.status(204).json({
                status: 'تم حذف بيانات المشرف بنجاح',
                data: null
            });
        } catch (error) {
            res.status(400).json({
                status: 'حدث خطاء اثناء حذف بيانات المشرف',
                message: error.message
            });
        }
    }

    // generateVerificationCode
    async generateVerificationCode(req, res){
        try {
            const { email } = req.body;
            
            // Find the teacher
            const generalSupervisor = await GeneralSupervisorModel.findOne({ email });
            if (!generalSupervisor) {
                return res.status(404).json({ message: "المشرف غير موجود" });
            }
    
            // Check if verification code already exists
            if (generalSupervisor.verificationCode) {
                return res.status(400).json({ 
                    message: "لديك بالفعل رمز تحقق صالح. يرجى استخدام الرمز المرسل مسبقاً " 
                });
            }
    
            // Generate a random 6-digit code
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Save the code to database
            generalSupervisor.verificationCode = verificationCode;
            await generalSupervisor.save();
    
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
                        <h2 >مرحباً ${generalSupervisor.name}</h2>
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
    //verifyCodeAndResetPassword
    async verifyCodeAndResetPassword(req, res){
        try {
            const { email, verificationCode, newPassword, confirmPassword } = req.body;
    
            // Validate passwords match
            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: "كلمات المرور غير متطابقة" });
            }
    
            // Find teacher and verify code
            const generalSupervisor = await GeneralSupervisorModel.findOne({ 
                email, 
                verificationCode: verificationCode 
            });
    
            if (!generalSupervisor) {
                return res.status(400).json({ message: "رمز التحقق غير صحيح" });
            }
    
            // Update password and remove verification code
            generalSupervisor.password = newPassword;
            generalSupervisor.verificationCode = undefined;
            await generalSupervisor.save();
    
            res.status(200).json({ message: "تم تغيير كلمة المرور بنجاح" });
        } catch (error) {
            res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور", error: error.message });
        }
    };
}

export default new GeneralSupervisorController();
