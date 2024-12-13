import StudentSelfAssessment from '../../../models/StudentSelfAssessment.js';

class StudentSelfAssessmentController {
  // Create a new self-assessment
  static async createSelfAssessment(req, res) {
    try {
      const assessmentData = {
        studentId: req.body.studentId,
        bookId: req.body.bookId,
        enjoyedReading: req.body.enjoyedReading,
        readUsefulBooks: req.body.readUsefulBooks,
        madeNewFriends: req.body.madeNewFriends,
        conversationsImprovedUnderstanding: req.body.conversationsImprovedUnderstanding,
        expressedOpinionFreely: req.body.expressedOpinionFreely,
        increasedSelfConfidence: req.body.increasedSelfConfidence,
        wouldEncourageClassmates: req.body.wouldEncourageClassmates,
        willJoinNextYear: req.body.willJoinNextYear
      };

      const newAssessment = new StudentSelfAssessment(assessmentData);
      const savedAssessment = await newAssessment.save();

      res.status(201).json({
        status: 200,
        success: true,
        message: 'Self-assessment created successfully',
        assessment: savedAssessment
      });
    } catch (error) {
      res.status(400).json({
        status: 400,
        success: false,
        message: 'Error creating self-assessment',
        error: error.message
      });
    }
  }

  // Get self-assessment for a specific student
  static async getStudentSelfAssessment(req, res) {
    try {
      const studentId = req.params.studentId;
      const assessment = await StudentSelfAssessment.find({ studentId })
        .sort({ createdAt: -1 }) // Get the most recent assessment
        .limit(1);

      if (assessment.length === 0) {
        return res.status(404).json({
          message: 'No self-assessment found for this student'
        });
      }

      res.status(200).json({
        message: 'Student self-assessment retrieved successfully',
        assessment: assessment[0]
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error retrieving student self-assessment',
        error: error.message
      });
    }
  }

  // Get all self-assessments
  static async getAllSelfAssessments(req, res) {
    try {
      const assessments = await StudentSelfAssessment.find()
        .populate('studentId', 'name');

      res.status(200).json({
        message: 'All self-assessments retrieved successfully',
        assessments: assessments
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error retrieving self-assessments',
        error: error.message
      });
    }
  }
}

export default StudentSelfAssessmentController;
