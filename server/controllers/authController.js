const User = require('../models/User');
const Student = require('../models/Student');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`[AUTH] Registration attempt for: ${email}`);
        console.log(`[AUTH] Using Database: ${require('mongoose').connection.name}`);
        console.log(`[AUTH] Request Body:`, req.body);

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({
            name,
            email,
            password,
        });

        console.log(`[AUTH] User document created in MongoDB: ${user._id}`);

        if (user) {
            // Initialize empty student profile for DB visibility
            await Student.create({
                user: user._id,
                skills: [],
                isMentor: false
            });
            console.log(`[AUTH] Student profile initialized for: ${user._id}`);

            const resData = {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            };
            console.log(`[AUTH] Registration successful for ${email}, sending data:`, resData);
            res.status(201).json(resData);
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id),
            });
        } else {
            console.log(`[AUTH] Login failed for: ${email}`);
            res.status(401).json({ message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};

// @desc    Get all users

// @route   GET /api/auth/users
// @access  Private/Admin (for now Public for user's convenience)
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

module.exports = {
    registerUser,
    authUser,
    getUsers,
};


