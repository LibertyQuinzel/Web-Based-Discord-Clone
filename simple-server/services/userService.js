const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user storage (replace with database later)
const users = [];

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// Verify password
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Register new user
const registerUser = async (userData) => {
  const { username, email, password } = userData;

  // Check if user already exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const newUser = {
    id: Date.now().toString(), // Simple ID generation
    username,
    email,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  // Generate token
  const token = generateToken(newUser);

  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  
  return {
    user: userWithoutPassword,
    token
  };
};

// Login user
const loginUser = async (loginData) => {
  const { email, password } = loginData;

  // Find user
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    token
  };
};

// Get user by ID
const getUserById = (id) => {
  const user = users.find(u => u.id === id);
  if (!user) {
    return null;
  }
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Get all users (for development)
const getAllUsers = () => {
  return users.map(({ password, ...user }) => user);
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getAllUsers
};
