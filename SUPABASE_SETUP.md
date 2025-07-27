# 🗄️ Supabase Database Setup Guide

This guide will help you set up Supabase as the backend database for your Fridgy app.

## 1. Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email if required

## 2. Create New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `fridgy-database` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for MVP
4. Click "Create new project"
5. Wait for setup to complete (~2 minutes)

## 3. Create the Database Table

### Option A: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy and paste this SQL:

```sql
-- Create the fridge_items table
CREATE TABLE fridge_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL DEFAULT 'anonymous',
    item_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    expiration_date DATE NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_fridge_items_user_id ON fridge_items(user_id);
CREATE INDEX idx_fridge_items_expiration ON fridge_items(expiration_date);

-- Enable Row Level Security (RLS) for future user authentication
ALTER TABLE fridge_items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations for now" ON fridge_items
    FOR ALL 
    TO authenticated, anon
    USING (true)
    WITH CHECK (true);

-- Insert some sample data for testing (optional)
INSERT INTO fridge_items (user_id, item_name, quantity, expiration_date) VALUES
    ('demo-user', 'Milk', 1, '2025-01-15'),
    ('demo-user', 'Eggs', 12, '2025-01-20'),
    ('demo-user', 'Cheese', 1, '2025-01-10'),
    ('demo-user', 'Apples', 6, '2025-01-25');
```

4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned" message

### Option B: Using Table Editor

1. Go to **Table Editor** in the left sidebar
2. Click "Create a new table"
3. Fill in:
   - **Name**: `fridge_items`
   - **Description**: "Stores user's fridge inventory items"
4. Add columns:

| Column Name | Type | Default Value | Constraints |
|-------------|------|---------------|-------------|
| id | int8 | (auto) | Primary Key, Auto-increment |
| user_id | varchar | 'anonymous' | Not null |
| item_name | varchar | - | Not null |
| quantity | int4 | - | Not null, > 0 |
| expiration_date | date | - | Not null |
| uploaded_at | timestamptz | now() | - |
| created_at | timestamptz | now() | - |
| updated_at | timestamptz | now() | - |

5. Click "Save"

## 4. Get Your API Credentials

1. Go to **Settings** → **API** in the left sidebar
2. Find these two values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long string)
3. Copy both values - you'll need them for the `.env` file

## 5. Configure Your Application

1. In your project, copy the environment template:
   ```bash
   cp server/.env.template server/.env
   ```

2. Edit `server/.env` and add your credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   PORT=5000
   ```

3. Make sure to add `.env` to your `.gitignore` file:
   ```bash
   echo "server/.env" >> .gitignore
   ```

## 6. Enable Database Integration in Code

In `server/server.js`, find the commented Supabase code and uncomment it:

```javascript
// Find this section and uncomment:
const { data, error } = await supabase
  .from('fridge_items')
  .insert(itemsToSave);

if (error) {
  throw error;
}
```

## 7. Test Your Setup

1. Start your application:
   ```bash
   npm run dev
   ```

2. Use the app to take photos and save items

3. Check if data was saved:
   - Go to Supabase **Table Editor**
   - Click on `fridge_items` table
   - You should see your saved items

## 8. Set Up Authentication (Optional - Future Enhancement)

For production use, you'll want to add user authentication:

1. Go to **Authentication** → **Settings**
2. Configure your preferred auth providers
3. Update your policies to restrict data access by user
4. Modify the frontend to handle user login/logout

### Example User-Specific Policy:
```sql
-- Drop the permissive policy
DROP POLICY "Allow all operations for now" ON fridge_items;

-- Create user-specific policies
CREATE POLICY "Users can view their own items" ON fridge_items
    FOR SELECT TO authenticated
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own items" ON fridge_items
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own items" ON fridge_items
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own items" ON fridge_items
    FOR DELETE TO authenticated
    USING (auth.uid()::text = user_id);
```

## 9. Database Management

### Useful SQL Queries:

**View all items:**
```sql
SELECT * FROM fridge_items ORDER BY uploaded_at DESC;
```

**Count items by user:**
```sql
SELECT user_id, COUNT(*) as item_count 
FROM fridge_items 
GROUP BY user_id;
```

**Find expiring items:**
```sql
SELECT item_name, expiration_date, 
       (expiration_date - CURRENT_DATE) as days_until_expiry
FROM fridge_items 
WHERE expiration_date <= CURRENT_DATE + INTERVAL '7 days'
ORDER BY expiration_date;
```

**Clear test data:**
```sql
DELETE FROM fridge_items WHERE user_id = 'anonymous';
```

## 10. Monitoring and Maintenance

1. **Usage Dashboard**: Monitor API usage in Supabase dashboard
2. **Database Size**: Check storage usage as data grows
3. **Performance**: Monitor query performance in SQL Editor
4. **Backups**: Supabase handles backups, but consider exports for critical data

## 🚨 Security Notes

- Never commit your `.env` file to version control
- Use Row Level Security policies in production
- Regularly rotate your API keys if needed
- Monitor usage to prevent abuse
- Consider rate limiting for production apps

## 🔧 Troubleshooting

**Connection Issues:**
- Verify your URL and API key are correct
- Check if your project is paused (free tier limitation)
- Ensure network connectivity

**Policy Errors:**
- Check if RLS is properly configured
- Verify your policies allow the operations you're trying
- Use the Supabase logs to debug policy issues

**Performance Issues:**
- Add indexes for frequently queried columns
- Consider pagination for large datasets
- Monitor query performance in the dashboard

---

Your Supabase database is now ready for the Fridgy app! 🎉 