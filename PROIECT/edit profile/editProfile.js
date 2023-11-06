"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const updateGreeting = () => {
    const loggedInUsername = localStorage.getItem("loggedInUsername") || "Guest";
    $("greeting").textContent = `Hello, ${loggedInUsername}`;
  };

  const handleClick = (event) => {
    event.preventDefault();
    const newUsername = $("username").value;
    localStorage.setItem("loggedInUsername", newUsername);
    updateGreeting();
    const currentUser = users.find((user) => user.username === newUsername);
    if (currentUser) {
      populateForm(currentUser);
    }
  };

  const validateForm = () => {
    const email = $("email").value;
    const username = $("username").value;
    const password = $("password").value;
    const firstName = $("firstName").value;
    const lastName = $("lastName").value;
    const age = parseInt($("age").value);

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const minLength = 6;
    const minNameLength = 2;
    const minAge = 18;
    const maxAge = 65;

    if (!emailRegex.test(email)) return alert("Invalid email format");
    if (username.length < minLength) return alert(`Username is required and must be at least ${minLength} characters long`);
    if (password.length < minLength) return alert(`Password is required and must be at least ${minLength} characters long`);
    if (firstName.length < minNameLength) return alert(`First name is required and must be at least ${minNameLength} characters long`);
    if (lastName.length < minNameLength) return alert(`Last name is required and must be at least ${minNameLength} characters long`);
    if (age < minAge || age > maxAge) return alert(`Age is required and must be between ${minAge} and ${maxAge}`);

    return true;
  };

  const users = JSON.parse(localStorage.getItem("users")) || [];

  const populateForm = (user) => {
    $("email").value = user.email;
    $("username").value = user.username;
    $("password").value = user.password;
    $("firstName").value = user.firstName;
    $("lastName").value = user.lastName;
    $("age").value = user.age;
  };

  const loggedInUsername = localStorage.getItem("loggedInUsername");
  const currentUser = users.find((user) => user.username === loggedInUsername);
  if (currentUser) {
    populateForm(currentUser);
  }

  const editProfileForm = $("editProfileForm");

  editProfileForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (validateForm()) {
      const updatedUserData = {
        email: $("email").value,
        username: $("username").value,
        password: $("password").value,
        firstName: $("firstName").value,
        lastName: $("lastName").value,
        age: parseInt($("age").value),
      };

      const updatedUsers = users.map((user) => {
        if (user.username === loggedInUsername) {
          return { ...user, ...updatedUserData };
        }
        return user;
      });

      localStorage.setItem("users", JSON.stringify(updatedUsers));

      localStorage.setItem("loggedInUsername", updatedUserData.username);

      updateShiftsUsername(updatedUserData.username); // Update the username for the logged-in user's shifts

      alert("Profile updated successfully!");

      updateUsernameInTable(updatedUserData.username); // Update the username in the table

      window.location.href = "/home/home.html";
    }
  });

  const updateShiftsUsername = (newUsername) => {
    const storedShifts = JSON.parse(localStorage.getItem("shifts")) || [];
    const updatedShifts = storedShifts.map((shift) => {
      if (shift.username === loggedInUsername) {
        return { ...shift, username: newUsername };
      }
      return shift;
    });
    localStorage.setItem("shifts", JSON.stringify(updatedShifts));
  };

  const updateUsernameInTable = (newUsername) => {
    const rows = document.querySelectorAll("table tbody tr");
    rows.forEach((row) => {
      const usernameCell = row.querySelector('[data-column="username"]');
      if (usernameCell && usernameCell.textContent === loggedInUsername) {
        usernameCell.textContent = newUsername;
      }
    });
  };

  // Add event listeners to register and login buttons
  ["registerButton", "loginButton"].forEach((id) =>
    $(id)?.addEventListener("click", handleClick)
  );

  // Add event listener to the cancel profile button
  $("cancelProfileButton")?.addEventListener("click", () => {
    alert("Profile update canceled.");

    window.location.href = "/home/home.html";
  });

  updateGreeting();
});