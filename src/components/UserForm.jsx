import React, { useState } from 'react';
import './UserForm.css';

function UserForm({ onSubmit }) {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [countyId, setCountyId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (age && sex && countyId) {
      onSubmit({ age, sex, countyId });
    }
  };

  return (
    <div className="user-form-container">
      <h2 className="form-title">Get Started</h2>
      <p className="form-subtitle">Tell us a bit about yourself to find the best insurance plans</p>

      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            min="0"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="sex">Sex</label>
          <select
            id="sex"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            required
          >
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="countyId">County ID</label>
          <input
            id="countyId"
            type="text"
            value={countyId}
            onChange={(e) => setCountyId(e.target.value)}
            placeholder="Enter your county ID"
            required
          />
        </div>

        <button type="submit" className="form-submit">
          Continue
        </button>
      </form>
    </div>
  );
}

export default UserForm;
