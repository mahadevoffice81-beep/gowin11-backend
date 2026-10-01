const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

// MongoDB Connection String with the new password
const MONGO_URI = 'mongodb+srv://mahadevoffice81_db_user:4SAR3N7sitLuBoNn@cluster0.p7uzd.mongodb.net/?retryWrites=true&w=majority';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully! 🚀');
  })
  .catch((err) => {
    console.error('MongoDB Connection Error:', err);
  });

app.get('/', (req, res) => {
  res.send('Gowin11 Backend is running successfully! 🚀');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
