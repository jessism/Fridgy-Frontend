import React, { createContext, useContext, useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PriceContext = createContext({
  price: 333, // cents
  amount: 3.33, // dollars
  formatted: '$3.33',
  interval: 'month',
  formattedWithInterval: '$3.33/month',
  loading: true
});

export function PriceProvider({ children }) {
  const [priceData, setPriceData] = useState({
    price: 333,
    amount: 3.33,
    formatted: '$3.33',
    interval: 'month',
    formattedWithInterval: '$3.33/month',
    loading: true
  });

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/subscriptions/price`);
        if (response.ok) {
          const data = await response.json();
          setPriceData({
            ...data,
            loading: false
          });
        } else {
          setPriceData(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error fetching subscription price:', error);
        setPriceData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchPrice();
  }, []);

  return (
    <PriceContext.Provider value={priceData}>
      {children}
    </PriceContext.Provider>
  );
}

export function usePrice() {
  return useContext(PriceContext);
}

export default PriceContext;
