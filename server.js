const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files
app.use(express.static('.'));

// MongoDB Connection with Error Handling
const MONGO_URI = process.env.MONGO_URI || '';
if (MONGO_URI) {
    mongoose.connect(MONGO_URI)
        .then(() => console.log('MongoDB Connected Successfully!'))
        .catch((err) => console.error('MongoDB Connection Error:', err));
}

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    walletBalance: { type: Number, default: 0 }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Login API Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (email === 'admin@gowin11.com') {
            let adminUser = await User.findOne({ email });
            if (!adminUser) {
                adminUser = new User({
                    username: 'SuperAdmin',
                    email: 'admin@gowin11.com',
                    password: '123456',
                    role: 'admin',
                    walletBalance: 0
                });
                await adminUser.save();
            }
            return res.json({ message: 'Login successful', user: adminUser });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        res.json({ message: 'Login successful', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Users Route
app.get('/api/admin/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Wallet Route
app.post('/api/admin/update-wallet', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.walletBalance += Number(amount);
        await user.save();

        res.json({ message: `Wallet updated successfully! New Balance: ₹${user.walletBalance}`, user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
