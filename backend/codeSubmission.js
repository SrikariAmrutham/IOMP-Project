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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Normalize line endings for comparison
function normalizeLineEndings(str) {
  return str
    .replace(/\r\n/g, '\n')  // Normalize Windows line endings to Unix
    .replace(/\s+$/gm, '')   // Remove trailing spaces on each line
    .trim();                 // Trim leading and trailing whitespace
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
function executeCode(fileName, language, input) {
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
    const testCasesFilePath = path.join(__dirname, 'test-cases', `${question.qno}.txt`);
    const testCasesFile = await fs.promises.readFile(testCasesFilePath, 'utf8');
    const testCases = parseTestCases(testCasesFile);

    // Execute the code for each test case
    const testResults = [];
    for (const testCase of testCases) {
      const { input, expectedOutput } = testCase;

      const result = await executeCode(fileName, language, input);
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


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// export const codeSubmissionHandler = async (req) => {
//   console.log('Request body:', req.body); // Log the request body for debugging

//   const { code, language, questionId, userId } = req.body;

//   if (!code || !language || !questionId || !userId) {
//     return { success: false, message: 'Missing required parameters' };
//   }

//   try {
//     // Fetch the question details
//     const question = await Question.findById(questionId);
//     if (!question) {
//       return { success: false, message: 'Question not found' };
//     }

//     // Store code in a temporary file for execution
//     const fileName = language === 'java' ? 'Main.java' : 'Main.py';
//     const filePath = `./user-submissions/${fileName}`;
//     await fs.promises.writeFile(filePath, code);
//     console.log('Path to code file:', filePath);

//     // Get the test cases from the corresponding file in the 'testcases' folder
//     const testCasesFilePath = path.join(__dirname, 'test-cases', `${question.qno}.txt`);
//     const testCasesFile = await fs.promises.readFile(testCasesFilePath, 'utf8');
    
//     // Parse test cases from the file
//     const testCases = parseTestCases(testCasesFile);
//     console.log('Test cases:', testCases);

//     // Execute the code for each test case and capture results
//     const testResults = [];
//     for (const testCase of testCases) {
//       const { input, expectedOutput } = testCase;

//       // Execute the submitted code with the test case input
//       const result = await executeCode(fileName, language, input);
//       console.log('Execution result:', result);
//       const passed = result.output.trim() == expectedOutput.trim(); // Compare with trimmed output
//       console.log('expected', expectedOutput.trim(), 'trimmed', result.output.trim());

//       testResults.push({
//         input,
//         expected: expectedOutput.trim(),
//         actual: result.output.trim(),
//         result: passed ? 'pass' : 'fail',
//         error: result.error || null,
//       });
//     }

//     // Check if all test cases passed
//     const allPassed = testResults.every(tc => tc.result === 'pass');

//     return { success: true, results: testResults, allPassed };
//   } catch (err) {
//     console.error('Error in codeSubmissionHandler:', err);
//     return { success: false, message: 'Code execution failed', error: err.message };
//   }
// };


// function executeCode(fileName, language, input) {
//   console.log('input', input);
//   return new Promise((resolve) => {
//     const codePath = path.resolve('user-submissions').replace(/\\/g, '/'); // Mount the parent directory
//     const dockerCommand =
//       language === 'java'
//         ? `echo ${input} | docker run -i --rm -v ${codePath}:/code openjdk:17 sh -c "cd /code && javac Main.java && java Main"`
//         : `echo ${input} | docker run -i --rm -v ${codePath}:/code python:3 sh -c "cd /code && python Main.py"`;
//     console.log(dockerCommand);
//     exec(dockerCommand, (error, stdout, stderr) => {
//       if (error || stderr) {
//         console.error(`Docker execution error: ${stderr || error.message}`);
//         return resolve({ error: stderr || error.message, output: null });
//       }
//       console.log(stdout);
//       resolve({ error: null, output: stdout ? stdout.trim() : null });
//     });
//   });
// }


// // Function to parse test cases from the file
// function parseTestCases(fileContent) {
//   const testCases = [];
//   const testCasePattern = /testcase=(\d+)\s*input:([\s\S]*?)\s*output:([\s\S]*?)\s*(?=testcase=\d+|$)/g;
//   let match;

//   while ((match = testCasePattern.exec(fileContent)) !== null) {
//     const [, testcaseId, input, output] = match;
//     testCases.push({
//       input: input.trim(),
//       expectedOutput: output.trim(),
//     });
//   }

//   return testCases;
// }


