import Bookmodel from "../../models/book.model.js";
import Parentmodel from "../../models/parent.model.js";
import ParentAssessment from "../../models/ParentAssessment.js";
import ParentToken from "../../models/parentToken.model.js";
import RateingStudentBook from "../../models/RateingStudentBook.js";
import Schoolmodel from "../../models/School.model.js";
import StudentModel from "../../models/Student.model.js";
import StudentTokenModel from "../../models/StudentToken.model.js";
import Supervisormodel from "../../models/Supervisor.model.js";
import SupervisorTokenModel from "../../models/SupervisorToken.model.js";
import Teachermodel from "../../models/Teacher.model.js";
import TeacherTokenModel from "../../models/TeacherToken.model.js";
import RateTeacherForStudent from '../../models/RateTeacherForStudent.model.js';
import ReadingClubEvaluation from "../../models/ReadingClubEvaluation.model.js";
import StudentSelfAssessment from "../../models/StudentSelfAssessment.js";

// Add a new school
export const addSchool = async (req, res) => {
  try {
    const { name, code } = req.body;

    // Check if school name exists
    const existingSchoolName = await Schoolmodel.findOne({ name });
    if (existingSchoolName) {
      return res.status(400).json({ 
        success: false, 
        message: 'هذا الاسم موجود بالفعل' 
      });
    }

    // Check if school code exists
    const existingSchoolCode = await Schoolmodel.findOne({ code });
    if (existingSchoolCode) {
      return res.status(400).json({ 
        success: false, 
        message: 'هذا الكود موجود بالفعل' 
      });
    }

    const school = await Schoolmodel.create({ name, code });
    res.status(201).json({ 
      success: true, 
      data: school, 
      message: 'تم اضافة المدرسة بنجاح' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all schools
export const getSchools = async (req, res) => {
  try {
    const schools = await Schoolmodel.find();
    res.status(200).json({ success: true, data: schools });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single school
export const getSchool = async (req, res) => {
  try {
    const school = await Schoolmodel.findById(req.params.id);
    res.status(200).json({ success: true, data: school , message: 'تم العثور على المدرسة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a school
export const updateSchool = async (req, res) => {
  try {
    const school = await Schoolmodel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, data: school , message: 'تم تحديث المدرسة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a school
export const deleteSchool = async (req, res) => {
  try {
    const school = await Schoolmodel.findById(req.params.id);
    if (!school) {
      return res.status(404).json({ success: false, message: 'المدرسة غير موجودة' });
    }

    // Delete all students with matching school code
    await StudentModel.deleteMany({ schoolCode: school.code });
    await StudentTokenModel.deleteMany({ schoolCode: school.code });
    await Parentmodel.deleteMany({ schoolCode: school.code });
    await Teachermodel.deleteMany({ schoolCode: school.code });
    await Supervisormodel.deleteMany({ schoolCode: school.code });
    await ParentToken.deleteMany({ schoolCode: school.code });
    await TeacherTokenModel.deleteMany({ schoolCode: school.code });
    await SupervisorTokenModel.deleteMany({ schoolCode: school.code });
    await Bookmodel.deleteMany({ schoolCode: school.code });
    await ParentAssessment.deleteMany({ schoolCode: school.code });
    await RateingStudentBook.deleteMany({ schoolCode: school.code });
    await RateTeacherForStudent.deleteMany({ schoolCode: school.code });
    await ReadingClubEvaluation.deleteMany({ schoolCode: school.code });
    await StudentSelfAssessment.deleteMany({ schoolCode: school.code });
 
    await Schoolmodel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'تم حذف المدرسة وجميع البيانات المرتبطة بها بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
