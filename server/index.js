const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('dev'));

// Database Connection
// Database Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
  });

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to db');
});

mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose connection is disconnected');
});

// Routes
const userRoutes = require('./routes/userRoutes');

app.use('/api/users', userRoutes);
const expertRequestRoutes = require('./routes/expertRequestRoutes');
app.use('/api/expert-requests', expertRequestRoutes);
const industryRoutes = require('./routes/industryRoutes');
app.use('/api/industries', industryRoutes);

const llmRoutes = require('./routes/llmRoutes');
app.use('/api/llms', llmRoutes);
const categoryRoutes = require('./routes/categoryRoutes');
app.use('/api/categories', categoryRoutes);

const templateRoutes = require('./routes/templateRoutes');
app.use('/api/templates', templateRoutes);

const toneRoutes = require('./routes/toneRoutes');
app.use('/api/tones', toneRoutes);

const outputFormatRoutes = require('./routes/outputFormatRoutes');
app.use('/api/output-formats', outputFormatRoutes);

const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

const ratingRoutes = require('./routes/ratingRoutes');
app.use('/api/ratings', ratingRoutes);

const userLibraryRoutes = require('./routes/userLibraryRoutes');
app.use('/api/user-library', userLibraryRoutes);

// Serve uploads from server/uploads (absolute path so it works when cwd is project root, e.g. PM2 on VPS)
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Serve React client static assets (built into client/dist or client/public)
const clientDistPath = path.join(__dirname, '../client/dist');
const clientPublicPath = path.join(__dirname, '../client/public');
const clientBuildPath = fs.existsSync(clientDistPath) ? clientDistPath : clientPublicPath;

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      const indexPath = path.join(clientBuildPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    res.status(404).send('Not Found');
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running... (Frontend build directory not found)');
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
