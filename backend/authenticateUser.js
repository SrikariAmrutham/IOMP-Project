import jwt from 'jsonwebtoken';
import User from './models/User.js';

const authenticateUser = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from the Authorization header

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET); // Verify the token using your secret key
    const user = await User.findById(decoded.user._id); // Fetch the user from the database

    if (!user) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = user; // Attach the user information to the request object
    next(); // Pass control to the next middleware or route handler
  } catch (err) {
    console.error('Error in authenticateUser middleware:', err);
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authenticateUser;
