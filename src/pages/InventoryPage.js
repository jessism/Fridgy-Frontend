import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppNavBar } from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import BatchCamera from '../features/batchcamera/components/BatchCamera';
import { EditIcon, DeleteIcon } from '../components/icons';
import useInventory from '../hooks/useInventory';
import { getItemIcon, getExpiryStatus, formatQuantity } from '../assets/inventory_emojis/iconHelpers.js';
import './InventoryPage.css';

const InventoryPage = () => {
  const { items: inventoryItems, loading, error, refreshInventory, deleteItem, updateItem } = useInventory();

  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);

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

  const handleCameraModalClose = () => {
    setShowCameraModal(false);
    // Refresh inventory to show newly added items
    refreshInventory();
  };

  const handleDeleteItem = (item) => {
    console.log('Delete button clicked for item:', item);
    setItemToDelete(item);
    setShowDeleteModal(true);
    console.log('Modal should now be shown');
  };

  const handleDeleteConfirm = async (reason) => {
    if (!itemToDelete) return;
    
    try {
      // Pass the delete reason to the backend for analytics
      await deleteItem(itemToDelete.id, reason);
      console.log(`Item deleted with reason: ${reason}`);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  };

  // Dropdown menu handlers
  const handleDropdownToggle = (itemId) => {
    setOpenDropdownId(openDropdownId === itemId ? null : itemId);
  };

  const handleDropdownClose = () => {
    setOpenDropdownId(null);
  };

  // Edit handlers
  const handleEditItem = (item) => {
    setItemToEdit(item);
    setShowEditModal(true);
    setOpenDropdownId(null);
  };

  const handleEditCancel = () => {
    setShowEditModal(false);
    setItemToEdit(null);
  };

  const handleEditConfirm = async (updatedData) => {
    if (!itemToEdit) return;
    
    try {
      await updateItem(itemToEdit.id, updatedData);
      console.log('Item updated successfully');
    } catch (error) {
      console.error('Failed to update item:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      setShowEditModal(false);
      setItemToEdit(null);
    }
  };

  // Enhanced delete handler that closes dropdown
  const handleDeleteItemFromDropdown = (item) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
    setOpenDropdownId(null);
  };

  // Handle keyboard events (ESC to close dropdown)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdownId(null);
      }
    };

    if (openDropdownId) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdownId]);

  return (
    <div className="inventory-page">
      <AppNavBar />

      {/* Inventory Content */}
      <div style={{paddingTop: '100px', minHeight: '100vh', background: 'white'}}>
        <div className="container" style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem', overflow: 'visible'}}>
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
                      setShowCameraModal(true);
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

          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '3rem',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid var(--primary-green)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  animation: 'spin 2s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p style={{ color: '#666', margin: 0 }}>Loading your inventory...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div style={{
              background: '#ffe6e6',
              border: '1px solid #ff9999',
              borderRadius: '8px',
              padding: '1rem',
              margin: '1rem 0',
              color: '#cc0000'
            }}>
              <strong>Error loading inventory:</strong> {error}
              <button 
                onClick={refreshInventory}
                style={{
                  marginLeft: '1rem',
                  padding: '0.5rem 1rem',
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && inventoryItems.length === 0 && (
            <div style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              padding: '3rem',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#666', marginBottom: '1rem' }}>No items in your inventory yet</h3>
              <p style={{ color: '#999', marginBottom: '2rem' }}>Start by scanning some food items with your camera!</p>
              <button 
                style={{
                  padding: '0.75rem 2rem',
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => setShowCameraModal(true)}
              >
                📷 Scan Items
              </button>
            </div>
          )}

          {/* Inventory Table - Desktop */}
          {!loading && !error && inventoryItems.length > 0 && (
            <div className="inventory-page__table-container" style={{
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
                      <input type="checkbox" readOnly style={{marginRight: '0.5rem'}} />
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
                          <input type="checkbox" readOnly />
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
                            onClick={() => handleDeleteItem(item)}
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
          )}

          {/* Inventory Cards - Mobile */}
          {!loading && !error && inventoryItems.length > 0 && (
            <div className="inventory-page__mobile-cards">
              {inventoryItems.map((item) => {
                const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate);
                const { status, urgency } = getExpiryStatus(daysUntilExpiry);
                const itemIcon = getItemIcon(item.category, item.itemName);
                const formattedQuantity = formatQuantity(item.quantity);
                
                const getStatusPillClass = (urgency) => {
                  switch (urgency) {
                    case 'expired': return 'inventory-page__card-status-pill--expired';
                    case 'expiring': return 'inventory-page__card-status-pill--expiring';
                    case 'warning': return 'inventory-page__card-status-pill--warning';
                    case 'good': return 'inventory-page__card-status-pill--good';
                    default: return 'inventory-page__card-status-pill--good';
                  }
                };

                return (
                  <div key={item.id} className="inventory-page__mobile-card">
                    {/* Left: Emoji icon */}
                    <div className="inventory-page__card-icon">
                      {itemIcon}
                    </div>
                    
                    {/* Right: Content */}
                    <div className="inventory-page__card-content">
                      {/* Top: Item name + status pill on same line */}
                      <div className="inventory-page__card-name-row">
                        <h3 className="inventory-page__card-item-name">{item.itemName}</h3>
                        <span className={`inventory-page__card-status-pill ${getStatusPillClass(urgency)}`}>
                          {status}
                        </span>
                      </div>
                      
                      {/* Bottom: Details row with quantity and category */}
                      <div className="inventory-page__card-details-row">
                        <span className="inventory-page__card-text-info">
                          Qty: {formattedQuantity}
                        </span>
                        <span className="inventory-page__card-text-info">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    {/* Top-right: 3-dot menu */}
                    <div className="inventory-page__card-menu">
                      <button 
                        className="inventory-page__card-menu-btn"
                        onClick={() => handleDropdownToggle(item.id)}
                        title="Options"
                      >
                        ⋮
                      </button>
                      
                      {/* Dropdown menu */}
                      {openDropdownId === item.id && (
                        <>
                          <div className="inventory-page__dropdown-overlay" onClick={handleDropdownClose}></div>
                          <div className="inventory-page__dropdown-menu">
                            <button 
                              className="inventory-page__dropdown-option"
                              onClick={() => handleEditItem(item)}
                            >
                              <EditIcon />
                              <span>Edit</span>
                            </button>
                            <button 
                              className="inventory-page__dropdown-option"
                              onClick={() => handleDeleteItemFromDropdown(item)}
                            >
                              <DeleteIcon />
                              <span>Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* Camera Modal */}
      {showCameraModal && (
        <div className="camera-modal-overlay">
          <div className="camera-modal">
            <div className="camera-modal-header">
              <h2>Scan Items</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowCameraModal(false)}
              >
                ✕
              </button>
            </div>
            <BatchCamera onComplete={handleCameraModalClose} />
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && itemToEdit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 10001,
            position: 'relative'
          }}>
            <h3 style={{
              margin: '0 0 1.5rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Edit {itemToEdit.itemName}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleEditConfirm({
                itemName: formData.get('itemName'),
                quantity: formData.get('quantity'),
                category: formData.get('category'),
                expiryDate: formData.get('expiryDate')
              });
            }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Item Name
                </label>
                <input 
                  type="text" 
                  name="itemName"
                  defaultValue={itemToEdit.itemName}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Quantity
                </label>
                <input 
                  type="text" 
                  name="quantity"
                  defaultValue={itemToEdit.quantity}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Category
                </label>
                <input 
                  type="text" 
                  name="category"
                  defaultValue={itemToEdit.category}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Expiry Date
                </label>
                <input 
                  type="date" 
                  name="expiryDate"
                  defaultValue={itemToEdit.expiryDate ? new Date(itemToEdit.expiryDate).toISOString().split('T')[0] : ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                  required
                />
              </div>
              
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={handleEditCancel}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{
              margin: '0 0 1rem 0',
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#333'
            }}>
              Delete {itemToDelete.itemName}?
            </h3>
            <p style={{
              margin: '0 0 2rem 0',
              color: '#666',
              fontSize: '0.95rem'
            }}>
              What happened to this item?
            </p>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => handleDeleteConfirm('mistake')}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#856404',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#ffeaa7';
                  e.target.style.borderColor = '#fdcb6e';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#fff3cd';
                  e.target.style.borderColor = '#ffeaa7';
                }}
              >
                I didn't mean to log this
              </button>
              
              <button
                onClick={() => handleDeleteConfirm('used_up')}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#d4edda',
                  border: '1px solid #c3e6cb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#155724',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#c3e6cb';
                  e.target.style.borderColor = '#b8dabd';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#d4edda';
                  e.target.style.borderColor = '#c3e6cb';
                }}
              >
                I used it up
              </button>
              
              <button
                onClick={() => handleDeleteConfirm('thrown_away')}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  color: '#721c24',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f5c6cb';
                  e.target.style.borderColor = '#f1b0b7';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#f8d7da';
                  e.target.style.borderColor = '#f5c6cb';
                }}
              >
                I'm throwing it away
              </button>
            </div>
            
            <div style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleDeleteCancel}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#6c757d',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f8f9fa';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <MobileBottomNav />
    </div>
  );
};

export default InventoryPage; 