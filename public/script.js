const { Console } = require("console");
const { get } = require("http");

const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");

// const dummyTransactions = [
//   { id: 1, text: 'Flower', amount: -20 },
//   { id: 2, text: 'Salary', amount: 300 },
//   { id: 3, text: 'Book', amount: -10 },
//   { id: 4, text: 'Camera', amount: 150 }
// ];

const localStorageTransactions = JSON.parse(
  localStorage.getItem("transactions")
);

let transactions =
  localStorage.getItem("transactions") !== null ? localStorageTransactions : [];

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Please add a text and amount");
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value,
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);

    updateValues();

    updateLocalStorage();

    text.value = "";
    amount.value = "";
  }
}

// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
  // Get sign
  const sign = transaction.amount < 0 ? "-" : "+";

  const item = document.createElement("li");

  // Add class based on value
  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(
    transaction.amount
  )}</span> <button class="delete-btn" onclick="removeTransaction(${
    transaction.id
  })">x</button>
  `;

  list.appendChild(item);
}

// Update the balance, income and expense
function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `₹${income}`;
  money_minus.innerText = `₹${expense}`;
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);

  updateLocalStorage();

  init();
}

// Update local storage transactions
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Init app
function init() {
  list.innerHTML = "";

  transactions.forEach(addTransactionDOM);
  updateValues();
}

init();

form.addEventListener("submit", addTransaction);

// index

// Function to show login form and hide register form
function showLoginForm() {
  document.getElementById("loginForm").style.display = "block";
  document.getElementById("registerForm").style.display = "none";
}

// Function to show register form and hide login form
function showRegisterForm() {
  document.getElementById("registerForm").style.display = "block";
  document.getElementById("loginForm").style.display = "none";
}

// Function to handle login form submission
function login(event) {
  event.preventDefault(); // Prevent default form submission

  // Get username and password from the form
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Perform login logic (e.g., send request to server)
  fetch("https://findash-vhbb.onrender.com/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle login response
      if (data.token) {
        localStorage.setItem("token", data.token); // Save token to local storage
        // Redirect to dashboard.html
        // window.location.href = "https://localhost:3000/dashboard";
        checkAuthentication();
      } else {
        alert(data.error); // Display error message
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Function to handle register form submission
function register(event) {
  event.preventDefault(); // Prevent default form submission

  // Get new username and password from the form
  const newUsername = document.getElementById("newUsername").value;
  const newPassword = document.getElementById("newPassword").value;

  // Perform registration logic (e.g., send request to server)
  fetch("https://findash-vhbb.onrender.com/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: newUsername,
      password: newPassword,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle registration response
      if (data.token) {
        localStorage.setItem("token", data.token); // Save token to local storage
        // Redirect to dashboard.html
        // window.location.href = "https://localhost:3000/dashboard";
        checkAuthentication();
      } else {
        alert(data.error); // Display error message
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function checkAuthentication() {
  const token = localStorage.getItem("token"); // Get token from local storage

  // If token exists, user is authenticated
  if (token) {
    // Perform GET request to /dashboard endpoint
    fetch("https://findash-vhbb.onrender.com/dashboard", {
      method: "GET",
      headers: {
        Authorization: token, // Pass token in the Authorization header
      },
    })
      .then((response) => {
        // Check response status
        if (response.ok) {
          // User is authorized, redirect to dashboard.html
          window.location.href = "dashboard.html";
        } else {
          // User is not authorized, redirect to login page or handle accordingly
          window.location.href = "index.html";
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  } else {
    // Token does not exist, user is not authenticated
    window.location.href = "index.html"; // Redirect to login page
  }
}
