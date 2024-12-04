import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import fs from 'fs';
import Question from './models/Question.js';
import { exec } from 'child_process';
import path from 'path';
import User from './models/User.js';
import Submission from './models/Submission.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { env } from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import axios from 'axios';

// Fetch test case file from GitHub
async function fetchTestCasesFromGitHub(questionNumber) {
  const GITHUB_USERNAME = 'SrikariAmrutham'; // Replace with your GitHub username
  const GITHUB_REPO = 'TestCases';   // Replace with your repository name
  const TEST_CASES_PATH = `testCases/qno_${questionNumber}.txt`; // File path in the repo
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // GitHub token for private repos

  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPO}/contents/${TEST_CASES_PATH}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`, // For private repositories
        Accept: 'application/vnd.github.v3.raw', // Fetch raw content
      },
    });

    return response.data; 
  } catch (error) {
    console.error('Error fetching test cases from GitHub:', error.response?.data || error.message);
    throw new Error('Failed to fetch test cases');
  }
}

// Normalize line endings for comparison
function normalizeLineEndings(str) {
  return str
    .replace(/\r\n/g, '\n')  
    .replace(/\s+$/gm, '')   
    .trim();                 
}

// Parse test cases from the test case file
function parseTestCases(fileContent) {
  const testCases = [];
  const testCasePattern = /testcase=(\d+)\s*input:([\s\S]*?)\s*output:([\s\S]*?)\s*(?=testcase=\d+|$)/g;
  let match;

  while ((match = testCasePattern.exec(fileContent)) !== null) {
    const [, testcaseId, input, output] = match;
    testCases.push({
      input: input.trim(),
      expectedOutput: output.trim(),
    });
  }

  return testCases;
}

// Execute the code in a Docker container
function executeCode(language, input) {
  return new Promise(async (resolve) => {
    try {
      // Create a temporary input file for the test case
      const inputFilePath = path.join(__dirname, 'user-submissions', 'input.txt');
      await fs.promises.writeFile(inputFilePath, input);

      const codePath = path.resolve('user-submissions').replace(/\\/g, '/'); // Docker-compatible path
      const dockerCommand =
        language === 'java'
          ? `docker run -i --rm -v ${codePath}:/code openjdk:17 sh -c "cd /code && javac Main.java && java Main < input.txt"`
          : `docker run -i --rm -v ${codePath}:/code python:3 sh -c "cd /code && python Main.py < input.txt"`;

      console.log('Executing Docker command:', dockerCommand);

      exec(dockerCommand, (error, stdout, stderr) => {
        if (error || stderr) {
          console.error(`Docker execution error: ${stderr || error.message}`);
          return resolve({ error: stderr || error.message, output: null });
        }
        console.log('Docker execution output:', stdout);
        resolve({ error: null, output: stdout ? stdout.trim() : null });
      });
    } catch (err) {
      console.error('Error in executeCode:', err);
      resolve({ error: err.message, output: null });
    }
  });
}

// Main code submission handler
export const codeSubmissionHandler = async (req) => {
  console.log('Request body:', req.body);

  const { code, language, questionId, userId } = req.body;

  if (!code || !language || !questionId || !userId) {
    return { success: false, message: 'Missing required parameters' };
  }

  try {
    // Fetch the question details
    const question = await Question.findById(questionId);
    if (!question) {
      return { success: false, message: 'Question not found' };
    }

    // Store the submitted code in a temporary file
    const fileName = language === 'java' ? 'Main.java' : 'Main.py';
    const filePath = path.join(__dirname, 'user-submissions', fileName);
    await fs.promises.writeFile(filePath, code);

    // Read and parse the test cases
    const testCasesFileContent = await fetchTestCasesFromGitHub(question.qno);
    const testCases = parseTestCases(testCasesFileContent);
    console.log(testCases);

    // Execute the code for each test case
    const testResults = [];
    for (const testCase of testCases) {
      const { input, expectedOutput } = testCase;

      const result = await executeCode(language, input);
      console.log('Execution result:', result);

      const normalizedExpected = normalizeLineEndings(expectedOutput);
      const normalizedActual = normalizeLineEndings(result.output);
      
      console.log('Normalized Expected Output:', normalizedExpected);
      console.log('Normalized Actual Output:', normalizedActual);
      
      const passed = normalizedExpected === normalizedActual;
      console.log('Comparison Result:', passed ? 'pass' : 'fail');
      
      testResults.push({
        input,
        expected: normalizeLineEndings(expectedOutput),
        actual: normalizeLineEndings(result.output),
        result: passed ? 'pass' : 'fail',
        error: result.error || null,
      });
      console.log('Executing test case:');
      console.log('Input:', input);
      console.log('Expected Output:', normalizeLineEndings(expectedOutput));
      console.log('Actual Output:', normalizeLineEndings(result.output));


      console.log('Comparison Result:', passed ? 'pass' : 'fail');
    }

    // Check if all test cases passed
    const allPassed = testResults.every(tc => tc.result === 'pass');
    return { success: true, results: testResults, allPassed };
  } catch (err) {
    console.error('Error in codeSubmissionHandler:', err);
    return { success: false, message: 'Code execution failed', error: err.message };
  }
};
