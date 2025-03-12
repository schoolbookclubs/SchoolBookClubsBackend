import express from 'express';
import {
    createDraft,
    getDraftsByTeacher,
    getDraftsByStudent,
    getDraftById,
    updateDraft,
    deleteDraft,
    publishDraft
} from './DraftRating.controller.js';

const router = express.Router();

// Create a new draft
router.post('/', createDraft);

// Get drafts by teacher
router.get('/teacher/:teacherId', getDraftsByTeacher);

// Get drafts by student
router.get('/student/:studentId', getDraftsByStudent);

// Get single draft
router.get('/:id', getDraftById);

// Update draft
router.put('/:id', updateDraft);

// Delete draft
router.delete('/:id', deleteDraft);

// Publish draft
router.post('/publish/:id', publishDraft);

export default router;
