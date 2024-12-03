import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import queryString from 'query-string';
import Question from './models/Question.js';
import Submission from './models/Submission.js';
import User from './models/User.js';


import { codeSubmissionHandler } from './codeSubmission.js';
const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://127.0.0.1:27017/codingplatform', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(express.json());
app.use(cors({
  origin: [process.env.CLIENT_URL],
  credentials: true,
}));
app.use(cookieParser());

// OAuth and Token Config
const config = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authUrl: 'https://accounts.google.com/o/oauth2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  redirectUrl: process.env.REDIRECT_URL,
  tokenSecret: process.env.TOKEN_SECRET,
  tokenExpiration: process.env.TOKEN_EXPIRATION || '36000s', 
};

const authParams = queryString.stringify({
  client_id: config.clientId,
  redirect_uri: config.redirectUrl,
  response_type: 'code',
  scope: 'openid profile email',
  access_type: 'offline',
  state: 'standard_oauth',
  prompt: 'consent',
});

const getTokenParams = (code) => queryString.stringify({
  client_id: config.clientId,
  client_secret: config.clientSecret,
  code,
  grant_type: 'authorization_code',
  redirect_uri: config.redirectUrl,
});

// OAuth Routes
app.get('/auth/url', (_, res) => {
  res.json({ url: `${config.authUrl}?${authParams}` });
});

app.get('/auth/token', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ message: 'Authorization code must be provided' });

  try {
    const tokenParam = getTokenParams(code);
    const { data: { id_token } } = await axios.post(`${config.tokenUrl}?${tokenParam}`);

    if (!id_token) return res.status(400).json({ message: 'Auth error' });

    const { email, name, picture } = jwt.decode(id_token);
    const user = { name, email, picture };

    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      existingUser = new User(user);
      await existingUser.save();
    }

    const token = jwt.sign({ user: existingUser }, config.tokenSecret, { expiresIn: config.tokenExpiration });

    res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 10, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ user: existingUser });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// Signup Route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  const minLength = 8;
  const hasUppercase = /[A-Z]/;
  const hasLowercase = /[a-z]/;
  const hasNumber = /[0-9]/;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

  if (password.length < minLength) {
    return res.status(400).json({ message: `Password must be at least ${minLength} characters long` });
  }
  if (!hasUppercase.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one uppercase letter' });
  }
  if (!hasLowercase.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one lowercase letter' });
  }
  if (!hasNumber.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one number' });
  }
  if (!hasSpecialChar.test(password)) {
    return res.status(400).json({ message: 'Password must contain at least one special character' });
  }

  try {
    const existingUserMail = await User.findOne({ email });
    const existingUserName = await User.findOne({ name });
    if (existingUserMail || existingUserName) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });
    res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 10, httpOnly: true, secure: process.env.NODE_ENV === 'production' });

    res.json({ message: 'Login successful', user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

// Logged In Check
app.get('/auth/logged_in', (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) return res.json({ loggedIn: false });

    const { user } = jwt.verify(token, config.tokenSecret);
    const newToken = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });

    res.cookie('token', newToken, { maxAge: 1000 * 60 * 60 * 10, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ loggedIn: true, user });
  } catch (err) {
    res.json({ loggedIn: false });
  }
});

// Logout Route
app.post('/auth/logout', (_, res) => {
  res.clearCookie('token').json({ message: 'Logged out' });
});


const authenticateUser = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET); // Use the same secret as used during sign
    req.user = decoded.user; // Attach user information to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

// Question Routes
app.get('/questions', async (req, res) => {
  const { difficulty } = req.query;
  const filter = difficulty ? { difficulty } : {};

  try {
    const questions = await Question.find(filter);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching questions', error: err.message });
  }
});



//QuestionsDeatails Route
app.get('/questions/:id', async (req, res) => {
  const { id } = req.params; // Question ID is a route parameter
  const { userId, language } = req.query; // User ID and language are passed as query parameters

  console.log('params', id);
  console.log('userId', userId, language); // Check if userId and language are correctly passed

  try {
    // Fetch the question by ID
    const question = await Question.findById(id);
    if (!question) return res.status(404).json({ message: 'Question not found' });

    // Fetch the last saved code for the current user and question
    const submission = await Submission.findOne({ questionId: id, userId, language })
      .sort({ timestamp: -1 });

    console.log('submission', submission);
    // Send the response with the question and saved code
    res.json({ question, savedCode: submission ? submission.code : '' });
    
  } catch (err) {
    res.status(500).json({ message: 'Error fetching question', error: err.message });
  }
});

