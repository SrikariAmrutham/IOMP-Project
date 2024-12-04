import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Styles.css';
import { Editor } from '@monaco-editor/react';
import { useUser } from '../UserContext';

const QuestionDetails = () => {
  const { user } = useUser();
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [testResults, setTestResults] = useState(null);
  const [error, setError] = useState(null); 
  const [visualizerEnabled, setVisualizerEnabled] = useState(false); // State for Visualizer button visibility
  
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (code.trim()) {
        axios.post('http://localhost:5000/autosave', {
          userId: user.id,
          questionId: id,
          code,
          language,
        })
        .then(response => console.log('Code autosaved:', response.data))
        .catch(error => console.error('Autosave error:', error));
      }
    }, 50000);
  
    return () => clearInterval(autosaveInterval);
  }, [code, language, question]);
  
  useEffect(() => {
    if (!user || !user.id) {
      setError('Please log in to view the question');
      setLoading(false);
      return;
    }
    axios.get(`http://localhost:5000/questions/${id}`, {
      params: { userId: user.id, language }
    })
    .then((response) => {
      setQuestion(response.data.question);
      setCode(response.data.savedCode || '');
      setLoading(false);

      if (response.data.submission?.solved) {
        setVisualizerEnabled(true); // Enable visualizer if solved
        setTestResults(response.data.submission.testResults); // Load previous test results
      }
  
    })
    .catch((error) => {
      console.error('Error fetching question details:', error);
      setLoading(false);
      if (error.response && error.response.status === 401) {
        setError('Please log in to view the question');
      } else {
        setError('An error occurred while fetching the question details');
      }
    });
  }, [id, language]);

  const handleEditorChange = (value) => setCode(value);

  const handleSubmit = () => {
    setSubmitting(true);
    setTestResults(null);
    setError(null);

    axios.post('http://localhost:5000/submit', {
      code,
      language,
      questionId: id,
      userId: user.id,
    })
    .then((response) => {
      if (response.data.success) {
        setTestResults(response.data.results);
        const allPassed = response.data.results?.every(result => result.result === 'pass');
        setVisualizerEnabled(allPassed); // Enable visualizer only if all test cases pass
        if (allPassed) saveSolvedStatus();
      } else {
        setError(response.data.message || 'An error occurred');
        setVisualizerEnabled(false); // Disable visualizer if submission fails
      }
      setSubmitting(false);
    })
    .catch((error) => {
      console.error('Error submitting code:', error);
      setError(error.response?.data?.message || 'An unexpected error occurred');
      setVisualizerEnabled(false); // Disable visualizer if submission fails
      setSubmitting(false);
    });
  };

  const saveSolvedStatus = () => {
    axios.post(`http://localhost:5000/questions/${id}/solve`, { code, language })
      .then(() => console.log('Question marked as solved'))
      .catch((error) => console.error('Error saving solved status:', error));
  };

  const saveToGitHub = () => {
    axios.post('http://localhost:5000/save-to-github', {
      code,
      questionTitle: question.qname,
      questionDescription: question.description,
      userId: user.id,
      language,
    })
    .then((response) => {
      if (response.data.success) {
        alert(`Code saved to GitHub! View it [here](${response.data.url})`);
      } else {
        alert('Failed to save code to GitHub.');
      }
    })
    .catch((error) => {
      console.error('Error saving to GitHub:', error);
      alert('An error occurred while saving to GitHub.');
    });
  };

  const handleVisualizer = () => {
    alert('Opening the visualizer!');
    console.log('Visualizing code:', code); // Debugging log

    // Encode the code and prepare the Python Tutor URL
    const encodedCode = encodeURIComponent(code);
    const visualizerUrl = `https://pythontutor.com/visualize.html#code=${encodedCode}&cumulative=false&curInstr=0&heapPrimitives=true`;

    // Open the Python Tutor visualization in a new tab
    window.open(visualizerUrl, '_blank');
  };

  const handleLanguageChange = (e) => setLanguage(e.target.value);

  if (loading) return <div className="loading-text">Loading...</div>;
  
  if (!question) return <div className="loading-text">Question not found. Please Login again to view.</div>;
  

  return (
    <div className="question-details-container">
      <div className="question-details">
        <h2>{question.qname}</h2>
        <p>{question.description}</p>

        <div className="question-subheading">
          <h4>Examples:</h4>
        </div>
        <ul>
          {question?.examples?.map((example, index) => (
            <li key={index}>
              {example.images?.map((img, imgIndex) => (
                 <img key={imgIndex} src={img} alt={`Example ${imgIndex}`} style={{ width: '200px', height: 'auto' }} />
               ))}
               <br></br>
              <strong>Input:</strong> {example.input} <br />
              <strong>Output:</strong> {example.output} <br />
              <strong>Explanation:</strong> {example.explanation || 'N/A'}
            </li>
          ))}
        </ul>

        <div className="question-subheading">
          <h4>Constraints:</h4>
        </div>
         <ul>
           {question.constraints.map((constraint, index) => <li key={index}>{constraint}</li>)}
         </ul>

        <div className="question-subheading">
          <h4>Topics:</h4>
        </div>
        <ul>
          {question.topics.map((topic, index) => <li key={index}>{topic}</li>)}
        </ul>
      </div>

      <div className="editor-container">
        <div className="language-selector">
          <label htmlFor="language">Select Language: </label>
          <select id="language" value={language} onChange={handleLanguageChange}>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        <h4>Code Editor:</h4>
        <div className="code-editor">
          <Editor
            height="400px"
            width="100%"
            language={language}
            value={code}
            theme="vs-dark"
            onChange={handleEditorChange}
          />
        </div>
        <button className="submit-button" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Code'}
        </button>

        <button className="save-button" onClick={saveToGitHub} disabled={!code.trim()}>
          Save to GitHub
        </button>

        <button className="visualizer-button" onClick={handleVisualizer} disabled={!visualizerEnabled}>
          Open Visualizer
        </button>

        {submitting && <div className="loading-text">Running test cases...</div>}

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {testResults && (
          <div>
            <h4>Status: {testResults.every(result => result.result === 'pass') ? '✅ Solved' : '❌ Unsolved'}</h4>
            <h4>Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index}>
                Test Case {index + 1}: {result.result === 'pass' ? '✅ Pass' : '❌ Fail'}
                {result.result === 'fail' && (
                  <div>
                    <strong>Expected:</strong> {result.expected} <br />
                    <strong>Actual:</strong> {result.actual}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetails;
