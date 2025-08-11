import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Destinations.css';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameters from SearchInput
  const getQueryParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return {
      startingCity: params.get('startingCity') || 'New York',
      startDate: params.get('startDate') || '2024-06-01',
      endDate: params.get('endDate') || '2024-06-15',
      flightBudget: params.get('flightBudget') || '800',
      hotelBudget: params.get('hotelBudget') || '150',
      activitiesBudget: params.get('activitiesBudget') || '300',
      totalBudget: params.get('totalBudget') || '1250',
      vacationType: params.get('vacationType') || 'Beach',
      numberOfPeople: params.get('numberOfPeople') || '2'
    };
  }, [location.search]);

  // Fetch destinations from backend API
  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = getQueryParams();
      
      // Build query string for API call
      const queryString = new URLSearchParams(queryParams).toString();
      const response = await fetch(`http://localhost:5000/api/v2/discovery?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Get top 5 destinations
        setDestinations(data.data.destinations.slice(0, 5));
      } else {
        throw new Error(data.message || 'Failed to fetch destinations');
      }
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [getQueryParams]);

  // Fetch detailed destination info
  const fetchDestinationDetails = async (destinationId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/v2/details/${destinationId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedDestination(data.data);
        setShowDetails(true);
      } else {
        throw new Error(data.message || 'Failed to fetch destination details');
      }
    } catch (err) {
      console.error('Error fetching destination details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const handleCardClick = (destinationId) => {
    fetchDestinationDetails(destinationId);
  };

  const closeDetails = () => {
    setShowDetails(false);
    setSelectedDestination(null);
  };

  const calculateTotalCost = (destination) => {
    const queryParams = getQueryParams();
    const days = Math.ceil((new Date(queryParams.endDate) - new Date(queryParams.startDate)) / (1000 * 60 * 60 * 24));
    const people = parseInt(queryParams.numberOfPeople);
    
    // Estimate costs based on destination data
    const flightCost = parseInt(queryParams.flightBudget) * people;
    const hotelCost = (destination.accommodation?.midRange || 100) * days;
    const activitiesCost = parseInt(queryParams.activitiesBudget) * people;
    
    return flightCost + hotelCost + activitiesCost;
  };

  if (loading && !showDetails) {
    return (
      <div className="destinations-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Finding amazing destinations for you...</p>
        </div>
      </div>
    );
  }

  if (error && !destinations.length) {
    return (
      <div className="destinations-container">
        <div className="error">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/search')} className="retry-btn">
            Try New Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="destinations-container">
      <div className="destinations-header">
        <h1>Top Destinations for You</h1>
        <p>Based on your preferences, here are the perfect destinations for your trip!</p>
        <button onClick={() => navigate('/search')} className="new-search-btn">
          New Search
        </button>
      </div>

      <div className="destinations-grid">
        {destinations.map((destination) => (
          <div 
            key={destination.id} 
            className="destination-card"
            onClick={() => handleCardClick(destination.id)}
          >
            <div className="card-image">
              <img 
                src={destination.images?.[0] || '/placeholder-destination.jpg'} 
                alt={destination.name}
                onError={(e) => {
                  e.target.src = '/placeholder-destination.jpg';
                }}
              />
              <div className="card-overlay">
                <span className="destination-type">{destination.type}</span>
              </div>
            </div>
            
            <div className="card-content">
              <h3 className="destination-name">{destination.name}</h3>
              <p className="destination-country">{destination.country}</p>
              <p className="destination-description">
                {destination.description?.substring(0, 120)}...
              </p>
              
              <div className="card-details">
                <div className="total-cost">
                  <span className="cost-label">Estimated Total Cost</span>
                  <span className="cost-value">${calculateTotalCost(destination).toLocaleString()}</span>
                </div>
                
                <div className="activities-preview">
                  <span className="activities-label">Popular Activities</span>
                  <div className="activities-list">
                    {destination.highlights?.slice(0, 2).map((activity, index) => (
                      <span key={index} className="activity-tag">
                        {activity.length > 30 ? activity.substring(0, 30) + '...' : activity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="card-footer">
                <div className="rating">
                  <span className="stars">{'★'.repeat(Math.floor(destination.rating || 4))}</span>
                  <span className="rating-value">{destination.rating || 4.0}</span>
                </div>
                <button className="view-details-btn">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Destination Details Modal */}
      {showDetails && selectedDestination && (
        <div className="modal-overlay" onClick={closeDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedDestination.name}</h2>
              <button className="close-btn" onClick={closeDetails}>×</button>
            </div>
            
            <div className="modal-body">
              {loading ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <p>Loading destination details...</p>
                </div>
              ) : (
                <>
                  <div className="destination-images">
                    <img 
                      src={selectedDestination.images?.[0] || '/placeholder-destination.jpg'} 
                      alt={selectedDestination.name}
                      className="main-image"
                    />
                  </div>
                  
                  <div className="details-content">
                    <div className="description-section">
                      <h3>About {selectedDestination.name}</h3>
                      <p>{selectedDestination.detailedDescription || selectedDestination.description}</p>
                    </div>

                    {/* Flight Information */}
                    <div className="section">
                      <h3>✈️ Flight Information</h3>
                      <div className="flight-details">
                        <div className="flight-item">
                          <span className="label">Round Trip Duration:</span>
                          <span className="value">{selectedDestination.flightInfo?.averageDuration || '12-15 hours'}</span>
                        </div>
                        <div className="flight-item">
                          <span className="label">Average Cost:</span>
                          <span className="value">{selectedDestination.flightInfo?.averageCost || '$600-900'}</span>
                        </div>
                        <div className="flight-item">
                          <span className="label">Major Airports:</span>
                          <span className="value">{selectedDestination.flightInfo?.majorAirports?.join(', ') || 'International Airport'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Hotel Information */}
                    <div className="section">
                      <h3>🏨 Accommodation</h3>
                      <div className="hotel-details">
                        <div className="price-ranges">
                          <div className="price-item">
                            <span className="category">Budget:</span>
                            <span className="price">{selectedDestination.accommodation?.budget || '$30-80/night'}</span>
                          </div>
                          <div className="price-item">
                            <span className="category">Mid-Range:</span>
                            <span className="price">{selectedDestination.accommodation?.midRange || '$80-200/night'}</span>
                          </div>
                          <div className="price-item">
                            <span className="category">Luxury:</span>
                            <span className="price">{selectedDestination.accommodation?.luxury || '$200-500/night'}</span>
                          </div>
                        </div>
                        
                        {selectedDestination.accommodation?.recommendations && (
                          <div className="hotel-recommendations">
                            <h4>Recommended Hotels:</h4>
                            <ul>
                              {selectedDestination.accommodation.recommendations.map((hotel, index) => (
                                <li key={index}>{hotel}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activities Information */}
                    <div className="section">
                      <h3>🎯 Activities & Experiences</h3>
                      <div className="activities-details">
                        {selectedDestination.activities?.map((activity, index) => (
                          <div key={index} className="activity-item">
                            <h4>{activity.name}</h4>
                            <div className="activity-info">
                              <span className="cost">{activity.cost}</span>
                              <span className="duration">{activity.duration}</span>
                            </div>
                            <p>{activity.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Food & Dining */}
                    {selectedDestination.foodAndDining && (
                      <div className="section">
                        <h3>🍽️ Food & Dining</h3>
                        <div className="dining-details">
                          <p><strong>Average Meal Cost:</strong> {selectedDestination.foodAndDining.averageMealCost}</p>
                          <div className="must-try">
                            <h4>Must-Try Dishes:</h4>
                            <div className="dishes">
                              {selectedDestination.foodAndDining.mustTryDishes?.map((dish, index) => (
                                <span key={index} className="dish-tag">{dish}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Destinations;
