import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import {
  FaBold,
  FaItalic,
  FaHeading,
  FaCode,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
} from "react-icons/fa";
import "./PostPage.css";
import  ForumNav  from "./ForumNav";
import { useUser } from "../UserContext";

const PostPage = () => { 
  const {user} = useUser();
  console.log(user);
  console.log(user.name);
  const [markdown, setMarkdown] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [anonymous, setAnonymous] = useState(!user);
  const [imageSrc, setImageSrc] = useState(""); // To hold the uploaded image URL
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const insertAtCursor = (text) => {
    const textarea = document.getElementById("markdown-input");
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = markdown.substring(0, start);
    const after = markdown.substring(end, markdown.length);
    setMarkdown(`${before}${text}${after}`);
    setTimeout(() => textarea.focus(), 0);
  };

  const addFormatting = (type) => {
    switch (type) {
      case "bold":
        insertAtCursor("**Bold Text**");
        break;
      case "italic":
        insertAtCursor("_Italic Text_");
        break;
      case "heading":
        insertAtCursor("## Heading");
        break;
      case "code":
        insertAtCursor("```\nCode Block\n```");
        break;
      case "ul":
        insertAtCursor("- List item");
        break;
      case "ol":
        insertAtCursor("1. List item");
        break;
      case "link":
        insertAtCursor("[Link Text](http://example.com)");
        break;
      case "image":
        // This triggers the image input click when image button is clicked
        document.getElementById("image-upload").click();
        break;
      default:
        break;
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0]; // Take the first file selected
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageURL = reader.result; // The uploaded image's URL
        setImageSrc(imageURL); // Set the image URL to display in the markdown preview
        insertAtCursor(`![Image Alt Text](${imageURL})`); // Insert image in markdown content
      };
      reader.readAsDataURL(file); // Convert the file to a data URL
    }
  };

  const handlePostSubmission = async () => {
    if (!title || !markdown) {
      alert("Please fill in the required fields.");
      return;
    }

    const category = window.location.pathname.split("/").pop();
    const postData = {
      title: title.trim(),
      content: markdown.trim(),
      tags: tags.split(",").map((tag) => tag.trim()),
      username: anonymous ? "Anonymous" : user.name, // Username will be handled after login
      anonymous,
      images: imageSrc, // Store image URL
      category,
    };

    try {
      setIsSubmitting(true);
      const response = await fetch("http://localhost:5000/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        alert("Post submitted successfully!");
        navigate(-1);
      } else {
        const errorData = await response.json();
        console.error("Error submitting post:", errorData);
        alert("Failed to submit the post.");
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      alert("An error occurred while submitting the post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ForumNav />
      <div className="post-page">
        <div className="post-form">
          <input
            type="text"
            placeholder="Enter topic title..."
            className="post-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tag your topic (e.g. 'DisjointSets', 'Two-Pointers'...)"
            className="post-tag-input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <div className="markdown-toolbar">
            <button onClick={() => addFormatting("bold")}>
              <FaBold />
            </button>
            <button onClick={() => addFormatting("italic")}>
              <FaItalic />
            </button>
            <button onClick={() => addFormatting("heading")}>
              <FaHeading />
            </button>
            <button onClick={() => addFormatting("code")}>
              <FaCode />
            </button>
            <button onClick={() => addFormatting("ul")}>
              <FaListUl />
            </button>
            <button onClick={() => addFormatting("ol")}>
              <FaListOl />
            </button>
            <button onClick={() => addFormatting("link")}>
              <FaLink />
            </button>
            <button onClick={() => addFormatting("image")}>
              <FaImage />
            </button>
          </div>
          <label htmlFor="image-upload" className="image-upload-button">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }} // Hide the default file input
            />
          </label>
          <div className="markdown-container">
            <textarea
              id="markdown-input"
              placeholder="Write your Markdown here..."
              className="markdown-input"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            ></textarea>
            <div className="markdown-preview">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}
              >
                {markdown}
              </ReactMarkdown>
              {imageSrc && (
                <div className="image-preview">
                  <img src={imageSrc} alt="Uploaded" style={{ maxWidth: "100%", height: "auto" }} />
                </div>
              )}
            </div>
          </div>
          <div className="post-options">
            <label className="anonymous-option">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={() => {
                  setAnonymous(!anonymous);
                }}
              />
              Appear as anonymous to other users
            </label>
            <div className="post-actions">
              <button
                className="close-button"
                onClick={() => (navigate(-1))}
              >
                Close
              </button>
              <button
                className="post-button"
                onClick={handlePostSubmission}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PostPage;