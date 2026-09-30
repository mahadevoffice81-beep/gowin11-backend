const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// Yeh line HTML files ko live karegi
app.use(express.static('.'));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB Connected Successfully!'))
        .catch((err) => console.error('MongoDB Connection Error:', err));
}

// User Schema (With Role for Admin Control)
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    walletBalance: { type: Number, default: 0 }
});
const User = mongoose.model('User', userSchema);

// Automatically Default Admin Create karne ke liye
const createAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ email: 'admin@gowin11.com' });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('123456', 10);
            const newAdmin = new User({
                username: 'SuperAdmin',
                email: 'admin@gowin11.com',
                password: hashedPassword,
                role: 'admin',
                walletBalance: 0
            });
            await newAdmin.save();
            console.log('Default Admin Created: admin@gowin11.com / 123456');
        }
    } catch (err) {
        console.log('Error creating admin:', err);
    }
};

// Login API
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all users
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Update Wallet Balance
app.post('/api/admin/update-wallet', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.walletBalance += Number(amount);
        await user.save();

        res.json({ message: `Wallet updated successfully! New Balance: ₹${user.walletBalance}`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await createAdmin();
});
