// Custom validation middleware using model validation

const validateCreateLink = (req, res, next) => {
  const { originalUrl, code } = req.body;
  const errors = [];

  // Check if URL is provided
  if (!originalUrl || originalUrl.trim() === '') {
    errors.push('URL is required');
  }

  // Validate custom code if provided
  if (code && code.trim() !== '') {
    if (!/^[A-Za-z0-9]{6,8}$/.test(code.trim())) {
      errors.push('Code must be 6-8 characters and contain only letters and numbers');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateCodeParam = (req, res, next) => {
  const { code } = req.params;
  const errors = [];

  if (!code) {
    errors.push('Code parameter is required');
  } else if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
    errors.push('Code must be 6-8 characters and contain only letters and numbers');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

module.exports = {
  validateCreateLink,
  validateCodeParam
};