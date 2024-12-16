import express from 'express';
import StudentSelfAssessmentController from '../controllers/StudentSelfAssessmentController.js';

const router = express.Router();

// Route to create a new self-assessment
router.post('/create', StudentSelfAssessmentController.createSelfAssessment);

// Route to get self-assessment for a specific student
router.get('/student/:studentId', StudentSelfAssessmentController.getStudentSelfAssessment);

// Route to get all self-assessments
router.get('/all', StudentSelfAssessmentController.getAllSelfAssessments);
router.get('/oneschool/:schoolCode/StudentsSelfAssessments', StudentSelfAssessmentController.getAssessmentsBySchoolCode);

export default router;
