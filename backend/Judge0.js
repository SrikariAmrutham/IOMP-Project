// import axios from 'axios';
// import Question from './models/Question.js';

// export const codeSubmissionHandler = async (req, res) => {
//   const { code, language, qname } = req.body;

//   try {
//     // Fetch question details and test cases from the DB
//     const question = await Question.findOne({ qname });
//     console.log('Question name is ', qname);
//     if (!question) {
//       return res.status(404).json({ success: false, message: 'Question not found' });
//     }

//     const testCases = question.testcases;
//     const testResults = await Promise.all(
//       testCases.slice(0, 1).map(async (tc) => {
//         console.log('Running');
//         const output = await runCodeInJudge0(code, language, tc.input);
//         console.log('output is ', output);
//         return {
//           testCase: tc,
//           result: output.trim() === tc.output ? 'pass' : 'fail',
//           expected: tc.output,
//           actual: output.trim(),
//         };
//       })
//     );

//     res.json({ success: true, results: testResults });
//   } catch (error) {
//     console.error('Error in code evaluation:', error);
//     res.status(500).json({ success: false, message: 'Code evaluation failed' });
//   }
// };

// async function runCodeInJudge0(userCode, language, input) {
//     // Language mappings for Judge0 API
//     const languageMappings = {
//       java: 62,   // Java (OpenJDK 13.0.1)
//       python: 71, // Python (3.8.1)
//     };
  
//     const languageId = languageMappings[language];
//     if (!languageId) throw new Error(`Unsupported language: ${language}`);
  
//     const submissionPayload = {
//       source_code: userCode,
//       language_id: languageId,
//       stdin: input,
//     };


//   try {
//     const submissionResponse = await axios.post('https://judge029.p.rapidapi.com/submissions', submissionPayload, {
//       headers: {
//         'Content-Type': 'application/json',
//         'X-RapidAPI-Key': '862cf69d90msh4282c9396d6f383p1035d1jsneeb5c8322703', // Replace with your RapidAPI Key
//       },
//     });

//     const token = submissionResponse.data.token;

//     // Poll Judge0 for result (it may take a few seconds to process)
//     let result;
//     while (true) {
//       const response = await axios.get(`https://judge029.p.rapidapi.com/submissions/${token}`, {
//         headers: {
//           'X-RapidAPI-Key': '862cf69d90msh4282c9396d6f383p1035d1jsneeb5c8322703', // Replace with your RapidAPI Key
//         },
//       });
//       result = response.data;
//       console.log('Result status is ', result.status.id);
//       if (result.status.id >= 3) break; // Status >= 3 means completed
//       await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 sec before retrying
//     }

//     if (result.status.id !== 3) throw new Error(`Execution error: ${result.status.description}`);

//     return result.stdout || result.stderr || ''; // Return stdout or error message
//   } catch (error) {
//     console.error('Judge0 API error:', error);
//     throw new Error('Code execution failed');
//   }
// }



import axios from 'axios';
import Question from './models/Question.js';

export const codeSubmissionHandler = async (req, res) => {
  const { code, language, qname } = req.body;

  try {
    // Fetch question details and test cases from the DB
    const question = await Question.findOne({ qname });
    console.log('Question name is ', qname);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const testCases = question.testcases;
    const testResults = await Promise.all(
      testCases.slice(0, 1).map(async (tc) => {
        console.log('Running');
        const output = await runCodeInJudge0(code, language, tc.input);
        console.log('output is ', output);
        return {
          testCase: tc,
          result: output.trim() === tc.output ? 'pass' : 'fail',
          expected: tc.output,
          actual: output.trim(),
        };
      })
    );

    res.json({ success: true, results: testResults });
  } catch (error) {
    console.error('Error in code evaluation:', error);
    res.status(500).json({ success: false, message: 'Code evaluation failed' });
  }
};

