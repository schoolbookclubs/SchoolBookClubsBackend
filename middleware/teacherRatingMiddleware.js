import Teacher from '../models/Teacher.model.js';
import Student from '../models/Student.model.js';

const validateTeacherAndStudent = async (req, res, next) => {
    try {
        const { teacherId, studentId } = req.params;

        // Check if teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Attach teacher and student to request for further use
        req.teacher = teacher;
        req.student = student;

        next();
    } catch (error) {
        res.status(500).json({ 
            message: 'Error validating teacher and student', 
            error: error.message 
        });
    }
};

export { validateTeacherAndStudent };
