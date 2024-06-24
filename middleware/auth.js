const jwt = require('jsonwebtoken');

// Middleware function to verify JWT token
const verifyToken = (req, res, next) => {
  const tokenValue = req.headers['authorization']; // Assuming token is sent in the Authorization header
  const token = tokenValue.split(' ')[1]
  if (!tokenValue) {
    return res.status(401).json({ message: 'Authorization token not provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user information to request object
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token or unauthorized.' });
  }
};

module.exports = { verifyToken };
