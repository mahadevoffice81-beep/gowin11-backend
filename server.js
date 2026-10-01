const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve public frontend
app.use(express.static(path.join(__dirname, 'public')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
