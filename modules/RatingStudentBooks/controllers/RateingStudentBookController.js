import RateingStudentBook from "../../../models/RateingStudentBook.js";

class RateingStudentBookController {
  // Create a new book rating
  static async createBookRating(req, res) {
    try {
      const { studentId, bookId } = req.params;
      
      // Check if student has already rated this book
      const existingRating = await RateingStudentBook.findOne({ studentId, bookId });
      if (existingRating) {
        return res.status(400).json({ 
          success: false, 
          message: "لقد قمت بتقييم هذا الكتاب مسبقاً" 
        });
      }

      const ratingData = {
        studentId,
        bookId,
        schoolCode: req.body.schoolCode,
        recommendBook: req.body.recommendBook,
        authorStyle: req.body.authorStyle,
        keyIdeas: req.body.keyIdeas,
        likedIdeas: req.body.likedIdeas,
        dislikedIdeas: req.body.dislikedIdeas,
        memorableQuotes: req.body.memorableQuotes,
        potentialAdditions: req.body.potentialAdditions,
        personalImpact: req.body.personalImpact,
        bookRating: req.body.bookRating,
        readingStartDate: req.body.readingStartDate,
        readingEndDate: req.body.readingEndDate
      };

      const newRating = new RateingStudentBook(ratingData);
      await newRating.save();

      res.status(201).json({
        success: true,
        message: "تم إضافة تقييم الكتاب بنجاح",
        data: newRating
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء إضافة تقييم الكتاب",
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

  // Get student's book rating
  static async getStudentBookRating(req, res) {
    try {
      const { studentId, bookId } = req.params;
      
      const rating = await RateingStudentBook.find({ studentId, bookId });
      
      if (!rating || rating.length === 0) {
        return res.status(404).json({
          success: false,
          message: "لم يتم العثور على تقييم لهذا الكتاب"
        });
      }

      res.status(200).json({
        success: true,
        message: "تم جلب تقييم الكتاب بنجاح",
        data: rating
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب تقييم الكتاب",
        error: error.message
      });
    }
  }

  // Get ratings by school code
  static async getRatingsBySchoolCode(req, res) {
    try {
      const { schoolCode } = req.params;
      const ratings = await RateingStudentBook.find({ schoolCode })
        .populate('studentId', 'name')
        .populate('bookId', 'title');

      res.status(200).json({
        message: 'Ratings retrieved successfully',
        ratings: ratings
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error retrieving ratings',
        error: error.message
      });
    }
  }

  // Get count of unique rated books by school code
  static async getUniqueRatedBooksCount(req, res) {
    try {
      const { schoolCode } = req.params;

      // Get unique bookIds for the school
      const uniqueBooks = await RateingStudentBook.distinct('bookId', { schoolCode });
      
      // Get detailed information about the books
      const booksWithDetails = await RateingStudentBook.find({
        schoolCode,
        bookId: { $in: uniqueBooks }
      })
      .populate('bookId', 'title author')
      .populate('studentId', 'name')
      .lean();

      // Create a map to store unique books with their details
      const uniqueBooksMap = new Map();
      booksWithDetails.forEach(rating => {
        if (!uniqueBooksMap.has(rating.bookId._id.toString())) {
          uniqueBooksMap.set(rating.bookId._id.toString(), {
            book: rating.bookId,
            readCount: 1,
            readers: [rating.studentId]
          });
        } else {
          const bookData = uniqueBooksMap.get(rating.bookId._id.toString());
          if (!bookData.readers.some(reader => reader._id.toString() === rating.studentId._id.toString())) {
            bookData.readCount++;
            bookData.readers.push(rating.studentId);
          }
        }
      });

      const result = {
        totalUniqueBooks: uniqueBooks.length,
        books: Array.from(uniqueBooksMap.values())
      };

      res.status(200).json({
        message: 'تم جلب عدد الكتب المقروءة بنجاح',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        message: 'حدث خطأ في جلب عدد الكتب المقروءة',
        error: error.message
      });
    }
  }

  // Get all ratings for a specific student with book and student details
  static async getStudentRatingsWithDetails(req, res) {
    try {
      const { studentId } = req.params;
      
      const ratings = await RateingStudentBook.find({ studentId })
        .populate('studentId', 'name') // Get student name
        .populate('bookId', 'title'); // Get book name
      
      if (!ratings || ratings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "لم يتم العثور على تقييمات لهذا الطالب"
        });
      }

      return res.status(200).json({
        success: true,
        data: ratings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب تقييمات الطالب",
        error: error.message
      });
    }
  }

  // Get all student ratings for a specific book with student details
  static async getBookStudentRatingsWithDetails(req, res) {
    try {
      const { bookId } = req.params;
      
      const ratings = await RateingStudentBook.find({ bookId })
        .populate('studentId', 'name') // Get student name
        .populate('bookId', 'title'); // Get book title
      
      if (!ratings || ratings.length === 0) {
        return res.status(404).json({
          success: false,
          message: "لم يتم العثور على تقييمات لهذا الكتاب"
        });
      }

      return res.status(200).json({
        success: true,
        data: ratings
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء جلب تقييمات الكتاب",
        error: error.message
      });
    }
  }
}

export default RateingStudentBookController;
