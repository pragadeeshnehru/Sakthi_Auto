const Idea = require('../models/Idea');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createIdea = async (req, res) => {
  try {
    const ideaData = {
      ...req.body,
      submittedBy: req.user._id,
      submittedByEmployeeNumber: req.user.employeeNumber
    };

    const idea = new Idea(ideaData);
    await idea.save();

    // Populate the submittedBy field
    await idea.populate('submittedBy', 'name employeeNumber department');

    // Create notification for admins/reviewers
    const adminsAndReviewers = await User.find({ 
      role: { $in: ['admin', 'reviewer'] }, 
      isActive: true 
    });

    const notifications = adminsAndReviewers.map(user => ({
      recipient: user._id,
      recipientEmployeeNumber: user.employeeNumber,
      type: 'idea_submitted',
      title: 'New Idea Submitted',
      message: `${req.user.name} submitted a new idea: "${idea.title}"`,
      relatedIdea: idea._id
    }));

    await Notification.insertMany(notifications);

    res.status(201).json({
      success: true,
      message: 'Idea submitted successfully',
      data: { idea }
    });

  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating idea'
    });
  }
};

const getIdeas = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      department, 
      benefit, 
      submittedBy,
      search 
    } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (department) filter.department = department;
    if (benefit) filter.benefit = benefit;
    if (submittedBy) filter.submittedByEmployeeNumber = submittedBy;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { problem: { $regex: search, $options: 'i' } },
        { improvement: { $regex: search, $options: 'i' } }
      ];
    }

    const ideas = await Idea.find(filter)
      .populate('submittedBy', 'name employeeNumber department designation')
      .populate('reviewedBy', 'name employeeNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Idea.countDocuments(filter);

    res.json({
      success: true,
      data: {
        ideas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ideas'
    });
  }
};

const getMyIdeas = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { submittedBy: req.user._id };
    if (status) filter.status = status;

    const ideas = await Idea.find(filter)
      .populate('reviewedBy', 'name employeeNumber')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Idea.countDocuments(filter);

    res.json({
      success: true,
      data: {
        ideas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get my ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your ideas'
    });
  }
};

const getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate('submittedBy', 'name employeeNumber department designation')
      .populate('reviewedBy', 'name employeeNumber');

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    res.json({
      success: true,
      data: { idea }
    });

  } catch (error) {
    console.error('Get idea by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching idea'
    });
  }
};

const updateIdeaStatus = async (req, res) => {
  try {
    const { status, reviewComments, actualSavings } = req.body;
    
    const idea = await Idea.findById(req.params.id);
    
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: 'Idea not found'
      });
    }

    // Update idea
    idea.status = status;
    idea.reviewedBy = req.user._id;
    idea.reviewedAt = new Date();
    
    if (reviewComments) idea.reviewComments = reviewComments;
    if (actualSavings) idea.actualSavings = actualSavings;
    if (status === 'implemented') idea.implementationDate = new Date();

    await idea.save();
    await idea.populate('submittedBy', 'name employeeNumber');

    // Create notification for idea submitter
    const notification = new Notification({
      recipient: idea.submittedBy._id,
      recipientEmployeeNumber: idea.submittedBy.employeeNumber,
      type: `idea_${status}`,
      title: `Idea ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your idea "${idea.title}" has been ${status}`,
      relatedIdea: idea._id
    });

    await notification.save();

    res.json({
      success: true,
      message: 'Idea status updated successfully',
      data: { idea }
    });

  } catch (error) {
    console.error('Update idea status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating idea status'
    });
  }
};

const getIdeaStats = async (req, res) => {
  try {
    const stats = await Idea.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalSavings: { $sum: '$estimatedSavings' }
        }
      }
    ]);

    const departmentStats = await Idea.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
          totalSavings: { $sum: '$estimatedSavings' }
        }
      }
    ]);

    const benefitStats = await Idea.aggregate([
      {
        $group: {
          _id: '$benefit',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        statusStats: stats,
        departmentStats,
        benefitStats
      }
    });

  } catch (error) {
    console.error('Get idea stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching statistics'
    });
  }
};

module.exports = {
  createIdea,
  getIdeas,
  getMyIdeas,
  getIdeaById,
  updateIdeaStatus,
  getIdeaStats
};