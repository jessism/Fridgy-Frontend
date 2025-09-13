import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import { useAuth } from '../features/auth/context/AuthContext';
import useInventoryAnalytics from '../hooks/useInventoryAnalytics';
import './InventoryUsagePage.css';

const InventoryUsagePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30'); // Default to last 30 days
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const { 
    analyticsData, 
    isLoading, 
    error, 
    changeDateRange 
  } = useInventoryAnalytics(parseInt(dateRange));


  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDateRangeChange = (e) => {
    const newRange = e.target.value;
    setDateRange(newRange);
    changeDateRange(parseInt(newRange));
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

  // Category color mapping
  const categoryColors = {
    'Vegetables': '#4fcf61',
    'Dairy': '#4A90E2',
    'Protein': '#50C878',
    'Grains': '#FF9F43',
    'Fruits': '#FF6B6B',
    'Other': '#9B59B6'
  };

  // Convert category breakdown to chart data
  const getCategoryChartData = () => {
    if (!analyticsData.categoryBreakdown || Object.keys(analyticsData.categoryBreakdown).length === 0) {
      return [];
    }

    return Object.entries(analyticsData.categoryBreakdown)
      .sort(([,a], [,b]) => b - a) // Sort by percentage descending
      .map(([category, percentage]) => ({
        category,
        percentage,
        color: categoryColors[category] || categoryColors.Other
      }));
  };

  // Calculate SVG path for donut chart segments
  const getDonutSegments = () => {
    const categoryData = getCategoryChartData();
    if (categoryData.length === 0) return [];

    const radius = 60;
    const centerX = 80;
    const centerY = 80;
    let currentAngle = -90; // Start at top

    return categoryData.map((item) => {
      const startAngle = currentAngle;
      const angleSize = (item.percentage / 100) * 360;
      const endAngle = currentAngle + angleSize;
      
      const startRadians = (startAngle * Math.PI) / 180;
      const endRadians = (endAngle * Math.PI) / 180;
      
      const largeArcFlag = angleSize > 180 ? 1 : 0;
      
      const x1 = centerX + radius * Math.cos(startRadians);
      const y1 = centerY + radius * Math.sin(startRadians);
      const x2 = centerX + radius * Math.cos(endRadians);
      const y2 = centerY + radius * Math.sin(endRadians);
      
      const pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      currentAngle = endAngle;
      
      return {
        ...item,
        pathData
      };
    });
  };

  if (error) {
    return (
      <div className="inventory-usage-page">
        <AppNavBar />
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Inventory Usage</h1>
            <p className="page-subtitle" style={{ color: '#ff6b6b' }}>
              {error === 'Authentication required. Please log in again.' 
                ? 'Please log in to view your analytics.'
                : 'Unable to load analytics data. Please try again later.'}
            </p>
          </div>
        </div>
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="inventory-usage-page">
      <AppNavBar />
      
      <div className="page-header">
        <div className="header-content">
          <div className="header-top">
            <h1 className="page-title">Inventory Usage</h1>
          </div>
          <p className="page-subtitle">
            Understand consumption patterns, reduce waste, and plan smarter shopping.
          </p>
        </div>
      </div>

      {/* Date Range Dropdown */}
      <div className="date-filter-section">
        <select 
          className="date-range-dropdown"
          value={dateRange}
          onChange={handleDateRangeChange}
          disabled={isLoading}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Usage Analytics Container */}
      <div className="usage-container">
        <div className="usage-card">
          <h3 className="usage-title">
            {isLoading ? 'Loading...' : `Last ${dateRange} Days`}
          </h3>
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
              <div className="percentage-text">
                {isLoading ? '...' : `${analyticsData.usagePercentage}%`}
              </div>
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
          <div className="analytics-card-value">
            {isLoading ? '...' : analyticsData.itemsConsumed}
          </div>
          <div className={`analytics-trend-badge ${
            calculateTrend(analyticsData.itemsConsumed, analyticsData.previousPeriod.itemsConsumed).direction === 'up' 
              ? 'positive' : 'negative'
          }`}>
            <span className="trend-arrow">
              {calculateTrend(analyticsData.itemsConsumed, analyticsData.previousPeriod.itemsConsumed).direction === 'up' ? '↗' : '↘'}
            </span>
            <span className="trend-text">
              {calculateTrend(analyticsData.itemsConsumed, analyticsData.previousPeriod.itemsConsumed).value}% vs prev
            </span>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-card-header">
            <span className="analytics-card-title">Items Wasted</span>
          </div>
          <div className="analytics-card-value">
            {isLoading ? '...' : analyticsData.itemsWasted}
          </div>
          <div className={`analytics-trend-badge ${
            calculateTrend(analyticsData.itemsWasted, analyticsData.previousPeriod.itemsWasted).direction === 'down' 
              ? 'positive' : 'negative'
          }`}>
            <span className="trend-arrow">
              {calculateTrend(analyticsData.itemsWasted, analyticsData.previousPeriod.itemsWasted).direction === 'up' ? '↗' : '↘'}
            </span>
            <span className="trend-text">
              {calculateTrend(analyticsData.itemsWasted, analyticsData.previousPeriod.itemsWasted).value}% vs prev
            </span>
          </div>
        </div>
      </div>

      {/* Est. Value Saved Container */}
      <div className="analytics-cards-container">
        <div className="analytics-card full-width">
          <div className="analytics-card-header">
            <span className="analytics-card-title">Est. Value Saved</span>
          </div>
          <div className="analytics-card-value">
            {isLoading ? '...' : `$${analyticsData.valueSaved.toFixed(2)}`}
          </div>
          <div className={`analytics-trend-badge ${
            calculateTrend(analyticsData.valueSaved, analyticsData.previousPeriod.valueSaved).direction === 'up' 
              ? 'positive' : 'negative'
          }`}>
            <span className="trend-arrow">
              {calculateTrend(analyticsData.valueSaved, analyticsData.previousPeriod.valueSaved).direction === 'up' ? '↗' : '↘'}
            </span>
            <span className="trend-text">
              {calculateTrend(analyticsData.valueSaved, analyticsData.previousPeriod.valueSaved).value}% vs prev
            </span>
          </div>
        </div>
      </div>

      {/* Consumption by Category */}
      <div className="category-consumption-container">
        <div className="category-card">
          <h3 className="category-title">Consumption by Category</h3>
          <div className="category-content">
            <div className="category-chart-wrapper">
              {!isLoading && getCategoryChartData().length > 0 ? (
                <svg width="160" height="160" viewBox="0 0 160 160" className="category-donut">
                  {getDonutSegments().map((segment, index) => (
                    <path
                      key={segment.category}
                      d={segment.pathData}
                      fill={segment.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              ) : (
                <div style={{ 
                  width: '160px', 
                  height: '160px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  {isLoading ? 'Loading...' : 'No data'}
                </div>
              )}
            </div>
            
            <div className="category-legend">
              {!isLoading && getCategoryChartData().map((item, index) => (
                <div key={item.category} className="legend-item">
                  <div className="legend-color" style={{backgroundColor: item.color}}></div>
                  <span className="legend-text">{item.category}: {item.percentage}%</span>
                </div>
              ))}
              {(isLoading || getCategoryChartData().length === 0) && (
                <div className="legend-item">
                  <span className="legend-text" style={{ color: '#666' }}>
                    {isLoading ? 'Loading categories...' : 'No consumption data available'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Most Used Items */}
      <div className="most-used-items-container">
        <div className="most-used-card">
          <h3 className="most-used-title">Most Used Items</h3>
          <div className="most-used-list">
            {!isLoading && analyticsData.mostUsedItems && analyticsData.mostUsedItems.length > 0 ? (
              analyticsData.mostUsedItems.map((item, index) => (
                <div key={index} className="most-used-item">
                  <span className="item-name">{item.itemName}</span>
                  <span className="item-stats">
                    {item.count}× {item.avgDays > 0 ? `• ${item.avgDays}d avg` : ''}
                  </span>
                </div>
              ))
            ) : (
              <div className="most-used-item">
                <span className="item-name" style={{ color: '#666' }}>
                  {isLoading ? 'Loading...' : 'No usage data available'}
                </span>
                <span className="item-stats">
                  {!isLoading && 'Start scanning meals to see data'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default InventoryUsagePage;