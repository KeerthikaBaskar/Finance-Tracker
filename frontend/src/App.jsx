import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// ✅ Make sure your .env file has: REACT_APP_API_URL=https://finance-tracker-9n7a.onrender.com/api
const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'expense',
    date: new Date().toISOString().split('T')[0]
  });

  // 🔁 Fetch data whenever selected date changes
  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [selectedDate]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/transactions/date/${selectedDate}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/summary/date/${selectedDate}`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  // ✅ Keep date in sync with form
  useEffect(() => {
    setFormData(prev => ({ ...prev, date: selectedDate }));
  }, [selectedDate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || !formData.category) {
      alert('Please fill in all fields');
      return;
    }

    try {
      // ✅ Ensure correct date is sent
      const newTransaction = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: selectedDate
      };

      await axios.post(`${API_URL}/transactions`, newTransaction);

      // Reset form but keep the same date
      setFormData({
        title: '',
        amount: '',
        category: '',
        type: 'expense',
        date: selectedDate
      });

      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${API_URL}/transactions/${id}`);
        fetchTransactions();
        fetchSummary();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Personal Finance Tracker</h1>

        <div className="date-selector">
          <label>Select Date: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="summary-cards">
          <div className="summary-card income">
            <h3>Total Income</h3>
            <p className="amount">₹{summary.totalIncome.toFixed(2)}</p>
          </div>
          <div className="summary-card expense">
            <h3>Total Expense</h3>
            <p className="amount">₹{summary.totalExpense.toFixed(2)}</p>
          </div>
          <div className="summary-card balance">
            <h3>Balance</h3>
            <p className="amount">₹{summary.balance.toFixed(2)}</p>
          </div>
        </div>

        <div className="transaction-form">
          <h2>Add Transaction</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                step="0.01"
                required
              />
            </div>

           <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Outing">Outing</option>
                <option value="Salary">Salary</option>
                <option value="Travel">Travel</option>
                <option value="Income Mom">Income Mom</option>
                <option value="Shopping">Shopping</option>
                <option value="Mobile Recharge">Mobile Recharge</option>
                <option value="Expense">Expense</option>
              </select>
            </div>


            <div className="form-group">
              <label>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <button type="submit" className="btn-submit">Add Transaction</button>
          </form>
        </div>

        <div className="transactions-list">
          <h2>Transactions for {selectedDate}</h2>
          {transactions.length === 0 ? (
            <p className="no-transactions">No transactions for this date</p>
          ) : (
            <div className="transaction-items">
              {transactions.map(transaction => (
                <div
                  key={transaction._id}
                  className={`transaction-item ${transaction.type}`}
                >
                  <div className="transaction-info">
                    <h4>{transaction.title}</h4>
                    <span className="category">{transaction.category}</span>
                  </div>
                  <div className="transaction-amount">
                    <span className={transaction.type}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;