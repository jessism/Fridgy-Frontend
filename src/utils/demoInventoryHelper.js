/**
 * Demo Inventory Helper
 * Generates the standard 5 demo inventory items used across the app
 */

// Helper to get date N days from now in YYYY-MM-DD format
const getDateDaysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Helper to get ISO timestamp
const getISOTimestamp = () => {
  return new Date().toISOString();
};

/**
 * Generate the 5 standard demo inventory items
 * Same items used in camera flow and for recipe generation
 */
export const generateDemoInventoryItems = () => {
  return [
    {
      itemName: 'Chicken Breast',
      quantity: 1,
      category: 'Protein',
      expirationDate: getDateDaysFromNow(7),
      total_weight_oz: 16,
      uploadedAt: getISOTimestamp(),
      createdAt: getISOTimestamp(),
      updatedAt: getISOTimestamp(),
      isDemo: true
    },
    {
      itemName: 'Broccoli',
      quantity: 1,
      category: 'Vegetables',
      expirationDate: getDateDaysFromNow(5),
      total_weight_oz: 8,
      uploadedAt: getISOTimestamp(),
      createdAt: getISOTimestamp(),
      updatedAt: getISOTimestamp(),
      isDemo: true
    },
    {
      itemName: 'Eggs',
      quantity: 3,
      category: 'Protein',
      expirationDate: getDateDaysFromNow(14),
      total_weight_oz: 12,
      uploadedAt: getISOTimestamp(),
      createdAt: getISOTimestamp(),
      updatedAt: getISOTimestamp(),
      isDemo: true
    },
    {
      itemName: 'Asparagus',
      quantity: 1,
      category: 'Vegetables',
      expirationDate: getDateDaysFromNow(4),
      total_weight_oz: 6,
      uploadedAt: getISOTimestamp(),
      createdAt: getISOTimestamp(),
      updatedAt: getISOTimestamp(),
      isDemo: true
    },
    {
      itemName: 'Spaghetti',
      quantity: 1,
      category: 'Grains',
      expirationDate: getDateDaysFromNow(365),
      total_weight_oz: 16,
      uploadedAt: getISOTimestamp(),
      createdAt: getISOTimestamp(),
      updatedAt: getISOTimestamp(),
      isDemo: true
    }
  ];
};

/**
 * Transform demo items to backend format (snake_case)
 */
export const transformDemoInventoryForAPI = (demoItems) => {
  return demoItems.map(item => ({
    item_name: item.itemName,
    quantity: item.quantity,
    category: item.category,
    expiration_date: item.expirationDate,
    uploaded_at: item.uploadedAt,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
    total_weight_oz: item.total_weight_oz,
    isDemo: true
  }));
};
