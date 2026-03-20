// Replace with your Firebase owner UID
const OWNER_UID = "EwTQxequbDWFS6RHjrtrV6j2DxI3";

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
      userId: auth.currentUser.uid, // ✅ store userId
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

    const currentUser = auth.currentUser;

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.onclick = () => {
      if (!currentUser) return alert("Login required to edit!");
      if (currentUser.uid === OWNER_UID || currentUser.uid === postData.userId) {
        const newMessage = prompt("Edit your message:", postData.message);
        if (newMessage) {
          update(ref(db, "posts/" + id), {
            message: newMessage,
            edited: true,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
          });
        }
      } else {
        alert("You can only edit your own posts.");
      }
    };

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => {
      if (!currentUser) return alert("Login required to delete!");
      if (currentUser.uid === OWNER_UID || currentUser.uid === postData.userId) {
        if (confirm("Delete this post?")) {
          remove(ref(db, "posts/" + id));
        }
      } else {
        alert("You can only delete your own posts.");
      }
    };

    // Like button
    const likeBtn = document.createElement("button");
    likeBtn.textContent = `Like (${postData.likes})`;
    likeBtn.onclick = () => {
      if (!currentUser) return alert("Login required to like!");
      update(ref(db, "posts/" + id), { likes: postData.likes + 1 });
    };

    // Replies
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

    const replyForm = document.createElement("form");
    const replyInput = document.createElement("input");
    replyInput.placeholder = "Write a reply...";
    const replyBtn = document.createElement("button");
    replyBtn.textContent = "Reply";
    replyForm.append(replyInput, replyBtn);

    replyForm.addEventListener("submit", e => {
      e.preventDefault();
      const replyMessage = replyInput.value.trim();
      if (!replyMessage || !currentUser) {
        alert("You must be logged in to reply!");
        return;
      }
      const now = new Date();
      const replyData = {
        userId: currentUser.uid,
        username: currentUser.displayName || "Anonymous",
        message: replyMessage,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
      };
      push(repliesRef, replyData);
      replyInput.value = "";
    });

    buttonContainer.append(editBtn, deleteBtn, likeBtn);
    post.append(messageText, timestamp, buttonContainer, repliesContainer, replyForm);
    postsContainer.appendChild(post);
  }
});

// Legacy compat block preserved
const postsRefCompat = firebase.database().ref("posts");

document.getElementById("postForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const message = document.getElementById("messageInput").value;
  const user = firebase.auth().currentUser;

  if (message.trim() !== "" && user) {
    const newPostRef = postsRefCompat.push();
    newPostRef.set({
      message: message,
      userId: user.uid,
      userName: user.displayName || "Anonymous",
      timestamp: Date.now()
    });
    document.getElementById("messageInput").value = "";
  }
});

postsRefCompat.on("value", snapshot => {
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "";

  snapshot.forEach(childSnapshot => {
    const post = childSnapshot.val();
    const postId = childSnapshot.key;

    const postDiv = document.createElement("div");
    postDiv.classList.add("post");

    const messageP = document.createElement("p");
    messageP.textContent = post.message;

    const userSpan = document.createElement("span");
    userSpan.textContent = `Posted by ${post.userName}`;

    const timeSpan = document.createElement("span");
    const date = new Date(post.timestamp);
    timeSpan.textContent = date.toLocaleString();

    postDiv.appendChild(messageP);
    postDiv.appendChild(userSpan);
    postDiv.appendChild(timeSpan);

    const currentUser = firebase.auth().currentUser;
    if (currentUser && (currentUser.uid === OWNER_UID || currentUser.uid === post.userId)) {
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        if (currentUser.uid === OWNER_UID || currentUser.uid === post.userId) {
          postsRefCompat.child(postId).remove();
        } else {
          alert("You can only delete your own posts.");
        }
      });

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        if (currentUser.uid === OWNER_UID || currentUser.uid === post.userId) {
          const newMessage = prompt("Edit your post:", post.message);
          if (newMessage && newMessage.trim() !== "") {
            postsRefCompat.child(postId).update({
              message: newMessage,
              timestamp: Date.now()
            });
          }
        } else {
          alert("You can only edit your own posts.");
        }
      });

      postDiv.appendChild(deleteBtn);
      postDiv.appendChild(editBtn);
    }

    postsContainer.appendChild(postDiv);
  });
});
