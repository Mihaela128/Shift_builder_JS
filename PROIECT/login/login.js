"use strict";

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Field validations

    if (!username || username.length < 6) return alert("Username is required and must be at least 6 characters long");
    if (!password || password.length < 6) return alert("Password is required and must be at least 6 characters long");
    
    const storedUsers = JSON.parse(localStorage.getItem("users")) || [];

    // Find the user with matching username
    const foundUser = storedUsers.find((user) => user.username === username);

    if (foundUser) {
      if (foundUser.password === password) {
        localStorage.setItem("loggedInUsername", username);
        window.location.href = "/home/home.html";
      } else {
        alert("Invalid username or password. Please try again.");
      }
    } else {
      alert("Invalid username or password. Please try again.");
    }
  });

// "Forgot your password? Click here!" link
document.querySelector('a[href="/register/register.html"]').addEventListener("click", function (event) {
  event.preventDefault();

  const username = document.getElementById("username").value;

  let storedUsers = JSON.parse(localStorage.getItem("users")) || [];

  // Find the user with matching username
  const foundUserIndex = storedUsers.findIndex((user) => user.username === username);

  if (foundUserIndex !== -1) {
    const loggedInUsername = localStorage.getItem("loggedInUsername");
    if (loggedInUsername === username) {
      localStorage.removeItem("loggedInUsername");
    }

    // Remove the user from the storedUsers array
    const userToRemove = storedUsers.splice(foundUserIndex, 1)[0];

    // Remove all shifts associated with the user
    let storedShifts = JSON.parse(localStorage.getItem("shifts")) || [];
    storedShifts = storedShifts.filter((shift) => shift.username !== userToRemove.username);
    localStorage.setItem("shifts", JSON.stringify(storedShifts));

    // Update the local storage with the updated user data
    localStorage.setItem("users", JSON.stringify(storedUsers));

    alert("User account has been removed.");
  } else {
    alert("User not found.");
  }

  window.location.href = "/register/register.html";
});


// Create account button handling
document.getElementById("register").addEventListener("click", function() {
  window.location.href = "/register/register.html";
});
