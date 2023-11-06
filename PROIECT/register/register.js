"use strict";

// Username validation 
function isValidUsername(username) {
  const hasLetter = /[a-zA-Z]/.test(username);
  const hasNumber = /[0-9]/.test(username);
  const hasNonAlphanumeric = /[^a-zA-Z0-9]/.test(username);

  if (hasLetter && hasNumber && hasNonAlphanumeric) {
    return true;
  }

  const errorMessage = "Username must contain " +
    (!hasLetter ? " at least one letter (a-z or A-Z)" : "") +
    (!hasNumber ? (hasLetter ? "" : "") + "at least one number (0-9)" : "") +
    (!hasNonAlphanumeric ? ((hasLetter || hasNumber) ? " and" : "") + " at least one non-alphanumeric character" : "");

  alert(errorMessage + ".");
  return false;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("registrationForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const { value: email } = document.getElementById("email");
    const { value: username } = document.getElementById("username");
    const { value: password } = document.getElementById("password");
    const { value: firstName } = document.getElementById("firstName");
    const { value: lastName } = document.getElementById("lastName");
    const { value: age } = document.getElementById("age");

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Check if the user already has an account

    const duplicateUser = users.find((user) => user.email === email || user.username === username);

    if (duplicateUser) {
      return alert("Email or username already exists. Please choose a different one.");
    }

    // Validations

    if (!email) return alert("Email is required");
    if (!username || username.length < 6) return alert("Username is required and must be at least 6 characters long");
    if (!isValidUsername(username)) return;
    if (!password || password.length < 6) return alert("Password is required and must be at least 6 characters long");
    if (!firstName || firstName.length < 2) return alert("First name is required and must be at least 2 characters long");
    if (!lastName || lastName.length < 2) return alert("Last name is required and must be at least 2 characters long");
    if (!age || age < 18 || age > 65) return alert("Age is required and must be between 18 and 65");
       

    const user = { email, username, password, firstName, lastName, age };

    localStorage.setItem("loggedInUsername", username);
    users.push(user);
    localStorage.setItem("users", JSON.stringify(users));
    window.location.href = "/login/login.html";
  });
});
