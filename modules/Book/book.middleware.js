import jwt from 'jsonwebtoken';
import Teachermodel from '../../models/Teacher.model.js';

export const protect = async (req, res, next) => {
    try {
        // 1) Check if token exists
        let token;
        if (
            req.headers.authorization && 
            req.headers.authorization.startsWith('Bearer')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'لم يتم توفير رمز المصادقة. يرجى تسجيل الدخول'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Check if teacher still exists
        const currentTeacher = await Teachermodel.findById(decoded.id);
        
        if (!currentTeacher) {
            return res.status(401).json({
                status: 'error',
                message: 'المعلم غير موجود. يرجى تسجيل الدخول مرة أخرى'
            });
        }

        // 4) Attach teacher to request object
        req.user = currentTeacher;
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'رمز المصادقة غير صالح'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'انتهت صلاحية رمز المصادقة. يرجى تسجيل الدخول مرة أخرى'
            });
        }

        // For any other unexpected errors
        res.status(500).json({
            status: 'error',
            message: 'حدث خطأ أثناء المصادقة'
        });
    }
};
