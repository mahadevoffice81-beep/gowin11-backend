const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.static('.'));

const MONGO_URI = "mongodb+srv://mahadevoffice61_db_user:jbVHNT4PKmoEu@cluster0.p7uzd.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Connected Successfully!'))
    .catch((err) => console.error('MongoDB Connection Error:', err));

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
