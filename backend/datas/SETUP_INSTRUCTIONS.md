# Database Setup Instructions

## Step 1: Create the Users Table in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the contents of `create_users_table.sql`
6. Click "Run" to execute the SQL

This will create:
- A `users` table to store student information
- Indexes for faster queries
- Row Level Security (RLS) policies for data protection
- Automatic timestamp updates

## Step 2: Verify the Table

1. Go to "Table Editor" in the left sidebar
2. You should see a new table called `users`
3. The table should have these columns:
   - id (UUID, Primary Key)
   - email (VARCHAR)
   - first_name (VARCHAR)
   - last_name (VARCHAR)
   - current_year (VARCHAR)
   - block_section (VARCHAR)
   - course (VARCHAR)
   - phone_number (VARCHAR)
   - created_at (TIMESTAMP)
   - updated_at (TIMESTAMP)

## Step 3: Test the Backend

1. Make sure your `.env` file has the correct Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SECRET_KEY=your_secret_key
   ```

2. Start the backend server:
   ```bash
   cd Backend
   python api.py
   ```

3. The server should start on http://localhost:5000

## Step 4: Test Registration

1. Start the frontend:
   ```bash
   cd Frontend
   npm run dev
   ```

2. Navigate to the registration page
3. Fill in all the fields
4. Submit the form

## How Password Security Works

1. **Frontend**: User enters password
2. **Backend**: Password is sent to Supabase Auth
3. **Supabase**: Automatically hashes the password using bcrypt
4. **Database**: Only the hashed password is stored (never plain text)
5. **Login**: Supabase compares the hashed password automatically

## Security Features

✅ Passwords are automatically hashed by Supabase (bcrypt)
✅ Row Level Security (RLS) enabled
✅ Users can only access their own data
✅ Email verification required (optional, can be configured in Supabase)
✅ CORS enabled for frontend communication

## API Endpoints

### Register
- **URL**: `POST http://localhost:5000/api/auth/register`
- **Body**:
  ```json
  {
    "schoolEmail": "student@university.edu",
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "currentYear": "3",
    "blockSection": "A",
    "course": "BS Computer Science",
    "phoneNumber": "09123456789"
  }
  ```

### Login
- **URL**: `POST http://localhost:5000/api/auth/login`
- **Body**:
  ```json
  {
    "email": "student@university.edu",
    "password": "password123"
  }
  ```

## Troubleshooting

### Error: "Registration failed"
- Check if the users table exists in Supabase
- Verify your Supabase credentials in `.env`
- Check the backend console for detailed error messages

### Error: "CORS policy"
- Make sure the backend is running on port 5000
- Check that flask-cors is installed: `pip install flask-cors`

### Error: "Invalid credentials"
- Make sure the email and password are correct
- Check if the user exists in Supabase Auth Users table
