import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../features/auth/context/AuthContext';
import './InventoryUsagePage.css';

const InventoryUsagePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('7'); // Default to last 7 days
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [analyticsData, setAnalyticsData] = useState({
    itemsConsumed: 0,
    itemsWasted: 0,
    valueSaved: 0,
    usagePercentage: 0,
    previousPeriod: {
      itemsConsumed: 0,
      itemsWasted: 0,
      valueSaved: 0,
      usagePercentage: 0
    }
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mock data for now - will be replaced with API call
  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      // Mock data based on date range
      const mockData = {
        '7': {
          itemsConsumed: 42,
          itemsWasted: 3,
          valueSaved: 65.80,
          usagePercentage: 93,
          previousPeriod: {
            itemsConsumed: 38,
            itemsWasted: 5,
            valueSaved: 52.30,
            usagePercentage: 88
          }
        },
        '30': {
          itemsConsumed: 142,
          itemsWasted: 13,
          valueSaved: 218.90,
          usagePercentage: 91,
          previousPeriod: {
            itemsConsumed: 128,
            itemsWasted: 19,
            valueSaved: 195.40,
            usagePercentage: 87
          }
        },
        '90': {
          itemsConsumed: 387,
          itemsWasted: 41,
          valueSaved: 612.50,
          usagePercentage: 90,
          previousPeriod: {
            itemsConsumed: 362,
            itemsWasted: 48,
            valueSaved: 580.20,
            usagePercentage: 88
          }
        }
      };
      setAnalyticsData(mockData[dateRange]);
      setIsLoading(false);
    }, 500);
  }, [dateRange]);

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const handleBackClick = () => {
    navigate('/home');
  };

  const calculateTrend = (current, previous) => {
    if (previous === 0) return { value: 0, direction: 'neutral' };
    const percentChange = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(percentChange).toFixed(1),
      direction: percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral'
    };
  };

  const MetricCard = ({ title, value, unit, subtitle, trend, isPositiveTrend, icon, isMobile }) => {
    const trendData = calculateTrend(value, trend);
    const trendClass = isPositiveTrend 
      ? (trendData.direction === 'up' ? 'positive' : 'negative')
      : (trendData.direction === 'down' ? 'positive' : 'negative');

    return (
      <div className="metric-card">
        <div className="metric-header">
          <span className="metric-title">{title}</span>
          <span className="metric-icon">{icon}</span>
        </div>
        <div className="metric-value">
          {unit === '$' && <span className="metric-unit">{unit}</span>}
          <span className="metric-number">{value}</span>
          {unit === '%' && <span className="metric-unit">{unit}</span>}
        </div>
        {subtitle && !isMobile && <div className="metric-subtitle">{subtitle}</div>}
        {!isMobile && trendData.direction !== 'neutral' && (
          <div className={`metric-trend ${trendClass}`}>
            <span className="trend-arrow">
              {trendData.direction === 'up' ? '↑' : '↓'}
            </span>
            <span className="trend-value">{trendData.value}% vs prev</span>
          </div>
        )}
      </div>
    );
  };

  // Donut Chart Component
  const DonutChart = ({ percentage, label }) => {
    const circumference = 2 * Math.PI * 90; // radius = 90
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const wastedPercentage = 100 - percentage;

    return (
      <div className="donut-chart-container">
        <h2 className="donut-title">This Month</h2>
        <div className="donut-chart">
          <svg width="240" height="240" viewBox="0 0 240 240">
            {/* Background circle (wasted - red) */}
            <circle
              cx="120"
              cy="120"
              r="90"
              fill="none"
              stroke="#ff6b6b"
              strokeWidth="30"
            />
            {/* Foreground arc (used - green) */}
            <circle
              cx="120"
              cy="120"
              r="90"
              fill="none"
              stroke="#4fcf61"
              strokeWidth="30"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
              transform="rotate(-90 120 120)"
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          </svg>
          <div className="donut-center">
            <div className="donut-percentage">{percentage}%</div>
            <div className="donut-label">{label}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="inventory-usage-page">
      <AppNavBar />
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-top">
            <button 
              className="back-button"
              onClick={handleBackClick}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className="page-title">Inventory Usage</h1>
          </div>
          <p className="page-subtitle">
            Understand consumption patterns, reduce waste, and plan smarter shopping.
          </p>
        </div>
      </div>

      {/* Date Range Dropdown - Left aligned */}
      <div className="date-filter-section">
        <select 
          className="date-range-dropdown"
          value={dateRange}
          onChange={handleDateRangeChange}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Usage Analytics Container */}
      <div className="usage-container">
        <div className="usage-card">
          <h3 className="usage-title">This Month</h3>
          <div className="donut-chart-wrapper">
            <svg width="200" height="200" viewBox="0 0 200 200" className="donut-svg">
              {/* Background circle (wasted - red) */}
              <circle
                cx="100"
                cy="100"
                r="75"
                fill="none"
                stroke="#FF6B6B"
                strokeWidth="30"
              />
              {/* Foreground arc (used - green) */}
              <circle
                cx="100"
                cy="100"
                r="75"
                fill="none"
                stroke="#4fcf61"
                strokeWidth="30"
                strokeDasharray={`${(analyticsData.usagePercentage / 100) * (2 * Math.PI * 75)} ${2 * Math.PI * 75}`}
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            </svg>
            <div className="donut-content">
              <div className="percentage-text">{analyticsData.usagePercentage}%</div>
              <div className="usage-text">used before expiry</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="analytics-cards-container">
        <div className="analytics-card">
          <div className="analytics-card-header">
            <span className="analytics-card-title">Items Consumed</span>
          </div>
          <div className="analytics-card-value">{analyticsData.itemsConsumed}</div>
          <div className="analytics-trend-badge positive">
            <span className="trend-arrow">↗</span>
            <span className="trend-text">+9.4% vs prev</span>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-card-header">
            <span className="analytics-card-title">Items Wasted</span>
          </div>
          <div className="analytics-card-value">{analyticsData.itemsWasted}</div>
          <div className="analytics-trend-badge negative">
            <span className="trend-arrow">↘</span>
            <span className="trend-text">-18% vs prev</span>
          </div>
        </div>
      </div>

      {/* Est. Value Saved Container */}
      <div className="analytics-cards-container">
        <div className="analytics-card full-width">
          <div className="analytics-card-header">
            <span className="analytics-card-title">Est. Value Saved</span>
          </div>
          <div className="analytics-card-value">${analyticsData.valueSaved.toFixed(2)}</div>
          <div className="analytics-trend-badge positive">
            <span className="trend-arrow">↗</span>
            <span className="trend-text">+25.8% vs prev</span>
          </div>
        </div>
      </div>

      {/* Consumption by Category */}
      <div className="category-consumption-container">
        <div className="category-card">
          <h3 className="category-title">Consumption by Category</h3>
          <div className="category-content">
            <div className="category-chart-wrapper">
              <svg width="160" height="160" viewBox="0 0 160 160" className="category-donut">
                {/* Vegetables - 35% - Green */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#4fcf61"
                  strokeWidth="24"
                  strokeDasharray={`${(35 / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                  strokeDashoffset="0"
                  transform="rotate(-90 80 80)"
                />
                {/* Dairy - 21% - Blue */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#4A90E2"
                  strokeWidth="24"
                  strokeDasharray={`${(21 / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                  strokeDashoffset={`-${(35 / 100) * (2 * Math.PI * 60)}`}
                  transform="rotate(-90 80 80)"
                />
                {/* Protein - 18% - Teal */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#50C878"
                  strokeWidth="24"
                  strokeDasharray={`${(18 / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                  strokeDashoffset={`-${((35 + 21) / 100) * (2 * Math.PI * 60)}`}
                  transform="rotate(-90 80 80)"
                />
                {/* Grains - 15% - Orange */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#FF9F43"
                  strokeWidth="24"
                  strokeDasharray={`${(15 / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                  strokeDashoffset={`-${((35 + 21 + 18) / 100) * (2 * Math.PI * 60)}`}
                  transform="rotate(-90 80 80)"
                />
                {/* Fruits - 11% - Red */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  fill="none"
                  stroke="#FF6B6B"
                  strokeWidth="24"
                  strokeDasharray={`${(11 / 100) * (2 * Math.PI * 60)} ${2 * Math.PI * 60}`}
                  strokeDashoffset={`-${((35 + 21 + 18 + 15) / 100) * (2 * Math.PI * 60)}`}
                  transform="rotate(-90 80 80)"
                />
              </svg>
            </div>
            
            <div className="category-legend">
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#4fcf61'}}></div>
                <span className="legend-text">Veg.: 35%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#4A90E2'}}></div>
                <span className="legend-text">Dairy: 21%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#50C878'}}></div>
                <span className="legend-text">Protein: 18%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#FF9F43'}}></div>
                <span className="legend-text">Grains: 15%</span>
              </div>
              <div className="legend-item">
                <div className="legend-color" style={{backgroundColor: '#FF6B6B'}}></div>
                <span className="legend-text">Fruits: 11%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Most Used Items */}
      <div className="most-used-items-container">
        <div className="most-used-card">
          <h3 className="most-used-title">Most Used Items</h3>
          <div className="most-used-list">
            <div className="most-used-item">
              <span className="item-name">Milk</span>
              <span className="item-stats">7× • 2d avg</span>
            </div>
            <div className="most-used-item">
              <span className="item-name">Bananas</span>
              <span className="item-stats">6× • 3d avg</span>
            </div>
            <div className="most-used-item">
              <span className="item-name">Eggs</span>
              <span className="item-stats">5× • 4d avg</span>
            </div>
            <div className="most-used-item">
              <span className="item-name">Chicken</span>
              <span className="item-stats">4× • 2d avg</span>
            </div>
            <div className="most-used-item">
              <span className="item-name">Bread</span>
              <span className="item-stats">3× • 3d avg</span>
            </div>
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default InventoryUsagePage;