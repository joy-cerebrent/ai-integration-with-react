import bcrypt from 'bcrypt';
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../utils/jwtUtils.js';

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };

    return res.status(201).json({
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    console.error("Error registering user:", error);

    return res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = { id: user._id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again later.' });
  }
};

export const validateToken = (req, res) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization token is missing or malformed.' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);

    return res.status(200).json({
      message: 'Token is valid.',
      user: {
        id: decoded.id,
        email: decoded.email,
      },
    });
  } catch (error) {
    console.error('Token validation error:', error.message);

    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error.message);

    return res.status(500).json({ message: 'Something went wrong during logout.' });
  }
};
