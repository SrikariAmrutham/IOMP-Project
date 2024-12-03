import React from 'react';
import CodeMirror from '@uiw/react-codemirror'; // Install this library via npm

const Editor = ({ code, onCodeChange }) => {
  return (
    <CodeMirror
      value={code}
      height="300px"
      onChange={(value) => onCodeChange(value)}
      options={{
        theme: 'material',
        mode: 'javascript', // You can change it based on the language
        lineNumbers: true,
      }}
    />
  );
};

export default Editor;
