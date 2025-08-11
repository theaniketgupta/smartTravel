import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchInput.css";

const SearchInput = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startingCity: "",
    startDate: "",
    endDate: "",
    flightBudget: "",
    hotelBudget: "",
    activitiesBudget: "",
    vacationType: "",
    numberOfPeople: 1,
  });

  const vacationTypes = [
    "Beach",
    "Hiking",
    "Casinos",
    "Family Fun",
    "Food",
    "Culture",
    "Adventure",
    "Relaxation",
    "City Break",
    "Wildlife",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.startingCity ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.flightBudget ||
      !formData.hotelBudget ||
      !formData.activitiesBudget ||
      !formData.vacationType
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert("End date must be after start date");
      return;
    }

    const totalBudget =
      parseFloat(formData.flightBudget) +
      parseFloat(formData.hotelBudget) +
      parseFloat(formData.activitiesBudget);

    // Create query parameters from form data
    const queryParams = new URLSearchParams({
      startingCity: formData.startingCity,
      startDate: formData.startDate,
      endDate: formData.endDate,
      flightBudget: formData.flightBudget,
      hotelBudget: formData.hotelBudget,
      activitiesBudget: formData.activitiesBudget,
      totalBudget: totalBudget.toString(),
      vacationType: formData.vacationType,
      numberOfPeople: formData.numberOfPeople.toString(),
    });

    console.log("Search Data:", {
      ...formData,
      totalBudget: totalBudget,
    });

    // Navigate to destinations page with query parameters
    navigate(`/destinations?${queryParams.toString()}`);
  };

  const getTotalBudget = () => {
    const flight = parseFloat(formData.flightBudget) || 0;
    const hotel = parseFloat(formData.hotelBudget) || 0;
    const activities = parseFloat(formData.activitiesBudget) || 0;
    return flight + hotel + activities;
  };

  return (
    <div className="search-input-container">
      <h1>Plan Your Perfect Trip</h1>
      <p>
        Tell us about your dream vacation and we'll help you find the best
        options!
      </p>

      <form onSubmit={handleSubmit} className="search-form">
        {/* Starting City */}
        <div className="form-group">
          <label htmlFor="startingCity">Starting City *</label>
          <input
            type="text"
            id="startingCity"
            name="startingCity"
            value={formData.startingCity}
            onChange={handleInputChange}
            placeholder="e.g., New York, Los Angeles, Chicago"
            required
          />
        </div>

        {/* Travel Dates */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">Start Date *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              min={new Date().toISOString().split("T")[0]}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date *</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              min={formData.startDate || new Date().toISOString().split("T")[0]}
              required
            />
          </div>
        </div>

        {/* Budget Section */}
        <div className="budget-section">
          <h3>Budget Breakdown</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="flightBudget">Flight Budget ($) *</label>
              <input
                type="number"
                id="flightBudget"
                name="flightBudget"
                value={formData.flightBudget}
                onChange={handleInputChange}
                placeholder="500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="hotelBudget">Hotel Budget ($) *</label>
              <input
                type="number"
                id="hotelBudget"
                name="hotelBudget"
                value={formData.hotelBudget}
                onChange={handleInputChange}
                placeholder="800"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="activitiesBudget">Activities Budget ($) *</label>
              <input
                type="number"
                id="activitiesBudget"
                name="activitiesBudget"
                value={formData.activitiesBudget}
                onChange={handleInputChange}
                placeholder="300"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {getTotalBudget() > 0 && (
            <div className="total-budget">
              <strong>Total Budget: ${getTotalBudget().toFixed(2)}</strong>
              <span className="per-person">
                (${(getTotalBudget() / formData.numberOfPeople).toFixed(2)} per
                person)
              </span>
            </div>
          )}
        </div>

        {/* Vacation Type */}
        <div className="form-group">
          <label htmlFor="vacationType">Vacation Type *</label>
          <select
            id="vacationType"
            name="vacationType"
            value={formData.vacationType}
            onChange={handleInputChange}
            required
          >
            <option value="">Select vacation type...</option>
            {vacationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Number of People */}
        <div className="form-group">
          <label htmlFor="numberOfPeople">Number of Travelers *</label>
          <input
            type="number"
            id="numberOfPeople"
            name="numberOfPeople"
            value={formData.numberOfPeople}
            onChange={handleInputChange}
            min="1"
            max="20"
            required
          />
        </div>

        <button type="submit" className="search-button">
          Search Travel Options
        </button>
      </form>
    </div>
  );
};

export default SearchInput;
