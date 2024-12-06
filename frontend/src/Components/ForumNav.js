import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ForumNav.css";

const ForumNav = ({ section }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="forum-nav">
      <h1 className="forum-logo">Forum</h1>
      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <ul className={`forum-nav-links ${menuOpen ? "open" : ""}`}>
      <li>
            <Link
              to="/forum"
              className='nav-link'
            ></Link>
        </li>
        <li>
            <Link
              to="/forum/category/algorithms"
              className={`nav-link ${section === "algorithms" ? "active" : ""}`}
            > Algorithms </Link>
        </li>
        <li>
          <Link
            to="/forum/category/interview_experience"
            className={`nav-link ${section === "interview" ? "active" : ""}`}
          > Interview Experience</Link>
        </li>
        <li>
          <Link
            to="/forum/category/tips_and_tricks"
            className={`nav-link ${section === "tips_tricks" ? "active" : ""}`}
          > Tricks & Tips</Link>
        </li>
      </ul>
    </nav>
  );
};

export default ForumNav;