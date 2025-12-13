from app.extensions import get_supabase

class ReferralService:
    
    @staticmethod
    def get_user_referral_stats(user_id):
        """Get referral statistics for a user"""
        supabase = get_supabase()
        
        try:
            # Get user's referral code and total referrals
            user_data = supabase.table('users').select(
                'referral_code, total_referrals, reputation_score'
            ).eq('id', user_id).execute()
            
            if not user_data.data or len(user_data.data) == 0:
                return {
                    "success": False,
                    "message": "User not found"
                }
            
            user_info = user_data.data[0]
            
            # Get list of referred users
            referrals = supabase.table('referrals').select(
                'created_at, referred_id'
            ).eq('referrer_id', user_id).order('created_at', desc=True).execute()
            
            # Get referred users details
            referred_users = []
            if referrals.data:
                for referral in referrals.data:
                    user = supabase.table('users').select(
                        'first_name, last_name, created_at'
                    ).eq('id', referral['referred_id']).execute()
                    
                    if user.data and len(user.data) > 0:
                        referred_users.append({
                            'name': f"{user.data[0]['first_name']} {user.data[0]['last_name']}",
                            'joined_at': referral['created_at']
                        })
            
            return {
                "success": True,
                "referral_code": user_info['referral_code'],
                "total_referrals": user_info['total_referrals'] or 0,
                "reputation_score": user_info['reputation_score'] or 0,
                "referred_users": referred_users
            }
            
        except Exception as e:
            print(f"Error getting referral stats: {str(e)}")
            raise e
    
    @staticmethod
    def validate_referral_code(code):
        """Check if a referral code is valid"""
        supabase = get_supabase()
        
        try:
            result = supabase.table('users').select('id').eq('referral_code', code).execute()
            return result.data and len(result.data) > 0
        except Exception as e:
            print(f"Error validating referral code: {str(e)}")
            return False
    
    @staticmethod
    def get_referral_leaderboard(limit=10):
        """Get top referrers"""
        supabase = get_supabase()
        
        try:
            result = supabase.table('users').select(
                'first_name, last_name, total_referrals, reputation_score'
            ).order('total_referrals', desc=True).limit(limit).execute()
            
            leaderboard = []
            for idx, user in enumerate(result.data, 1):
                if user['total_referrals'] and user['total_referrals'] > 0:
                    leaderboard.append({
                        'rank': idx,
                        'name': f"{user['first_name']} {user['last_name']}",
                        'total_referrals': user['total_referrals'],
                        'reputation_score': user['reputation_score'] or 0
                    })
            
            return leaderboard
            
        except Exception as e:
            print(f"Error getting leaderboard: {str(e)}")
            raise e
