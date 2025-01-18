const express = require('express')
const morgan = require('morgan');
const connectDB = require('./DB/db')
const userRoutes = require('./routes/user.routes')
const projectRoutes = require('./routes/project.routes')
const aiRoutes =require('./routes/ai.routes')
const cookieParser = require('cookie-parser');
const cors = require('cors')
connectDB();
const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);

module.exports = app;