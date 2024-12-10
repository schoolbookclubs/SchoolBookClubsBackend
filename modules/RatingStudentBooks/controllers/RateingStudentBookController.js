import RateingStudentBook from "../../../models/RateingStudentBook.js";

class RateingStudentBookController {
  // Create a new book rating
  static async createBookRating(req, res) {
    try {
      const ratingData = {
        studentId: req.body.studentId,
        bookId: req.body.bookId,
        mainCharacters: req.body.mainCharacters,
        characterTraits: req.body.characterTraits,
        keySummary: req.body.keySummary,
        favoriteQuotes: req.body.favoriteQuotes,
        hypotheticalChanges: req.body.hypotheticalChanges,
        overallOpinion: req.body.overallOpinion,
        recommendBook: req.body.recommendBook,
        authorStyle: req.body.authorStyle,
        keyIdeas: req.body.keyIdeas,
        likedIdeas: req.body.likedIdeas,
        dislikedIdeas: req.body.dislikedIdeas,
        memorableQuotes: req.body.memorableQuotes,
        potentialAdditions: req.body.potentialAdditions,
        personalImpact: req.body.personalImpact,
        bookRating: req.body.bookRating
      };

      const newRating = new RateingStudentBook(ratingData);
      const savedRating = await newRating.save();

      res.status(201).json({
        message: 'Book rating created successfully',
        rating: savedRating
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error creating book rating',
        error: error.message
      });
    }
  }

  // Get ratings for a specific book
  static async getBookRatings(req, res) {
    try {
      const bookId = req.params.bookId;
      const ratings = await RateingStudentBook.find({ bookId })
        .populate('studentId', 'name');

      res.status(200).json({
        message: 'Book ratings retrieved successfully',
        ratings: ratings
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error retrieving book ratings',
        error: error.message
      });
    }
  }

  // Get ratings by a specific student
  static async getStudentBookRatings(req, res) {
    try {
      const studentId = req.params.studentId;
      const ratings = await RateingStudentBook.find({ studentId })
        .populate('bookId', 'title');

      res.status(200).json({
        message: 'Student book ratings retrieved successfully',
        ratings: ratings
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error retrieving student book ratings',
        error: error.message
      });
    }
  }
}

export default RateingStudentBookController;
