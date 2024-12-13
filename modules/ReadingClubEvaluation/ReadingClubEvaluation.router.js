import express from 'express';
import { 
  createReadingClubEvaluation,
  getAllReadingClubEvaluations,
  getReadingClubEvaluationById,
  getStudentReadingClubEvaluations,
  updateReadingClubEvaluation,
  deleteReadingClubEvaluation
} from './ReadingClubEvaluation.controller.js';

const router = express.Router();

// Routes for Reading Club Evaluation
router.route('/')
  .post(createReadingClubEvaluation)
  .get(getAllReadingClubEvaluations);

router.route('/:id')
  .get(getReadingClubEvaluationById)
  .put(updateReadingClubEvaluation)
  .delete(deleteReadingClubEvaluation);

router.route('/student/:studentId')
  .get(getStudentReadingClubEvaluations);

export default router;