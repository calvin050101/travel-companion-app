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

const transactionSchema = new mongoose.Schema({
  user_email: String,
  place_name: String,
  item_name: String,
  item_price: Number,
  quantity: Number,
  order_id: String
});

const User = mongoose.model('User', userSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

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

app.post('/checkout', async (req, res) => {
  const { email, cart_items, place_name } = req.body;
  const order_id = require('crypto').randomUUID();

  for (const item of cart_items) {
    await Transaction.create({
      user_email: email,
      place_name,
      item_name: item.name,
      item_price: item.price,
      quantity: item.quantity,
      order_id
    });
  }

  // Generate QR and send email
  const qrPath = await QRCode.toDataURL(order_id);
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.PYTHON_BACKEND_SENDER_EMAIL_CREDENTIALS,
      pass: process.env.PYTHON_BACKEND_SENDER_PASSWORD_CREDENTIALS
    }
  });

  const message = {
    from: process.env.PYTHON_BACKEND_SENDER_EMAIL_CREDENTIALS,
    to: email,
    subject: `Order Confirmation - ${order_id}`,
    html: `<p>Thanks for your order at ${place_name}</p><img src="${qrPath}" alt="QR Code" />`
  };

  transporter.sendMail(message, (err, info) => {
    if (err) {
      console.error('Email failed:', err);
      return res.status(500).json({ message: 'Email failed' });
    }
    res.status(200).json({ message: 'Checkout successful, email sent' });
  });
});

// === Start Server ===
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
