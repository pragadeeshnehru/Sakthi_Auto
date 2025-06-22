const User = require('../models/User');
const Idea = require('../models/Idea');

const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, department, role } = req.query;
    
    const filter = { isActive: true };
    if (department) filter.department = department;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-__v')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: user.profile }
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Employee number or email already exists'
      });
    }
    
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating user'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: user.profile }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: user.profile }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const { type = 'individual' } = req.query;

    if (type === 'individual') {
      const leaderboard = await User.aggregate([
        { $match: { isActive: true } },
        {
          $lookup: {
            from: 'ideas',
            localField: '_id',
            foreignField: 'submittedBy',
            as: 'ideas'
          }
        },
        {
          $addFields: {
            totalIdeas: { $size: '$ideas' },
            approvedIdeas: {
              $size: {
                $filter: {
                  input: '$ideas',
                  cond: { $eq: ['$$this.status', 'approved'] }
                }
              }
            },
            implementedIdeas: {
              $size: {
                $filter: {
                  input: '$ideas',
                  cond: { $eq: ['$$this.status', 'implemented'] }
                }
              }
            },
            totalSavings: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$ideas',
                      cond: { $in: ['$$this.status', ['approved', 'implemented']] }
                    }
                  },
                  as: 'idea',
                  in: { $ifNull: ['$$idea.estimatedSavings', 0] }
                }
              }
            }
          }
        },
        {
          $addFields: {
            score: {
              $add: [
                { $multiply: ['$totalIdeas', 5] },
                { $multiply: ['$approvedIdeas', 10] },
                { $multiply: ['$implementedIdeas', 20] }
              ]
            }
          }
        },
        {
          $project: {
            name: 1,
            employeeNumber: 1,
            department: 1,
            designation: 1,
            totalIdeas: 1,
            approvedIdeas: 1,
            implementedIdeas: 1,
            totalSavings: 1,
            score: 1
          }
        },
        { $sort: { score: -1 } },
        { $limit: 50 }
      ]);

      res.json({
        success: true,
        data: { leaderboard }
      });

    } else if (type === 'department') {
      const departmentLeaderboard = await Idea.aggregate([
        {
          $group: {
            _id: '$department',
            totalIdeas: { $sum: 1 },
            approvedIdeas: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            implementedIdeas: {
              $sum: { $cond: [{ $eq: ['$status', 'implemented'] }, 1, 0] }
            },
            totalSavings: { $sum: '$estimatedSavings' }
          }
        },
        {
          $lookup: {
            from: 'users',
            let: { dept: '$_id' },
            pipeline: [
              { $match: { $expr: { $and: [{ $eq: ['$department', '$$dept'] }, { $eq: ['$isActive', true] }] } } },
              { $count: 'count' }
            ],
            as: 'employeeCount'
          }
        },
        {
          $addFields: {
            employeeCount: { $arrayElemAt: ['$employeeCount.count', 0] },
            avgIdeasPerEmployee: {
              $divide: ['$totalIdeas', { $ifNull: [{ $arrayElemAt: ['$employeeCount.count', 0] }, 1] }]
            }
          }
        },
        { $sort: { totalIdeas: -1 } }
      ]);

      res.json({
        success: true,
        data: { leaderboard: departmentLeaderboard }
      });
    }

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard'
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getLeaderboard
};