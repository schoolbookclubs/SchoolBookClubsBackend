import RateingStudentBook from "../../../models/RateingStudentBook.js";

class RateingStudentBookController {
  // Create a new book rating
  static async createBookRating(req, res) {
    try {
      const ratingData = {
        studentId: req.body.studentId,
        bookId: req.body.bookId,
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

      // Validate reading dates
      if (new Date(ratingData.readingStartDate) > new Date(ratingData.readingEndDate)) {
        return res.status(400).json({
          message: 'Reading start date must be before or equal to reading end date'
        });
      }

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
}

export default RateingStudentBookController;
