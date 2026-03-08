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
