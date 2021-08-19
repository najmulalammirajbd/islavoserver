import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import morgan from 'morgan';
import colors from 'colors';
import userRoutes from './routes/userRoutes.js';
import paymentRoutes from './routes/userRoutes.js';
import bodyParser from 'body-parser';
import cors from 'cors';

dotenv.config();

connectDB();

const app = express();

app.use(bodyParser.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use('/api/users', userRoutes);

if (process.env.NODE_ENV === 'production') {
  //production data
} else {
  app.get('/', (req, res) => {
    res.send('Api is running');
  });
}

// app.use(notFound);
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${process.env.PORT}`
      .yellow.bold
  )
);
