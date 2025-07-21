import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  List as ListIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const RubricManager = ({ courseId }) => {
  const [rubrics, setRubrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingRubric, setEditingRubric] = useState(null);
  const [expandedRubric, setExpandedRubric] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    criteria: []
  });

  useEffect(() => {
    if (courseId) {
      fetchRubrics();
    }
  }, [courseId]);

  const fetchRubrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/rubrics/course/${courseId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRubrics(data);
      }
    } catch (error) {
      console.error('Error fetching rubrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Implementation for saving rubric
    console.log('Save rubric:', formData);
    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', criteria: [] });
    setEditingRubric(null);
  };

  const handleEdit = (rubric) => {
    setEditingRubric(rubric);
    setFormData({
      name: rubric.name,
      description: rubric.description || '',
      criteria: rubric.criteria || []
    });
    setShowDialog(true);
  };

  const handleDelete = async (rubricId) => {
    if (window.confirm('Are you sure you want to delete this rubric?')) {
      // Implementation for deleting rubric
      console.log('Delete rubric:', rubricId);
    }
  };

  const addCriterion = () => {
    setFormData({
      ...formData,
      criteria: [
        ...formData.criteria,
        {
          name: '',
          description: '',
          maxPoints: 0,
          levels: [
            { name: 'Excellent', points: 0, description: '' },
            { name: 'Good', points: 0, description: '' },
            { name: 'Fair', points: 0, description: '' },
            { name: 'Poor', points: 0, description: '' }
          ]
        }
      ]
    });
  };

  const updateCriterion = (index, field, value) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index] = { ...newCriteria[index], [field]: value };
    setFormData({ ...formData, criteria: newCriteria });
  };

  const removeCriterion = (index) => {
    const newCriteria = formData.criteria.filter((_, i) => i !== index);
    setFormData({ ...formData, criteria: newCriteria });
  };

  const calculateTotalPoints = (criteria) => {
    return criteria.reduce((sum, criterion) => sum + (criterion.maxPoints || 0), 0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ListIcon />
          Rubric Manager
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowDialog(true)}
        >
          Create Rubric
        </Button>
      </Box>

      <Grid container spacing={3}>
        {rubrics.map((rubric) => (
          <Grid item xs={12} key={rubric._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {rubric.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {rubric.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`${calculateTotalPoints(rubric.criteria)} points`} 
                        color="primary" 
                        size="small" 
                      />
                      <Chip 
                        label={`${rubric.criteria?.length || 0} criteria`} 
                        color="secondary" 
                        size="small" 
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => setExpandedRubric(expandedRubric === rubric._id ? null : rubric._id)}
                    >
                      {expandedRubric === rubric._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(rubric)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(rubric._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                {expandedRubric === rubric._id && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" gutterBottom>
                      Criteria Details
                    </Typography>
                    {rubric.criteria?.map((criterion, index) => (
                      <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          {criterion.name} ({criterion.maxPoints} points)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {criterion.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {criterion.levels?.map((level, levelIndex) => (
                            <Chip
                              key={levelIndex}
                              label={`${level.name}: ${level.points}pts`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}

        {rubrics.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <ListIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Rubrics Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create your first rubric to start standardized grading.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRubric ? 'Edit Rubric' : 'Create New Rubric'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Rubric Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />

            <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Criteria ({formData.criteria.length})
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={addCriterion}
              >
                Add Criterion
              </Button>
            </Box>

            {formData.criteria.map((criterion, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2">
                    Criterion {index + 1}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => removeCriterion(index)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Criterion Name"
                      value={criterion.name}
                      onChange={(e) => updateCriterion(index, 'name', e.target.value)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Max Points"
                      type="number"
                      value={criterion.maxPoints}
                      onChange={(e) => updateCriterion(index, 'maxPoints', parseInt(e.target.value) || 0)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={criterion.description}
                      onChange={(e) => updateCriterion(index, 'description', e.target.value)}
                      size="small"
                      multiline
                      rows={2}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}

            {formData.criteria.length > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Total Points: {calculateTotalPoints(formData.criteria)}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingRubric ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RubricManager;