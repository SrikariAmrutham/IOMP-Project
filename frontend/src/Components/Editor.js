import React from 'react';
import CodeMirror from '@uiw/react-codemirror'; 

const Editor = ({ code, onCodeChange }) => {
  return (
    <CodeMirror
      value={code}
      height="300px"
      onChange={(value) => onCodeChange(value)}
      options={{
        theme: 'material',
        mode: 'javascript', 
        lineNumbers: true,
      }}
    />
  );
};

export default Editor;
