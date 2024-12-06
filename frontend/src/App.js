// import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Login from './Components/Login';
// import Home from './Components/Home';
// import Signup from './Components/Signup';
// import OAuthCallback from './Components/OAuthCallback';
// import QuestionDetails from './Components/QuestionDetails';
// import Navbar from './Components/Navbar';
// import Forums from './Components/Forums';
// import { UserProvider } from './UserContext';

// const App = () => {
//   return (
//     <UserProvider>
//         <Router>
//         <Navbar/>
//           <Routes>
//             <Route path="/" element={<Login />} />
//             <Route path="/signup" element={<Signup  />} />
//             <Route path="/callback" element={<OAuthCallback  />} />
//             <Route path="/home" element={<Home  />} />
//             <Route path="/question/:id" element={<QuestionDetails />} />
//             <Route path="/forums" element={<Forums />} />
//           </Routes>
//         </Router>
//     </UserProvider>
//   );
// };

// export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import Home from './Components/Home';
import Signup from './Components/Signup';
import OAuthCallback from './Components/OAuthCallback';
import QuestionDetails from './Components/QuestionDetails';
import Navbar from './Components/Navbar';
import ForumInterview from './Components/ForumInterview';
import ForumAlgorithms from './Components/ForumAlgorithm';
import ForumTips from './Components/ForumTips';
import ForumGD from './Components/ForumGD';
import PostPage  from './Components/PostPage';
import DetailedPost from './Components/DetailedPost';

import { UserProvider } from './UserContext';
import ForumNav from './Components/ForumNav';

const App = () => {
  return (
    <UserProvider>
        <Router>
        <Navbar/>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup  />} />
            <Route path="/callback" element={<OAuthCallback  />} />
            <Route path="/home" element={<Home  />} />
            <Route path="/forum" element={<ForumNav section="algorithms" />} />
            <Route path="/question/:id" element={<QuestionDetails />} />
            <Route path="/forum/category/algorithms" element={<ForumAlgorithms/>}/>
            <Route path="/forum/category/interview_experience" element={<ForumInterview/>}/>
            <Route path="/forum/category/tips_and_tricks" element={<ForumTips/>}/>
            <Route path="/forum/category/general_discussions" element={<ForumGD/>}/>
            <Route path="/post/algorithms" element={<PostPage/>} />
            <Route path="/post/general_discussions" element={<PostPage/>} />
            <Route path="/post/tips_and_tricks" element={<PostPage/>} />
            <Route path="/post/interview_experience" element={<PostPage/>} />
            <Route path="discussion/:id" element={<DetailedPost/>} />
          </Routes>
        </Router>
    </UserProvider>
  );
};

export default App;
