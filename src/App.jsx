import { useState } from 'react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    currentPlan: '',
    zipCode: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitted:', formData);
    // You can add API calls or validation here
  };

  return (
    <div className="form-container">
      <h2>Enter Your Plan Info</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Current Plan:
          <input
            type="text"
            name="currentPlan"
            value={formData.currentPlan}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          ZIP Code:
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            pattern="\d{5}"
            title="Enter a 5-digit ZIP Code"
            required
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;