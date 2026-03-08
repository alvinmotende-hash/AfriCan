document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postForm");
  const messageInput = document.getElementById("messageInput");
  const postsContainer = document.getElementById("posts");

  // Reference to database
  const postsRef = ref(db, "posts");

  // Load posts in real-time
  onValue(postsRef, snapshot => {
    postsContainer.innerHTML = ""; // clear before re-render
    snapshot.forEach(child => {
      const postData = child.val();
      renderPost(postData, child.key);
    });
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    const now = new Date();
    const postData = {
      message,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      edited: false,
      likes: 0
    };

    push(postsRef, postData); // save to Firebase
    messageInput.value = "";
  });

  function renderPost(postData, id) {
    const post = document.createElement("div");
    post.classList.add("post");

    const messageText = document.createElement("p");
    messageText.textContent = postData.message;

    const timestamp = document.createElement("span");
    timestamp.textContent = `${postData.edited ? "Edited" : "Posted"} on ${postData.date} at ${postData.time}`;
    timestamp.style.fontSize = "0.8rem";
    timestamp.style.color = "#ffaa00";

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";
    buttonContainer.style.gap = "0.5rem";

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      const newMessage = prompt("Edit your message:", messageText.textContent);
      if (newMessage) {
        update(ref(db, "posts/" + id), {
          message: newMessage,
          edited: true,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString()
        });
      }
    };

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      if (confirm("Delete this post?")) {
        remove(ref(db, "posts/" + id));
      }
    };

    // Like button
    const likeBtn = document.createElement("button");
    likeBtn.textContent = `Like (${postData.likes})`;
    likeBtn.onclick = () => {
      update(ref(db, "posts/" + id), { likes: postData.likes + 1 });
    };

    buttonContainer.append(editBtn, deleteBtn, likeBtn);
    post.append(messageText, timestamp, buttonContainer);
    postsContainer.appendChild(post);
  }
});