//Add questions
app.post('/questions', async (req, res) => {
  const { qno, qname, description, difficulty, images, constraints, examples, topics, testcases } = req.body;

  try {
    // Create a new question with the updated schema
    const newQuestion = new Question({
      qno,
      qname,
      description,
      difficulty,
      images,
      constraints,
      examples,
      topics,
      testcases
    });

    // Save the new question to the database
    await newQuestion.save();

    // Respond with a success message
    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (err) {
    // Handle any errors
    res.status(500).json({ message: 'Error adding question', error: err.message });
  }
});


// Mark question as solved with code and language
app.post('/questions/:id/solve', async (req, res) => {
  const { id } = req.params;
  const { code, language } = req.body;

  try {
    await Question.findByIdAndUpdate(id, {
      $set: { solved: true },
      $push: { solutions: { code, language } }
    });
    res.status(200).json({ message: 'Question marked as solved' });
  } catch (error) {
    console.error('Error marking question as solved:', error);
    res.status(500).json({ message: 'Failed to save solution' });
  }
});


//Submission route
app.post('/submit', async (req, res) => {
  const { code, language, questionId, userId } = req.body;

  try {
    // Check for existing submissions
    const existingSubmission = await Submission.findOne({ questionId, userId, language, code }).sort({ timestamp: -1 });

    if (existingSubmission) {
      console.log('Existing submission found for this user and question.');
      return res.json({ success: true, results: existingSubmission.testResults });
    }

    console.log('No previous submission, processing new submission.');

    // Call the updated codeSubmissionHandler
    const submissionResult = await codeSubmissionHandler(req);

    if (!submissionResult.success) {
      return res.status(500).json({ success: false, message: submissionResult.message });
    }

    const testResults = submissionResult.results;

    // Save the new submission
    const submission = new Submission({
      userId,
      questionId,
      code,
      language,
      testResults,
      solved: testResults.every(result => result.result === 'pass'),
    });
    await submission.save();

    // Respond with the evaluation results
    return res.json({ success: true, results: testResults });
  } catch (err) {
    console.error('Error during code submission:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});



//Autosaving
app.post('/autosave', async (req, res) => {
  const {userId, questionId, code, language } = req.body;

  try {
    // Check if there's an existing submission
    let submission = await Submission.findOne({ userId, questionId });

    if (submission) {
      // Update existing submission
      submission.code = code;
      submission.language = language;
      await submission.save();
    } else {
      // Create a new submission
      submission = new Submission({ userId, questionId, code, language });
      await submission.save();

      // Add submission to the user's record
      await User.findByIdAndUpdate(userId, { $push: { submissions: submission._id } });
    }

    res.status(200).json({ message: 'Code saved successfully', submission });
  } catch (error) {
    console.error('Error saving code:', error);
    res.status(500).json({ message: 'Failed to save code' });
  }
});

//Save to github
app.post('/save-to-github', async (req, res) => {
  const { code, questionTitle, questionDescription, userId, language } = req.body;
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = 'CodeClimb'; // Replace with your GitHub repo name
  const GITHUB_USERNAME = 'SrikariAmrutham'; // Replace with your GitHub username

  // Map the language to its file extension and comment style
  const languageToExtension = {
    javascript: { ext: 'js', comment: '//' },
    python: { ext: 'py', comment: '#' },
    cpp: { ext: 'cpp', comment: '//' },
    java: { ext: 'java', comment: '//' },
  };

  const { ext, comment } = languageToExtension[language] || { ext: 'txt', comment: '#' }; // Default to `.txt` and `#` for unknown languages
  const fileName = `${questionTitle.replace(/ /g, '_')}.${ext}`;
  const content = `
  ${comment} Question: ${questionTitle}
  ${comment} Description: ${questionDescription}
  
  ${code}
  `;

  try {
    const fileContentBase64 = Buffer.from(content).toString('base64');
    const response = await axios.put(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${fileName}`,
      {
        message: `Save code for question: ${questionTitle}`,
        content: fileContentBase64,
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    res.json({ success: true, message: 'Code saved to GitHub', url: response.data.content.html_url });
  } catch (error) {
    console.error('Error saving to GitHub:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to save to GitHub' });
  }
});

import ForumPost from './models/ForumPost.js';

// Get all forum posts
app.get('/forums', async (req, res) => {
  try {
    const posts = await ForumPost.find().populate('userId', 'name');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching forum posts', error: err.message });
  }
});

// Create a new forum post
app.post('/forums', async (req, res) => {
  const { title, description } = req.body;
  console.log('forums userid', req.user._id);

  try {
    const post = new ForumPost({ title, description, userId: req.user._id });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error creating forum post', error: err.message });
  }
});

// Add a comment to a forum post
app.post('/forums/:id/comments', authenticateUser, async (req, res) => {
  const { text } = req.body;
  const { id } = req.params;

  try {
    const post = await ForumPost.findById(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ text, userId: req.user._id });
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error adding comment', error: err.message });
  }
});
// Get all forum posts
app.get('/forums', async (req, res) => {
  try {
    const posts = await ForumPost.find().populate('userId', 'name'); // Populates user details
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching forum posts', error: err.message });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

