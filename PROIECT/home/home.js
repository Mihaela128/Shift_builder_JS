"use strict";

// ============================GREETING SECTION==============================
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);

  // Updates the greeting text with the stored username or "Guest"
  const updateGreeting = () => {
    const loggedInUsername = localStorage.getItem("loggedInUsername");
    const storedUsername = JSON.parse(localStorage.getItem("users"))?.find(({ username }) => username === loggedInUsername)?.username || null;
    $("greeting").textContent = `Hello, ${storedUsername || "Guest"}`;
    if (loggedInUsername) {
      updateHighestEarningsMonth(); // Update the highest earnings month for the logged-in user
    }
  };

  // Handles the click event on register and login buttons
  const handleClick = event => {
    event.preventDefault();
    localStorage.setItem("loggedInUsername", $("username").value);
    updateGreeting();
  };

  // Add event listeners to register and login buttons
  ["registerButton", "loginButton"].forEach(id => $(id)?.addEventListener("click", handleClick));

  updateGreeting();
});


// =============================ADD SHIFT MODAL SECTION=============================
document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const addShiftModal = $("addShiftModal");
  const shiftForm = $("shiftForm");
  const tableBody = $("shiftsTableBody");

  // Shows the add shift modal
  const showAddShiftModal = () => addShiftModal.style.display = "block";

  // Hides the add shift modal and resets the form
  const hideAddShiftModal = () => {
    addShiftModal.style.display = "none";
    shiftForm.reset();
    loadShiftsFromStorage(); // Update the table after hiding the modal
  };

  // Validates the shift form
  const validateForm = () => {
    const fields = ["shiftDate", "startTime", "endTime", "hourlyWage", "workplace", "shiftSlug"];
    return fields.every(field => {
      const value = $(field).value;
      if (!value) {
        alert(`Please enter a ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return false;
      }
      return true;
    });
  };

  // Handles the form submission
  const handleFormSubmit = event => {
    event.preventDefault();
    if (validateForm()) {
      const loggedInUsername = localStorage.getItem("loggedInUsername");
      if (!loggedInUsername) {
        alert("Please log in before adding shifts.");
        return;
      }

      const shift = {
        date: $("shiftDate").value,
        startTime: $("startTime").value,
        endTime: $("endTime").value,
        hourlyWage: $("hourlyWage").value,
        workplace: $("workplace").value,
        shiftSlug: $("shiftSlug").value,
        comments: $("comments").value,
        username: loggedInUsername,
      };

      const storedShifts = JSON.parse(localStorage.getItem("shifts")) || [];

      // Check for duplicate shift slug only among shifts of the current user
    const isDuplicateSlug = storedShifts.some(s => s.username === loggedInUsername && s.shiftSlug === shift.shiftSlug);
    if (isDuplicateSlug && shift.shiftSlug !== editedShiftSlug) {
      alert("The shift slug name must be unique for your shifts. Please enter a different shift slug.");
      return;
    }

      const totalProfit = calculateTotalProfit(shift);
      shift.totalProfit = totalProfit.toFixed(2);

      if (editedShiftSlug) {
        const index = storedShifts.findIndex(s => s.shiftSlug === editedShiftSlug);
        if (index !== -1) {
          storedShifts[index] = shift;
          updateShiftInTable(shift, editedShiftSlug); // Update the shift in the table
          editedShiftSlug = null; // Reset the editedShiftSlug variable
        }
      } else {
        storedShifts.push(shift);
        addShiftToTable(shift); // Add the shift to the table
      }

      localStorage.setItem("shifts", JSON.stringify(storedShifts));

      hideAddShiftModal();
      updateHighestEarningsMonth();
    }
  };

  // Adds a shift to the table
  const addShiftToTable = shift => {
    const row = tableBody.insertRow();
    const columns = ["date", "startTime", "endTime", "hourlyWage", "workplace", "shiftSlug", "action", "comments", "totalProfit"];
    columns.forEach((column, index) => {
      const cell = row.insertCell(index);
      if (column === "action") {
        cell.innerHTML = `<button data-shift-slug="${shift.shiftSlug}" class="editButton">Edit</button> <button data-shift-slug="${shift.shiftSlug}" class="deleteButton">Delete</button>`;
      } else if (column === "totalProfit") {
        cell.textContent = Math.abs(shift[column]);
      } else {
        cell.textContent = shift[column];
      }
    });
  };

  // Updates a shift in the table
  const updateShiftInTable = (newShift, shiftSlug) => {
    const row = tableBody.querySelector(`tr[data-shift-slug="${shiftSlug}"]`);
    if (row) {
      const columns = ["date", "startTime", "endTime", "hourlyWage", "workplace", "shiftSlug", "comments", "totalProfit"];
      columns.forEach(column => {
        const cell = row.querySelector(`[data-column="${column}"]`);
        if (cell) {
          if (column === "shiftSlug") {
            cell.textContent = newShift[column];
            cell.dataset.shiftSlug = newShift[column];
          } else if (column !== "action") {
            cell.textContent = newShift[column];
          }
        }
      });
    }
  };

  let editedShiftSlug = null; // Variable to store the currently edited shift slug

  // Handles the click event on the table (edit/delete buttons)
  const handleTableClick = event => {
    const { target } = event;
    const editButton = target.closest(".editButton");
    const deleteButton = target.closest(".deleteButton");

    if (editButton) {
      const shiftSlug = editButton.dataset.shiftSlug;
      const shiftToEdit = JSON.parse(localStorage.getItem("shifts")).find(shift => shift.shiftSlug === shiftSlug);
      if (shiftToEdit) {
        populateFormWithShift(shiftToEdit);
        showAddShiftModal();
        editedShiftSlug = shiftSlug; // Set the editedShiftSlug variable
      }
    } else if (deleteButton) {
      const shiftSlug = deleteButton.dataset.shiftSlug;
      const confirmed = confirm("Are you sure you want to delete this shift?");
      if (confirmed) {
        const storedShifts = JSON.parse(localStorage.getItem("shifts")) || [];
        const index = storedShifts.findIndex(shift => shift.shiftSlug === shiftSlug);
        if (index !== -1) {
          storedShifts.splice(index, 1);
          localStorage.setItem("shifts", JSON.stringify(storedShifts));
          tableBody.removeChild(deleteButton.closest("tr"));
          updateHighestEarningsMonth(); // Update the month with highest earnings
        }
      }
    }
  };

  // Populates the form fields with the shift data
  const populateFormWithShift = shift => {
    $("shiftDate").value = shift.date;
    $("startTime").value = shift.startTime;
    $("endTime").value = shift.endTime;
    $("hourlyWage").value = shift.hourlyWage;
    $("workplace").value = shift.workplace;
    $("shiftSlug").value = shift.shiftSlug;
    $("comments").value = shift.comments;
  };

  // Calculates the total profit for a shift
  const calculateTotalProfit = shift => {
    const startDateTime = new Date(`${shift.date} ${shift.startTime}`);
    const endDateTime = new Date(`${shift.date} ${shift.endTime}`);
    const duration = (endDateTime - startDateTime) / (1000 * 60 * 60); // Duration in hours
    const totalProfit = duration * shift.hourlyWage;
    return Math.abs(totalProfit);
  };

  // Loads shifts from storage and populates the table
  const loadShiftsFromStorage = () => {
    tableBody.innerHTML = ""; // Clear the table body
    const storedShifts = JSON.parse(localStorage.getItem("shifts")) || [];
    const loggedInUsername = localStorage.getItem("loggedInUsername");
    if (loggedInUsername) {
      const userShifts = storedShifts.filter(s => s.username === loggedInUsername); 
      userShifts.forEach(addShiftToTable);
    }
  };

  // Updates the month with the highest earnings
  const updateHighestEarningsMonth = () => {
    const storedShifts = JSON.parse(localStorage.getItem("shifts")) || [];
    const loggedInUsername = localStorage.getItem("loggedInUsername");
  
    const earningsByMonth = {};
    let highestMonth = null;
    let highestEarnings = 0;
  
    storedShifts.forEach(shift => {
      if (shift.username === loggedInUsername) { // Only consider shifts for the logged-in user
        const month = shift.date.split("-")[1];
        earningsByMonth[month] = (earningsByMonth[month] || 0) + parseFloat(shift.totalProfit);
        if (earningsByMonth[month] > highestEarnings) {
          highestEarnings = earningsByMonth[month];
          highestMonth = month;
        }
      }
    });
  
    $("highest-earnings").textContent = highestMonth ? highestMonth : "N/A";
  };
  
  $("addShiftButton")?.addEventListener("click", showAddShiftModal);
  $("closeModalButton")?.addEventListener("click", hideAddShiftModal);
  $("shiftForm")?.addEventListener("submit", handleFormSubmit);
  tableBody?.addEventListener("click", handleTableClick);

  loadShiftsFromStorage();
  updateHighestEarningsMonth();


  // ======================================SEARCH OPTIONS SECTION=========================
  // Search by shift name
const handleSearchByName = () => {
  const searchSlug = $("shiftName").value.trim();
  if (searchSlug === "") {
    alert("Please enter a shift slug to search.");
    return;
  }

  const storedShifts = JSON.parse(localStorage.getItem("shifts")) || [];
  const loggedInUsername = localStorage.getItem("loggedInUsername");

  const searchResults = storedShifts.filter(shift =>
    shift.username === loggedInUsername && // Filter shifts only for the logged-in user
    shift.shiftSlug.toLowerCase() === searchSlug.toLowerCase()
  );

  displaySearchResults(searchResults);
  $("shiftName").value = "";
};

  // Search by date range
const handleSearchByDate = () => {
  const startDate = $("startDate").value;
  const endDate = $("endDate").value;

  if (startDate === "" || endDate === "") {
    alert("Please select both start and end dates to search.");
    return;
  }

  const storedShifts = JSON.parse(localStorage.getItem("shifts")) || [];
  const loggedInUsername = localStorage.getItem("loggedInUsername");

  const searchResults = storedShifts.filter(shift => {
    const shiftDate = new Date(shift.date);
    const searchStartDate = new Date(startDate);
    const searchEndDate = new Date(endDate);

    return (
      shift.username === loggedInUsername && // Filter shifts only for the logged-in user
      shiftDate >= searchStartDate &&
      shiftDate <= searchEndDate
    );
  });

  displaySearchResults(searchResults);
  $("startDate").value = "";
  $("endDate").value = "";
};

  // Displays the search results in a table
  const displaySearchResults = searchResults => {
    const searchResultContainer = $("searchResultContainer");
    searchResultContainer.innerHTML = "";
  
    if (searchResults.length === 0) {
      searchResultContainer.textContent = "No results found.";
      return;
    }
  
    const table = document.createElement("table");
    table.className = "search-results-table";
    const tableHeader = table.createTHead();
    const headerRow = tableHeader.insertRow();
    const headers = ["Date", "Start Time", "End Time", "Hourly Wage", "Workplace", "Shift Slug", "Comments", "Total Profit"];
    headers.forEach(headerText => {
      const headerCell = document.createElement("th");
      headerCell.textContent = headerText;
      headerRow.appendChild(headerCell);
    });
  
    const tableBody = table.createTBody();
    searchResults.forEach(shift => {
      const row = tableBody.insertRow();
      const { date, startTime, endTime, hourlyWage, workplace, shiftSlug, comments, totalProfit } = shift;
      const values = [date, startTime, endTime, hourlyWage, workplace, shiftSlug, comments, totalProfit];
      values.forEach(value => {
        const cell = row.insertCell();
        cell.textContent = value;
      });
    });
  
    searchResultContainer.appendChild(table);
  };

  $("searchByNameButton")?.addEventListener("click", handleSearchByName);
  $("searchByDateButton")?.addEventListener("click", handleSearchByDate);


  // ===============================LOGOUT SECTION=================================
  // Logout functionality
  const handleLogout = () => {
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let shifts = JSON.parse(localStorage.getItem("shifts")) || [];
    let loggedInUsername = localStorage.getItem("loggedInUsername");

    // Remove the user from the users array
    let filteredUsers = users.filter(user => user.username !== loggedInUsername);
    localStorage.setItem("users", JSON.stringify(filteredUsers));

    // Remove all shifts
    let filteredShifts = shifts.filter(shift => shift.username !== loggedInUsername);
    localStorage.setItem("shifts", JSON.stringify(filteredShifts));

    localStorage.removeItem("loggedInUsername");

    window.location.href = "/login/login.html";
  };

  $("logoutButton")?.addEventListener("click", handleLogout);
});
