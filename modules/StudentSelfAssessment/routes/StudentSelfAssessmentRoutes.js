import express from 'express';
import StudentSelfAssessmentController from '../controllers/StudentSelfAssessmentController.js';

const router = express.Router();

// Route to create a new self assessment
router.post('/student/:studentId/book/:bookId', StudentSelfAssessmentController.createSelfAssessment);

// Route to get student's self assessment for a specific book
router.get('/student/:studentId/book/:bookId', StudentSelfAssessmentController.getStudentSelfAssessment);

// Route to get all self assessments for a specific student with details
router.get('/getStudentSelfAssessmentsWithDetails/:studentId', StudentSelfAssessmentController.getStudentSelfAssessmentsWithDetails);

// Route to get all student self assessments for a specific book with details
router.get('/getBookStudentSelfAssessmentsWithDetails/:bookId', StudentSelfAssessmentController.getBookStudentSelfAssessmentsWithDetails);
router.get('/oneschool/:schoolCode/StudentsSelfAssessments', StudentSelfAssessmentController.getAssessmentsBySchoolCode);

export default router;
