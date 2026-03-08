document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postForm");
  const messageInput = document.getElementById("messageInput");
  const postsContainer = document.getElementById("posts");
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  const postsRef = ref(db, "posts");
  const provider = new GoogleAuthProvider();

  // Authentication
  loginBtn.onclick = () => {
    signInWithPopup(auth, provider)
      .then(result => {
        const user = result.user;
        alert(`Logged in as ${user.displayName}`);
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
      })
      .catch(error => console.error(error));
  };

  logoutBtn.onclick = () => {
    signOut(auth).then(() => {
      alert("Logged out");
      loginBtn.style.display = "inline-block";
      logoutBtn.style.display = "none";
    });
  };

  // Load posts in real-time
  onValue(postsRef, snapshot => {
    postsContainer.innerHTML = "";
    snapshot.forEach(child => {
      const postData = child.val();
      renderPost(postData, child.key);
    });
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message || !auth.currentUser) {
      alert("You must be logged in to post!");
      return;
    }

    const now = new Date();
    const postData = {
      username: auth.currentUser.displayName || "Anonymous",
      message,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
      edited: false,
      likes: 0,
      replies: {}
    };

    push(postsRef, postData);
    messageInput.value = "";
  });

  function renderPost(postData, id) {
    const post = document.createElement("div");
    post.classList.add("post");

    const messageText = document.createElement("p");
    messageText.textContent = `${postData.username}: ${postData.message}`;

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
      if (!auth.currentUser) return alert("Login required to edit!");
      const newMessage = prompt("Edit your message:", postData.message);
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
      if (!auth.currentUser) return alert("Login required to delete!");
      if (confirm("Delete this post?")) {
        remove(ref(db, "posts/" + id));
      }
    };

    // Like button
    const likeBtn = document.createElement("button");
    likeBtn.textContent = `Like (${postData.likes})`;
    likeBtn.onclick = () => {
      if (!auth.currentUser) return alert("Login required to like!");
      update(ref(db, "posts/" + id), { likes: postData.likes + 1 });
    };

    // Replies
    // Replies container
    const repliesContainer = document.createElement("div");
    repliesContainer.classList.add("replies");

    const repliesRef = ref(db, "posts/" + id + "/replies");
    onValue(repliesRef, snapshot => {
      repliesContainer.innerHTML = "";
      snapshot.forEach(reply => {
        const replyData = reply.val();
        const replyEl = document.createElement("p");
        replyEl.textContent = `${replyData.username}: ${replyData.message}`;
        repliesContainer.appendChild(replyEl);
      });
    });

    // Reply form
    const replyForm = document.createElement("form");
    const replyInput = document.createElement("input");
    replyInput.placeholder = "Write a reply...";
    const replyBtn = document.createElement("button");
    replyBtn.textContent = "Reply";
    replyForm.append(replyInput, replyBtn);

    replyForm.addEventListener("submit", e => {
      e.preventDefault();
      const replyMessage = replyInput.value.trim();
      if (!replyMessage || !auth.currentUser) {
        alert("You must be logged in to reply!");
        return;
      }
      const now = new Date();
      const replyData = {
        username: auth.currentUser.displayName || "Anonymous",
        message: replyMessage,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
      };
      push(repliesRef, replyData);
      replyInput.value = "";
    });

    // Assemble post
    buttonContainer.append(editBtn, deleteBtn, likeBtn);
    post.append(messageText, timestamp, buttonContainer, repliesContainer, replyForm);
    postsContainer.appendChild(post);
  }
});
