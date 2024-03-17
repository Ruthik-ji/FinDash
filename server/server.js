const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path"); // Import the path module

const app = express();
const PORT = 3000;

// Secret key for JWT signing and verification
const secretKey = "wertyuikjhbvcxdfghjknbvcfghj";

// Sample user data (replace with your actual user authentication logic)
let users = [];

// Middleware to parse JSON bodies
app.use(express.json());

// Use the cors middleware
app.use(cors());

app.use(express.static(path.join(__dirname, "../public")));

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  // Find the user with the provided username
  const user = users.find((u) => u.username === username);

  // Check if the user exists and the password matches
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid username or password." });
  }

  // Generate JWT token
  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });

  // Send the token as response
  res.json({ token });
  // console.log(token);
});

// Registration endpoint
app.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  // Check if the username is already taken
  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ error: "Username is already taken." });
  }

  // Add the new user to the users array
  const newUser = {
    id: users.length + 1,
    username: username,
    password: password,
  };
  users.push(newUser);
  // console.log(newUser);

  // Generate JWT token
  const token = jwt.sign(
    { id: newUser.id, username: newUser.username },
    secretKey,
    { expiresIn: "1h" }
  );

  // Send the token as response
  res.json({ token });
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized. Token is missing." });
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Forbidden. Invalid token." });
    }

    // Store the decoded token in the request object
    req.user = decoded;
    next();
  });
}

// Protected route (requires valid JWT token)
app.get("/dashboard", verifyToken, (req, res) => {
  // You can access user details from req.user
  res.sendFile(path.join(__dirname, "../public/dashboard.html"));
});

app.use((req, res, next) => {
  if (req.url.startsWith("/dashboard") && !req.headers.authorization) {
    res.redirect("/login"); // Redirect to the login page
  } else {
    next();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is up and running...`);
});
