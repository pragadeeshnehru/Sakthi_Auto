const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  login: Joi.object({
    employeeNumber: Joi.string().required(),
    otp: Joi.string().length(4).required()
  }),

  createIdea: Joi.object({
    title: Joi.string().max(200).required(),
    problem: Joi.string().max(2000).required(),
    improvement: Joi.string().max(2000).required(),
    benefit: Joi.string().valid('cost_saving', 'safety', 'quality', 'productivity').required(),
    estimatedSavings: Joi.number().min(0).optional(),
    department: Joi.string().valid('Engineering', 'Quality', 'Manufacturing', 'Management', 'Administration', 'HR', 'Finance').required(),
    tags: Joi.array().items(Joi.string()).optional()
  }),

  updateIdeaStatus: Joi.object({
    status: Joi.string().valid('under_review', 'approved', 'rejected', 'implementing', 'implemented').required(),
    reviewComments: Joi.string().max(1000).optional(),
    actualSavings: Joi.number().min(0).optional()
  }),

  createUser: Joi.object({
    employeeNumber: Joi.string().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    department: Joi.string().valid('Engineering', 'Quality', 'Manufacturing', 'Management', 'Administration', 'HR', 'Finance').required(),
    designation: Joi.string().required(),
    role: Joi.string().valid('employee', 'reviewer', 'admin').default('employee')
  })
};

module.exports = { validateRequest, schemas };