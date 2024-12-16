import express from 'express';
import ParentAssessmentController from '../controllers/ParentAssessmentController.js';

const router = express.Router();

// Route to create a new parent assessment
router.post('/create', ParentAssessmentController.createParentAssessment);

// Route to get assessments for a specific student by a parent
router.get('/:parentId/student/:studentId', ParentAssessmentController.getStudentAssessmentsByParent);

// Route to get all assessments for a parent
router.get('/:parentId', ParentAssessmentController.getAllParentAssessments);

// Route to get parent assessments by school code
router.get('/parentAssessmentsByschoolCode/:schoolCode/parentAssessments', ParentAssessmentController.getAssessmentsBySchoolCode);

export default router;
