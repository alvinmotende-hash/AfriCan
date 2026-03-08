document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("voteForm");
  if (form) {
    form.addEventListener("submit", function(event) {
      event.preventDefault();
      const selected = document.querySelector('input[name="time"]:checked');
      const result = document.getElementById("voteResult");
      if (selected) {
        result.textContent = "Thank you! You voted for " + selected.value + " sessions.";
      } else {
        result.textContent = "Please select a time before submitting.";
      }
    });
  }
});
// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form form");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // prevent default form submission

    // Grab values
    const name = document.querySelector("#name").value.trim();
    const email = document.querySelector("#email").value.trim();
    const message = document.querySelector("#message").value.trim();

    // Simple validation
    if (!name || !email || !message) {
      alert("Please fill in all fields before submitting.");
      return;
    }

    // Email format check
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!email.match(emailPattern)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Success feedback
    alert("Thank you, " + name + "! Your message has been sent successfully.");

    // Reset form
    form.reset();
  });
});
