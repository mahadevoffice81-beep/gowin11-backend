const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

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
  walletBalance: { type: Number, default: 0 },
  role: { type: String, default: 'user' } // 'user' or 'admin'
});

const User = mongoose.model('User', userSchema);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'GoWin11 Backend & Admin Panel API Live!' });
});

// 1. REGISTER API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    let userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword, 
      role: role || 'user' 
    });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. LOGIN API (For both User & Admin)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, 'gowin11_secret_key', { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        walletBalance: user.walletBalance,
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === ADMIN PANEL APIs ===

// 3. GET ALL USERS (Admin Only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE USER WALLET BALANCE (Admin Control)
app.post('/api/admin/update-wallet', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.walletBalance += Number(amount);
    await user.save();

    res.json({ message: 'Wallet updated successfully!', newBalance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
