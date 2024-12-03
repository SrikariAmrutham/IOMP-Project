import React, { useState, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import axios from 'axios';
import './Styles.css';

const CodeEditor = ({ userId, questionId }) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java'); // Default language (can be dynamic)

  useEffect(() => {
    // Fetch saved code when the component is mounted
    const fetchSavedCode = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/getSavedCode?userId=${userId}&questionId=${questionId}`);
        setCode(response.data.code); // Set the saved code
        setLanguage(response.data.language); // Set the language if needed
      } catch (error) {
        console.error('Error fetching saved code:', error);
      }
    };

    fetchSavedCode();
  }, [userId, questionId]);

  const handleEditorChange = (value) => {
    setCode(value); // Update code when the editor content changes
  };

  const handleSubmit = () => {
    // Submit the code to backend for evaluation
    console.log('Submitted code for question:', questionId, 'Code:', code);
    // You can send the code and language to the backend as per your use case
  };

  return (
    <div className="code-editor">
      <MonacoEditor
        height="400px"
        language={language}
        theme="vs-dark"
        value={code} // Set the initial value to the fetched saved code
        onChange={handleEditorChange}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default CodeEditor;
