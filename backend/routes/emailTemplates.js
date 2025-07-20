const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const EmailTemplate = require('../models/EmailTemplate');

// Get all templates
router.get('/', auth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const templates = await EmailTemplate.find(query)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new template
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const templateData = {
      ...req.body,
      createdBy: req.user.id
    };

    const template = new EmailTemplate(templateData);
    await template.save();

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get template by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id)
      .populate('createdBy', 'username email');

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update template
router.put('/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if user owns the template or is admin
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow editing system templates unless admin
    if (template.isSystem && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot edit system templates' });
    }

    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete template
router.delete('/:id', auth, async (req, res) => {
  try {
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    // Check if user owns the template or is admin
    if (template.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Don't allow deleting system templates
    if (template.isSystem) {
      return res.status(403).json({ message: 'Cannot delete system templates' });
    }

    await EmailTemplate.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Duplicate template
router.post('/:id/duplicate', auth, async (req, res) => {
  try {
    const originalTemplate = await EmailTemplate.findById(req.params.id);

    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const duplicatedTemplate = new EmailTemplate({
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      category: originalTemplate.category,
      subject: originalTemplate.subject,
      content: originalTemplate.content,
      htmlContent: originalTemplate.htmlContent,
      variables: originalTemplate.variables,
      design: originalTemplate.design,
      createdBy: req.user.id,
      isSystem: false
    });

    await duplicatedTemplate.save();
    res.status(201).json(duplicatedTemplate);
  } catch (error) {
    console.error('Error duplicating template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Preview template with variables
router.post('/:id/preview', auth, async (req, res) => {
  try {
    const { variables = {} } = req.body;
    const template = await EmailTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    let processedSubject = template.subject;
    let processedContent = template.content;

    // Replace variables in subject and content
    Object.keys(variables).forEach(key => {
      const placeholder = new RegExp(`\\[${key.toUpperCase()}\\]`, 'g');
      processedSubject = processedSubject.replace(placeholder, variables[key] || '');
      processedContent = processedContent.replace(placeholder, variables[key] || '');
    });

    res.json({
      subject: processedSubject,
      content: processedContent,
      originalTemplate: template
    });
  } catch (error) {
    console.error('Error previewing template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get template categories
router.get('/meta/categories', auth, (req, res) => {
  const categories = [
    { value: 'welcome', label: 'Welcome' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'system', label: 'System' },
    { value: 'custom', label: 'Custom' }
  ];

  res.json(categories);
});

// Get template variables suggestions
router.get('/meta/variables', auth, (req, res) => {
  const variables = [
    { name: 'NAME', description: 'Recipient name', example: 'John Doe' },
    { name: 'EMAIL', description: 'Recipient email', example: 'john@example.com' },
    { name: 'COURSE_NAME', description: 'Course name', example: 'Introduction to Computer Science' },
    { name: 'ASSIGNMENT_TITLE', description: 'Assignment title', example: 'Homework 1' },
    { name: 'DUE_DATE', description: 'Assignment due date', example: 'March 15, 2024' },
    { name: 'INSTRUCTOR_NAME', description: 'Instructor name', example: 'Dr. Smith' },
    { name: 'GRADE', description: 'Student grade', example: '85/100' },
    { name: 'PLATFORM_NAME', description: 'Platform name', example: 'LMS Platform' },
    { name: 'LOGIN_URL', description: 'Login URL', example: 'https://lms.example.com/login' }
  ];

  res.json(variables);
});

module.exports = router;