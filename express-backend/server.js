const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const QRCode = require('qrcode');

dotenv.config();

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// === Mongoose Schemas ===
const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true },
  password_hash: String,
  record_id: String
});

const bookmarkSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  name: String,
  address: String,
  web_url: String,
  list: String
});

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
const User = mongoose.model('User', userSchema);

// === Helper Functions ===
function encryptPassword(salt, password) {
  return bcrypt.hashSync(salt + password, 10);
}

function validatePassword(salt, password, hash) {
  return bcrypt.compareSync(salt + password, hash);
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/check-auth', authenticateToken, (req, res) => {
    res.status(200).json({ authenticated: true });
});

app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;

    const user = await User.findOne({ email }, {
      _id: 0,
      first_name: 1,
      last_name: 1,
      email: 1
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/bookmarks/lists', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const lists = await Bookmark.distinct('list', { userEmail });

    res.status(200).json({ lists });
  } catch (error) {
    console.error('Failed to fetch lists:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const bookmarks = await Bookmark.find({ userEmail });
    res.status(200).json(bookmarks);
  } catch (error) {
    console.error('Failed to fetch bookmarks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/bookmarks', authenticateToken, async (req, res) => {
  const { name, address, list } = req.body;
  const userEmail = req.user.email;

  try {
    const deleted = await Bookmark.deleteOne({ userEmail, name, address, list });
    if (deleted.deletedCount === 0) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }
    res.status(200).json({ message: 'Bookmark deleted successfully' });
  } catch (err) {
    console.error('Error deleting bookmark:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/bookmarks/group', authenticateToken, async (req, res) => {
  const { list } = req.body;
  const userEmail = req.user.email;

  try {
    const result = await Bookmark.deleteMany({ userEmail, list });
    res.status(200).json({ message: 'Bookmark list deleted', deletedCount: result.deletedCount });
  } catch (err) {
    console.error('Error deleting bookmark list:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.patch('/api/user/update-profile', authenticateToken, async (req, res) => {
  const email = req.user.email;
  const { first_name, last_name } = req.body;

  try {
    await User.updateOne({ email }, { $set: { first_name, last_name } });
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Profile update failed:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

app.patch('/api/user/change-password', authenticateToken, async (req, res) => {
  const email = req.user.email;
  const { new_password } = req.body;

  if (!new_password) {
    return res.status(400).json({ message: 'New password is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const newHash = bcrypt.hashSync(user.record_id + new_password, 10);

    await User.updateOne({ email }, { $set: { password_hash: newHash } });

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/bookmarks/group', authenticateToken, async (req, res) => {
  const { oldName, newName } = req.body;
  const userEmail = req.user.email;

  try {
    const result = await Bookmark.updateMany(
      { userEmail, list: oldName },
      { $set: { list: newName } }
    );
    res.status(200).json({ message: 'List renamed', modified: result.nModified });
  } catch (err) {
    console.error('Rename failed:', err);
    res.status(500).json({ message: 'Error renaming list' });
  }
});

// === Routes ===
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const recordId = require('crypto').randomBytes(16).toString('hex');
  const password_hash = encryptPassword(recordId, password);

  try {
    await User.create({ first_name: firstName, last_name: lastName, email, password_hash, record_id: recordId });
    res.status(200).json({ message: 'Registration Successful' });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !validatePassword(user.record_id, password, user.password_hash)) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.status(200).json({ message: 'Login successful', access_token: token });
});

app.post('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { name, address, web_url, list } = req.body;

    // Check if the bookmark already exists
    const existing = await Bookmark.findOne({ userEmail, name, address, list });
    if (existing) {
      return res.status(409).json({ message: 'Bookmark already exists in this list' });
    }

    // Create and save new bookmark
    const newBookmark = new Bookmark({
      userEmail,
      name,
      address,
      web_url,
      list
    });

    await newBookmark.save();
    res.status(201).json({ message: 'Bookmark saved successfully' });
  } catch (error) {
    console.error('Bookmark save error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === Start Server ===
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