async function runCodeInJudge0(userCode, language, input) {
    // Language mappings for Judge0 API
    const languageMappings = {
      java: 62,   // Java (OpenJDK 13.0.1)
      python: 71, // Python (3.8.1)
    };
  
    const languageId = languageMappings[language];
    if (!languageId) throw new Error(`Unsupported language: ${language}`);
  
    const submissionPayload = {
        source_code: `
      def generate(numRows):
       triangle = []
       for i in range(numRows):
           row = [1] * (i + 1)
           for j in range(1, i):
               row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j]
           triangle.append(row)
       return triangle
      
      if __name__ == "__main__":
       print(generate(5))
        `,
        language_id: 71, // Python 3
        stdin: "5", // The number of rows to generate
        expected_output: "[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]\n"
      };


  try {
    const submissionResponse = await axios.post('https://judge029.p.rapidapi.com/submissions', submissionPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': '862cf69d90msh4282c9396d6f383p1035d1jsneeb5c8322703', // Replace with your RapidAPI Key
      },
    });

    const token = submissionResponse.data.token;

    // Poll Judge0 for result (it may take a few seconds to process)
    let result;
    while (true) {
      const response = await axios.get(`https://judge029.p.rapidapi.com/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Key': '862cf69d90msh4282c9396d6f383p1035d1jsneeb5c8322703', // Replace with your RapidAPI Key
        },
      });
      result = response.data;
      console.log('Result status is ', result.status.id);
      if (result.status.id >= 3) break; // Status >= 3 means completed
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 sec before retrying
    }

    if (result.status.id !== 3) throw new Error(`Execution error: ${result.status.description}`);

    return result.stdout || result.stderr || ''; // Return stdout or error message
  } catch (error) {
    console.error('Judge0 API error:', error);
    throw new Error('Code execution failed');
  }
}

// import axios from 'axios';

// async function runCode() {
//   // Define test cases with different inputs and expected outputs
//   const testCases = [
//     { input: "5", expected_output: "[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]\n" },
    
//     // Add more test cases as needed
//   ];

//   const results = [];

//   for (const testCase of testCases) {
//     const submissionPayload = {
//         source_code: `
//       def generate(numRows):
//        triangle = []
//        for i in range(numRows):
//            row = [1] * (i + 1)
//            for j in range(1, i):
//                row[j] = triangle[i - 1][j - 1] + triangle[i - 1][j]
//            triangle.append(row)
//        return triangle
      
//       if __name__ == "__main__":
//        print(generate(5))
//         `,
//         language_id: 71, // Python 3
//         stdin: "5", // The number of rows to generate
//         expected_output: "[[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]\n"
//       };
      

//     try {
//       // Submit the code to Judge0 for each test case
//       const submissionResponse = await axios.post('https://judge029.p.rapidapi.com/submissions', submissionPayload, {
//         headers: {
//           'Content-Type': 'application/json',
//           'X-RapidAPI-Key': '862cf69d90msh4282c9396d6f383p1035d1jsneeb5c8322703' // Replace with your RapidAPI Key
//         },
//       });

//       const token = submissionResponse.data.token;

//       // Poll for result
//       let result;
//       while (true) {
//         const response = await axios.get(`https://judge029.p.rapidapi.com/submissions/${token}`, {
//           headers: {
//             'X-RapidAPI-Key': '862cf69d90msh4282c9396d6f383p1035d1jsneeb5c8322703',
//           },
//         });
//         result = response.data;
//         if (result.status.id >= 3) break; // Status >= 3 means completed
//         await new Promise((resolve) => setTimeout(resolve, 1000));
//       }

//       // Check result and store it
//       const isPassed = result.stdout && result.stdout.trim() === testCase.expected_output.trim();
//       results.push({
//         input: testCase.input,
//         expected: testCase.expected_output,
//         actual: result.stdout ? result.stdout.trim() : result.stdout,
//         status: isPassed ? "Passed" : "Failed",
//       });
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   }

//   console.log("Test Results:", results);
// }

// runCode();
