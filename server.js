const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

const MONGO_URI = 'mongodb+srv://mahadevoffice81_db_user:123456@cluster0.twhcpfl.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
  });

app.get('/', (req, res) => {
  res.send('Backend is running live on Render!');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
