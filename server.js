const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// MongoDB Connection (Aapke Render environment variables se connect hoga)
const MONGO_URI = process.env.MONGO_URI || "Aapka_MongoDB_Atlas_URL"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected Successfully! 🚀'))
  .catch(err => console.log('MongoDB Connection Error: ', err));

// Simple User Schema for Login/Registration
const userSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Register / Login API Route
app.post('/api/login', async (req, res) => {
    try {
        const { mobile } = req.body;
        if (!mobile) return res.status(400).json({ error: 'Mobile number is required' });

        let user = await User.findOne({ mobile });
        if (!user) {
            user = new User({ mobile, balance: 100 }); // Free bonus on signup
            await user.save();
        }
        res.json({ success: true, message: 'Login successful', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
