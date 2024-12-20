import ReadingClubEvaluation from '../../models/ReadingClubEvaluation.model.js';

// Create a new Reading Club Evaluation
export const createReadingClubEvaluation = async (req, res) => {
  try {
    const { 
      studentId,
      schoolCode,
      readingPerspectiveChange,
      mostBeneficialAspect,
      readingSkillsImprovement,
      mostLikedAspect,
      leastLikedAspect,
      booksToAddToNextList
    } = req.body;

    // Check if student has already submitted an evaluation
    const existingEvaluation = await ReadingClubEvaluation.findOne({ studentId });
    if (existingEvaluation) {
      return res.status(400).json({
        success: false,
        message: "لقد قمت بتقييم النادي مسبقاً"
      });
    }

    const newEvaluation = await ReadingClubEvaluation.create({
      studentId,
      schoolCode,
      readingPerspectiveChange,
      mostBeneficialAspect,
      readingSkillsImprovement,
      mostLikedAspect,
      leastLikedAspect,
      booksToAddToNextList
    });

    res.status(201).json({
      success: true,
      data: newEvaluation,
      message: 'تم ارسال تقييمك بنجاح'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all Reading Club Evaluations
export const getAllReadingClubEvaluations = async (req, res) => {
  try {
    const evaluations = await ReadingClubEvaluation.find()
      .populate('studentId', 'name email');

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get a single Reading Club Evaluation by ID
export const getReadingClubEvaluationById = async (req, res) => {
  try {
    const evaluation = await ReadingClubEvaluation.findById(req.params.id)
      .populate('studentId', 'name email');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Reading Club Evaluations for a specific student
export const getStudentReadingClubEvaluations = async (req, res) => {
  try {
    const evaluations = await ReadingClubEvaluation.find({ studentId: req.params.studentId })
      .populate('studentId', 'name email');

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Reading Club Evaluations by school code
export const getEvaluationsBySchoolCode = async (req, res) => {
  try {
    const { schoolCode } = req.params;
    const evaluations = await ReadingClubEvaluation.find({ schoolCode })
      .populate('studentId', 'name email');

    res.status(200).json({
      success: true,
      count: evaluations.length,
      data: evaluations
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get Reading Club Evaluations for a specific student with student details
export const getStudentEvaluationsWithDetails = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const evaluations = await ReadingClubEvaluation.find({ studentId })
      .populate('studentId', 'name'); // Get student name
    
    if (!evaluations || evaluations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "لم يتم العثور على تقييمات لهذا الطالب"
      });
    }

    return res.status(200).json({
      success: true,
      data: evaluations
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء جلب تقييمات الطالب",
      error: error.message
    });
  }
};

// Update a Reading Club Evaluation
export const updateReadingClubEvaluation = async (req, res) => {
  try {
    const { 
      readingPerspectiveChange,
      mostBeneficialAspect,
      readingSkillsImprovement,
      mostLikedAspect,
      leastLikedAspect,
      booksToAddToNextList
    } = req.body;

    const evaluation = await ReadingClubEvaluation.findByIdAndUpdate(
      req.params.id, 
      {
        readingPerspectiveChange,
        mostBeneficialAspect,
        readingSkillsImprovement,
        mostLikedAspect,
        leastLikedAspect,
        booksToAddToNextList
      }, 
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a Reading Club Evaluation
export const deleteReadingClubEvaluation = async (req, res) => {
  try {
    const evaluation = await ReadingClubEvaluation.findByIdAndDelete(req.params.id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Evaluation deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};