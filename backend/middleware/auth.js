const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const authorizeExtensionOfficer = (req, res, next) => {
  if (req.user.role !== 'extension_officer') {
    return res.status(403).json({ error: 'Extension Officer access required' });
  }
  next();
};

const authorizeFarmer = (req, res, next) => {
  if (req.user.role !== 'farmer') {
    return res.status(403).json({ error: 'Farmer access required' });
  }
  next();
};

// Generic authorize function that accepts an array of roles
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Alias for authenticateToken
const authenticate = authenticateToken;

module.exports = { 
  authenticateToken, 
  authenticate,
  authorizeAdmin, 
  authorizeExtensionOfficer, 
  authorizeFarmer,
  authorize
};
