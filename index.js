import express from 'express';
import connectDB from './db/connection.js';
import { appMethods } from './app.methods.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
connectDB();

// Apply app methods
appMethods(app, express);

