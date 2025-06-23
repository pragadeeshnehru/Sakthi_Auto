const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const login = async (req, res) => {
  try {
    const { employeeNumber, otp } = req.body;
    
    // Simple OTP validation (in production, use proper OTP service)
    if (otp !== '1234') {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Find user by employee number
    const user = await User.findOne({ employeeNumber, isActive: true });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid employee number'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.profile
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user.profile
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const logout = async (req, res) => {
  try {
    // In a real app, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

module.exports = {
  login,
  getProfile,
  logout
};