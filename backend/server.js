const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Middleware
app.use(cors({
  origin: "https://finance-tracker-frontend-ggbk.onrender.com"
}));
app.use(express.json());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Transaction Schema
const transactionSchema = new mongoose.Schema({
  title: String,
  amount: Number,
  category: String,
  type: { type: String, enum: ['income', 'expense'] },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);

// ✅ Routes

// Fetch all
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch by date
app.get('/api/transactions/date/:date', async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    const endDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await Transaction.find({
      date: { $gte: startDate, $lte: endDate }
    });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Summary for a date
app.get('/api/summary/date/:date', async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    const endDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const transactions = await Transaction.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.totalIncome += t.amount;
      else acc.totalExpense += t.amount;
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    summary.balance = summary.totalIncome - summary.totalExpense;
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const { title, amount, category, type, date } = req.body;
    const transaction = new Transaction({
      title,
      amount,
      category,
      type,
      date: new Date(date)
    });
    const saved = await transaction.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete
app.delete('/api/transactions/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
