import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { EditIcon, DeleteIcon } from '../components/icons';
import './HomePage.css'; // Now in the same directory

const InventoryPage = () => {
  const [inventoryItems] = useState([
    {
      id: 1,
      category: 'Vegetables',
      itemName: 'Tomatoes',
      quantity: '2 kg',
      expiryDate: '2024-08-20',
      status: 'Good'
    },
    {
      id: 2,
      category: 'Protein',
      itemName: 'Chicken Breast',
      quantity: '500g',
      expiryDate: '2024-08-18',
      status: 'Low Stock'
    },
    {
      id: 3,
      category: 'Dairy',
      itemName: 'Milk',
      quantity: '1L',
      expiryDate: '2024-08-16',
      status: 'Expiring Soon'
    },
    {
      id: 4,
      category: 'Fruits',
      itemName: 'Apples',
      quantity: '6 pieces',
      expiryDate: '2024-08-25',
      status: 'Good'
    },
    {
      id: 5,
      category: 'Grains',
      itemName: 'Rice',
      quantity: '2kg',
      expiryDate: '2025-01-15',
      status: 'Good'
    },
    {
      id: 6,
      category: 'Dairy',
      itemName: 'Cheese',
      quantity: '200g',
      expiryDate: '2024-08-14',
      status: 'Expired'
    }
  ]);

  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Good':
        return '#4CAF50';
      case 'Low Stock':
        return '#FF9800';
      case 'Expiring Soon':
        return '#FF5722';
      case 'Expired':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysUntilExpiry = (dateString) => {
    const expiryDate = new Date(dateString);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="homepage">
      <Navbar />

      {/* Inventory Content */}
      <div style={{paddingTop: '100px', minHeight: '100vh', background: 'white'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
          {/* Header Section */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--header-font)', 
                fontSize: '2.5rem', 
                color: 'var(--header-color)', 
                marginBottom: '0.5rem'
              }}>
                Inventory Overview
          </h1>
              <p style={{
                fontFamily: 'var(--description-font)', 
                fontSize: '1.1rem', 
                color: 'var(--description-color)'
              }}>
            Manage your food items and track expiration dates
          </p>
            </div>
            
            {/* Search and Add Item */}
            <div style={{
              display: 'flex',
              gap: '1rem',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  placeholder="Search Item"
                  style={{
                    padding: '0.75rem 1rem 0.75rem 2.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    width: '200px',
                    outline: 'none'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '0.75rem',
                  color: '#666'
                }}>🔍</span>
              </div>
              
              <div style={{
                position: 'relative',
                display: 'inline-block'
              }}
              onMouseEnter={() => {
                if (dropdownTimeout) {
                  clearTimeout(dropdownTimeout);
                  setDropdownTimeout(null);
                }
                setShowAddDropdown(true);
              }}
              onMouseLeave={() => {
                const timeout = setTimeout(() => {
                  setShowAddDropdown(false);
                }, 300); // 300ms delay before closing
                setDropdownTimeout(timeout);
              }}>
                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  + Add Item
                </button>
                
                {/* Dropdown Menu */}
                {showAddDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    marginTop: '0.5rem',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: '160px'
                  }}
                  onMouseEnter={() => {
                    if (dropdownTimeout) {
                      clearTimeout(dropdownTimeout);
                      setDropdownTimeout(null);
                    }
                  }}
                  onMouseLeave={() => {
                    const timeout = setTimeout(() => {
                      setShowAddDropdown(false);
                    }, 300); // 300ms delay before closing
                    setDropdownTimeout(timeout);
                  }}>
                    <button style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#333',
                      borderBottom: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                    }}
                    onClick={() => {
                      console.log('Scan items clicked');
                      setShowAddDropdown(false);
                    }}>
                      📷 Scan Items
                    </button>
                    <button style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8f9fa';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                    }}
                    onClick={() => {
                      console.log('Add manually clicked');
                      setShowAddDropdown(false);
                    }}>
                      ✏️ Add Manually
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Inventory Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              overflowX: 'auto'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.9rem'
              }}>
                <thead>
                  <tr style={{
                    background: '#f8f9fa',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      <input type="checkbox" style={{marginRight: '0.5rem'}} />
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Category
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Item Name
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Quantity
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Expiry Date
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Status
                    </th>
                    <th style={{
                      padding: '1rem',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#333',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => {
                    const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                    return (
                      <tr key={item.id} style={{
                        borderBottom: '1px solid #f0f0f0',
                        transition: 'background-color 0.2s'
                      }} onMouseEnter={(e) => {
                        e.target.closest('tr').style.backgroundColor = '#f8f9fa';
                      }} onMouseLeave={(e) => {
                        e.target.closest('tr').style.backgroundColor = 'transparent';
                      }}>
                        <td style={{padding: '1rem'}}>
                          <input type="checkbox" />
                        </td>
                        <td style={{padding: '1rem'}}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: '#f8f9fa',
                            color: '#333',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            border: '1px solid #e0e0e0'
                          }}>
                            {item.category}
                          </span>
                        </td>
                        <td style={{padding: '1rem', fontWeight: '500'}}>
                          {item.itemName}
                        </td>
                        <td style={{padding: '1rem', color: '#666'}}>
                          {item.quantity}
                        </td>
                        <td style={{padding: '1rem'}}>
                          <div>
                            <div style={{fontWeight: '500'}}>
                              {formatDate(item.expiryDate)}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              color: daysUntilExpiry < 0 ? '#F44336' : 
                                     daysUntilExpiry <= 3 ? '#FF5722' : '#666'
                            }}>
                              {daysUntilExpiry < 0 ? `${Math.abs(daysUntilExpiry)} days ago` :
                               daysUntilExpiry === 0 ? 'Today' :
                               daysUntilExpiry === 1 ? 'Tomorrow' :
                               `${daysUntilExpiry} days left`}
                            </div>
                          </div>
                        </td>
                        <td style={{padding: '1rem'}}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            background: `${getStatusColor(item.status)}20`,
                            color: getStatusColor(item.status),
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {item.status}
                          </span>
                        </td>
                        <td style={{padding: '1rem'}}>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center'
                          }}>
                            <button style={{
                              background: '#f8f9fa',
                              border: '1px solid #e0e0e0',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              color: '#666',
                              fontSize: '1rem',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }} 
                            onMouseEnter={(e) => {
                              e.target.style.background = '#e9ecef';
                              e.target.style.borderColor = '#adb5bd';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#f8f9fa';
                              e.target.style.borderColor = '#e0e0e0';
                            }}
                            title="Edit">
                              <EditIcon />
                            </button>
                            <button style={{
                              background: '#f8f9fa',
                              border: '1px solid #e0e0e0',
                              cursor: 'pointer',
                              padding: '0.5rem',
                              borderRadius: '6px',
                              color: '#666',
                              fontSize: '1rem',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#e9ecef';
                              e.target.style.borderColor = '#adb5bd';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#f8f9fa';
                              e.target.style.borderColor = '#e0e0e0';
                            }}
                            title="Delete">
                              <DeleteIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage; 