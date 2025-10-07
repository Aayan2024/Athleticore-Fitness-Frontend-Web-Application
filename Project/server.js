const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const USERS_FILE = path.join(__dirname, 'users.json');

// Helper: read and write user data
function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data);
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// SIGNUP Route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  writeUsers(users);
  res.json({ message: 'User registered successfully' });
});

// LOGIN Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();
  const user = users.find(u => u.username === username);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  res.json({ message: 'Login successful' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});