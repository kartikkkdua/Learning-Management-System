const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const GradeCategory = require('../models/GradeCategory');

// Get all grade categories for a course
router.get('/course/:courseId', auth, async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const categories = await GradeCategory.find({ 
      course: courseId, 
      isActive: true 
    }).sort({ order: 1 });

    // Calculate total weight
    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);

    res.json({
      categories,
      totalWeight,
      isValidWeight: totalWeight === 100
    });
  } catch (error) {
    console.error('Error fetching grade categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new grade category
router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      description,
      course,
      weight,
      dropLowest,
      gradingScale,
      type,
      order
    } = req.body;

    // Check if total weight would exceed 100%
    const existingCategories = await GradeCategory.find({ 
      course, 
      isActive: true 
    });
    
    const currentTotalWeight = existingCategories.reduce((sum, cat) => sum + cat.weight, 0);
    
    if (currentTotalWeight + weight > 100) {
      return res.status(400).json({ 
        message: `Total weight cannot exceed 100%. Current total: ${currentTotalWeight}%` 
      });
    }

    const category = new GradeCategory({
      name,
      description,
      course,
      weight,
      dropLowest,
      gradingScale,
      type,
      order: order || existingCategories.length
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating grade category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a grade category
router.put('/:id', auth, async (req, res) => {
  try {
    const category = await GradeCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Grade category not found' });
    }

    // If weight is being updated, check total weight
    if (req.body.weight && req.body.weight !== category.weight) {
      const otherCategories = await GradeCategory.find({ 
        course: category.course, 
        isActive: true,
        _id: { $ne: req.params.id }
      });
      
      const otherTotalWeight = otherCategories.reduce((sum, cat) => sum + cat.weight, 0);
      
      if (otherTotalWeight + req.body.weight > 100) {
        return res.status(400).json({ 
          message: `Total weight cannot exceed 100%. Other categories total: ${otherTotalWeight}%` 
        });
      }
    }

    const updatedCategory = await GradeCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating grade category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a grade category
router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await GradeCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Grade category not found' });
    }

    // Soft delete by setting isActive to false
    await GradeCategory.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Grade category deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reorder grade categories
router.put('/reorder', auth, async (req, res) => {
  try {
    const { categoryOrders } = req.body; // Array of { id, order }

    const updatePromises = categoryOrders.map(({ id, order }) =>
      GradeCategory.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Categories reordered successfully' });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get default grade categories template
router.get('/templates', auth, (req, res) => {
  const templates = [
    {
      name: 'Standard Grading',
      categories: [
        { name: 'Assignments', type: 'assignments', weight: 40, dropLowest: 1 },
        { name: 'Exams', type: 'exams', weight: 40, dropLowest: 0 },
        { name: 'Participation', type: 'participation', weight: 20, dropLowest: 0 }
      ]
    },
    {
      name: 'Project-Based',
      categories: [
        { name: 'Projects', type: 'projects', weight: 60, dropLowest: 0 },
        { name: 'Quizzes', type: 'quizzes', weight: 25, dropLowest: 2 },
        { name: 'Participation', type: 'participation', weight: 15, dropLowest: 0 }
      ]
    },
    {
      name: 'Exam Heavy',
      categories: [
        { name: 'Midterm Exam', type: 'exams', weight: 30, dropLowest: 0 },
        { name: 'Final Exam', type: 'exams', weight: 40, dropLowest: 0 },
        { name: 'Assignments', type: 'assignments', weight: 20, dropLowest: 1 },
        { name: 'Participation', type: 'participation', weight: 10, dropLowest: 0 }
      ]
    }
  ];

  res.json(templates);
});

// Apply a template to a course
router.post('/apply-template', auth, async (req, res) => {
  try {
    const { courseId, templateName } = req.body;

    // Get template
    const templates = {
      'Standard Grading': [
        { name: 'Assignments', type: 'assignments', weight: 40, dropLowest: 1, order: 0 },
        { name: 'Exams', type: 'exams', weight: 40, dropLowest: 0, order: 1 },
        { name: 'Participation', type: 'participation', weight: 20, dropLowest: 0, order: 2 }
      ],
      'Project-Based': [
        { name: 'Projects', type: 'projects', weight: 60, dropLowest: 0, order: 0 },
        { name: 'Quizzes', type: 'quizzes', weight: 25, dropLowest: 2, order: 1 },
        { name: 'Participation', type: 'participation', weight: 15, dropLowest: 0, order: 2 }
      ],
      'Exam Heavy': [
        { name: 'Midterm Exam', type: 'exams', weight: 30, dropLowest: 0, order: 0 },
        { name: 'Final Exam', type: 'exams', weight: 40, dropLowest: 0, order: 1 },
        { name: 'Assignments', type: 'assignments', weight: 20, dropLowest: 1, order: 2 },
        { name: 'Participation', type: 'participation', weight: 10, dropLowest: 0, order: 3 }
      ]
    };

    const template = templates[templateName];
    if (!template) {
      return res.status(400).json({ message: 'Template not found' });
    }

    // Delete existing categories for this course
    await GradeCategory.updateMany(
      { course: courseId },
      { isActive: false }
    );

    // Create new categories from template
    const categories = template.map(cat => ({
      ...cat,
      course: courseId
    }));

    const createdCategories = await GradeCategory.insertMany(categories);

    res.json({
      message: 'Template applied successfully',
      categories: createdCategories
    });
  } catch (error) {
    console.error('Error applying template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;