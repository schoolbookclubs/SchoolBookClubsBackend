import StudentSelfAssessment from "../../../models/StudentSelfAssessment.js";

class StudentSelfAssessmentController {
  // Create a new self assessment
  static async createSelfAssessment(req, res) {
    try {
      const { studentId, bookId } = req.params;
      
      // Check if student has already submitted a self assessment for this book
      const existingAssessment = await StudentSelfAssessment.findOne({ studentId, bookId });
      if (existingAssessment) {
        return res.status(400).json({ 
          success: false, 
          message: "لقد قمت بإضافة تقييم ذاتي لهذا الكتاب مسبقاً" 
        });
      }

      const assessmentData = {
        studentId,
        bookId,
        schoolCode: req.body.schoolCode,
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
      await newAssessment.save();

      res.status(201).json({
        success: true,
        message: "تم إضافة التقييم الذاتي بنجاح",
        data: newAssessment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء إضافة التقييم الذاتي",
        error: error.message
      });
    }
  }

  // Get student's self assessment for a specific book
  static async getStudentSelfAssessment(req, res) {
    try {
      const { studentId, bookId } = req.params;
      
      const assessment = await StudentSelfAssessment.find({ studentId, bookId });
      
      if (!assessment || assessment.length === 0) {
        return res.status(404).json({
          success: false,
          message: "لم يتم العثور على تقييم ذاتي لهذا الكتاب"
        });
      }

      res.status(200).json({
        success: true,
        message: "تم جلب التقييم الذاتي بنجاح",
        data: assessment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب التقييم الذاتي",
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

  // Get self-assessments by school code with average ratings
  static async getAssessmentsBySchoolCode(req, res) {
    try {
      const { schoolCode } = req.params;
      const assessments = await StudentSelfAssessment.find({ schoolCode })
        .populate('studentId', 'name')
        .populate('bookId', 'title');

      const assessmentsWithAverages = assessments.map(assessment => ({
        student: assessment.studentId,
        book: assessment.bookId,
        ratings: {
          enjoyedReading: assessment.enjoyedReading,
          readUsefulBooks: assessment.readUsefulBooks,
          madeNewFriends: assessment.madeNewFriends,
          conversationsImprovedUnderstanding: assessment.conversationsImprovedUnderstanding,
          expressedOpinionFreely: assessment.expressedOpinionFreely,
          increasedSelfConfidence: assessment.increasedSelfConfidence,
          wouldEncourageClassmates: assessment.wouldEncourageClassmates,
          willJoinNextYear: assessment.willJoinNextYear
        },
        averageRating: assessment.calculateAverageRating()
      }));

      res.status(200).json({
        message: 'Assessments retrieved successfully',
        assessments: assessmentsWithAverages
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving assessments',
        error: error.message
      });
    }
  }

  // Get all self assessments for a specific student with book and student details
  static async getStudentSelfAssessmentsWithDetails(req, res) {
    try {
      const { studentId } = req.params;
      
      const assessments = await StudentSelfAssessment.find({ studentId })
        .populate('studentId', 'name') // Get student name
        .populate('bookId', 'title'); // Get book title
      
      if (!assessments || assessments.length === 0) {
        return res.status(404).json({
          success: false,
          message: "لم يتم العثور على تقييمات ذاتية لهذا الطالب"
        });
      }

      return res.status(200).json({
        success: true,
        data: assessments
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب التقييمات الذاتية للطالب",
        error: error.message
      });
    }
  }

  // Get all student self assessments for a specific book with student details
  static async getBookStudentSelfAssessmentsWithDetails(req, res) {
    try {
      const { bookId } = req.params;
      
      const assessments = await StudentSelfAssessment.find({ bookId })
        .populate('studentId', 'name') // Get student name
        .populate('bookId', 'title'); // Get book title
      
      if (!assessments || assessments.length === 0) {
        return res.status(404).json({
          success: false,
          message: "لم يتم العثور على تقييمات ذاتية لهذا الكتاب"
        });
      }

      return res.status(200).json({
        success: true,
        data: assessments
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب التقييمات الذاتية للكتاب",
        error: error.message
      });
    }
  }
}

export default StudentSelfAssessmentController;
