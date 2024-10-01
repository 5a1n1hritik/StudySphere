const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');


dotenv.config();
connectDB();  // Connect to MongoDB

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/users', require('./routes/auth'));  // User routes
app.use('/api/courses', require('./routes/coursesR'));  // Course routes
app.use('/api/questions', require('./routes/questionRoutes'));  // question routes
app.use('/api/Material', require('./routes/studymaterialroutes'));  // Study Material routes

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
