import Schoolmodel from "../../models/School.model.js";

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
    await Schoolmodel.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'تم حذف المدرسة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

