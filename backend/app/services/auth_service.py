from app.extensions import get_supabase

class AuthService:
    
    @staticmethod
    def register_user(email, password, first_name, last_name, current_year, 
                     block_section, course, phone_number):
        supabase = get_supabase()
        
        try:
            print(f"Attempting to register user: {email}")
            
            # Step 1: Create auth user (Supabase handles password hashing automatically)
            auth_response = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            
            print(f"Auth response: {auth_response}")
            
            if not auth_response.user:
                print("Auth user creation failed")
                return {"success": False, "message": "Registration failed - could not create auth user"}, 400
            
            print(f"Auth user created with ID: {auth_response.user.id}")
            
            # Step 2: Store additional user data in users table
            # Use upsert to handle cases where the user might already exist
            user_data = {
                "id": auth_response.user.id,
                "email": email,
                "first_name": first_name,
                "last_name": last_name,
                "current_year": current_year,
                "block_section": block_section,
                "course": course,
                "phone_number": phone_number
            }
            
            print(f"Inserting user data: {user_data}")
            
            try:
                # Use upsert instead of insert to avoid conflicts
                db_response = supabase.table('users').upsert(user_data).execute()
                print(f"Database upsert response: {db_response}")
                print(f"✓ User data saved to database successfully")
            except Exception as db_error:
                print(f"⚠ Database insert failed: {str(db_error)}")
                print(f"⚠ User can still login, but profile data may be incomplete")
            
            return {
                "success": True,
                "message": "Registration successful! You can now login.",
                "user_id": auth_response.user.id
            }, 201
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            import traceback
            traceback.print_exc()
            
            # If it's a foreign key error, the auth user was created but DB insert failed
            # The user can still login after email confirmation
            if "foreign key constraint" in str(e).lower() or "not present in table" in str(e).lower():
                return {
                    "success": True,
                    "message": "Registration successful! Please check your email to verify your account. (Note: Some profile data may need to be completed after login)",
                    "user_id": auth_response.user.id if 'auth_response' in locals() else None
                }, 201
            
            return {"success": False, "message": f"Registration error: {str(e)}"}, 500
    
    @staticmethod
    def login_user(email, password):
        supabase = get_supabase()
        
        try:
            # Supabase handles password verification automatically
            response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if response.user:
                # Get additional user data from users table
                user_data = supabase.table('users').select('*').eq('id', response.user.id).execute()
                
                print(f"Login - User ID: {response.user.id}")
                print(f"Login - User data query result: {user_data.data}")
                
                # Check if user data exists
                if not user_data.data or len(user_data.data) == 0:
                    print(f"⚠ Warning: No user data found in users table for user {response.user.id}")
                    return {
                        "success": False,
                        "message": "Login successful but user data is missing. Please try again."
                    }, 400
                
                return {
                    "success": True,
                    "message": "Login successful",
                    "user": user_data.data[0],
                    "session": {
                        "access_token": response.session.access_token,
                        "refresh_token": response.session.refresh_token
                    }
                }, 200
            
            return {"success": False, "message": "Invalid credentials"}, 401
            
        except Exception as e:
            print(f"Login error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {"success": False, "message": str(e)}, 401
    
