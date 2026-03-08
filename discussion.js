// Wait until the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postForm");
  const messageInput = document.getElementById("messageInput");
  const postsContainer = document.getElementById("posts");

  // Load saved posts from localStorage
  let posts = JSON.parse(localStorage.getItem("discussionPosts")) || [];
  posts.forEach(postData => renderPost(postData));

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent page reload

    const message = messageInput.value.trim();

    // Validation
    if (!message) {
      alert("Please write a message before posting.");
      return;
    }

    // Create post object
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: 'numeric', hour12: true };

    const postData = {
      message,
      date: now.toLocaleDateString([], dateOptions),
      time: now.toLocaleTimeString([], timeOptions),
      edited: false,
      likes: 0
    };

    posts.push(postData);
    localStorage.setItem("discussionPosts", JSON.stringify(posts));

    renderPost(postData);

    // Clear input
    messageInput.value = "";
  });

  // Function to render a post bubble
  function renderPost(postData) {
    const post = document.createElement("div");
    post.classList.add("post");

    // Message text
    const messageText = document.createElement("p");
    messageText.textContent = postData.message;

    // Timestamp
    const timestamp = document.createElement("span");
    timestamp.textContent = `${postData.edited ? "Edited" : "Posted"} on ${postData.date} at ${postData.time}`;
    timestamp.style.display = "block";
    timestamp.style.fontSize = "0.8rem";
    timestamp.style.color = "#ffaa00";
    timestamp.style.marginTop = "0.5rem";

    // Button container
    const buttonContainer = document.createElement("div");
    buttonContainer.style.marginTop = "0.5rem";
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "0.5rem";

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.background = "linear-gradient(135deg, #cc0000, #ff4444)";
    deleteBtn.style.color = "#fff";
    deleteBtn.style.border = "none";
    deleteBtn.style.padding = "0.4rem 0.8rem";
    deleteBtn.style.borderRadius = "5px";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.style.fontSize = "0.8rem";

    deleteBtn.addEventListener("click", () => {
      const confirmDelete = confirm("Are you sure you want to delete this post?");
      if (confirmDelete) {
        posts = posts.filter(p => !(p.message === postData.message && p.date === postData.date && p.time === postData.time));
        localStorage.setItem("discussionPosts", JSON.stringify(posts));
        postsContainer.removeChild(post);
      }
    });

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.style.background = "linear-gradient(135deg, #0066cc, #00aaff)";
    editBtn.style.color = "#fff";
    editBtn.style.border = "none";
    editBtn.style.padding = "0.4rem 0.8rem";
    editBtn.style.borderRadius = "5px";
    editBtn.style.cursor = "pointer";
    editBtn.style.fontSize = "0.8rem";

    editBtn.addEventListener("click", () => {
      const newMessage = prompt("Edit your message:", messageText.textContent);
      if (newMessage !== null && newMessage.trim() !== "") {
        messageText.textContent = newMessage.trim();
        const editedNow = new Date();
        postData.message = newMessage.trim();
        postData.date = editedNow.toLocaleDateString([], dateOptions);
        postData.time = editedNow.toLocaleTimeString([], timeOptions);
        postData.edited = true;
        timestamp.textContent = `Edited on ${postData.date} at ${postData.time}`;
        localStorage.setItem("discussionPosts", JSON.stringify(posts));
      }
    });

    // Like button
    const likeBtn = document.createElement("button");
    likeBtn.textContent = `Like (${postData.likes})`;
    likeBtn.style.background = "linear-gradient(135deg, #00cc66, #33ff99)";
    likeBtn.style.color = "#fff";
    likeBtn.style.border = "none";
    likeBtn.style.padding = "0.4rem 0.8rem";
    likeBtn.style.borderRadius = "5px";
    likeBtn.style.cursor = "pointer";
    likeBtn.style.fontSize = "0.8rem";

    likeBtn.addEventListener("click", () => {
      postData.likes++;
      likeBtn.textContent = `Like (${postData.likes})`;
      localStorage.setItem("discussionPosts", JSON.stringify(posts));
    });

    // Append buttons
    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn);
    buttonContainer.appendChild(likeBtn);

    // Append everything to post
    post.appendChild(messageText);
    post.appendChild(timestamp);
    post.appendChild(buttonContainer);

    postsContainer.appendChild(post);
  }
});
