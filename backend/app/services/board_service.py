from app.extensions import get_supabase

class BoardService:
    @staticmethod
    def get_board_item(user_id=None):
        supabase = get_supabase()
        try:
            # Fetch requests
            requests = supabase.table('requests').select('*').eq('status', 'active').order('created_at', desc=True).limit(100).execute()
            
            # Add reply count, like count, and user_liked status to each request
            if requests.data:
                for req in requests.data:
                    # Count replies for this request
                    reply_count = supabase.table('request_replies').select('id', count='exact').eq('request_id', req['id']).execute()
                    req['reply_count'] = reply_count.count if reply_count.count else 0
                    
                    # Count likes for this request
                    like_count = supabase.table('request_likes').select('id', count='exact').eq('request_id', req['id']).execute()
                    req['like_count'] = like_count.count if like_count.count else 0
                    
                    # Check if current user liked this request
                    if user_id:
                        user_like = supabase.table('request_likes').select('id').eq('request_id', req['id']).eq('user_id', user_id).execute()
                        req['user_liked'] = len(user_like.data) > 0 if user_like.data else False
                    else:
                        req['user_liked'] = False
            
            return {"success": True, "data": requests.data}, 200
        except Exception as e:
            print(f"Service Error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def create_request(user_id, data):
        supabase = get_supabase()
        try:
            request_payload = {
                "user_id": user_id,
                "title": data.get("title"),
                "description": data.get("description"),
                "category": data.get("category"),
                "subcategory": data.get("subcategory"),
                "budget": data.get("budget"),
                "status": "active"
            }
            response = supabase.table('requests').insert(request_payload).execute()
            return {"success": True, "data": response.data}, 201
        except Exception as e:
            print(f"Create Request Error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def delete_request(user_id, request_id):
        supabase = get_supabase()
        try:
            check = supabase.table('requests').select('user_id').eq('id', request_id).single().execute()
            if not check.data:
                return {"success": False, "message": "Request not found"}, 404
            if check.data['user_id'] != user_id:
                return {"success": False, "message": "Unauthorized"}, 403
            response = supabase.table('requests').delete().eq('id', request_id).execute()
            return {"success": True, "message": "Request deleted"}, 200
        except Exception as e:
            print(f"Delete Request Error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def toggle_like(user_id, request_id):
        supabase = get_supabase()
        try:
            existing_like = supabase.table('request_likes').select('*').eq('user_id', user_id).eq('request_id', request_id).execute()
            if existing_like.data and len(existing_like.data) > 0:
                supabase.table('request_likes').delete().eq('user_id', user_id).eq('request_id', request_id).execute()
                user_liked = False
            else:
                supabase.table('request_likes').insert({"user_id": user_id, "request_id": request_id}).execute()
                user_liked = True
            
            # Count likes directly instead of using RPC
            like_count_result = supabase.table('request_likes').select('id', count='exact').eq('request_id', request_id).execute()
            like_count = like_count_result.count if like_count_result.count else 0
            
            return {"success": True, "data": {"like_count": like_count, "user_liked": user_liked}}, 200
        except Exception as e:
            print(f"Like error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def get_replies(request_id):
        supabase = get_supabase()
        try:
            replies = supabase.table('request_replies').select('*').eq('request_id', request_id).order('created_at', desc=False).execute()
            return {"success": True, "data": replies.data}, 200
        except Exception as e:
            print(f"Get Replies Error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def create_reply(user_id, request_id, data):
        supabase = get_supabase()
        try:
            content_text = data.get("content")
            reply_payload = {
                "user_id": user_id,
                "request_id": request_id,
                "message": content_text,
                "content": content_text  # Send both to satisfy both columns
            }
            response = supabase.table('request_replies').insert(reply_payload).execute()
            return {"success": True, "data": response.data}, 201
        except Exception as e:
            print(f"Create Reply Error: {e}")
            return {"success": False, "message": str(e)}, 500

    @staticmethod
    def delete_reply(user_id, request_id, reply_id):
        supabase = get_supabase()
        try:
            check = supabase.table('request_replies').select('user_id').eq('id', reply_id).eq('request_id', request_id).single().execute()
            if not check.data:
                return {"success": False, "message": "Reply not found"}, 404
            if check.data['user_id'] != user_id:
                return {"success": False, "message": "Unauthorized"}, 403
            response = supabase.table('request_replies').delete().eq('id', reply_id).execute()
            return {"success": True, "message": "Reply deleted"}, 200
        except Exception as e:
            print(f"Delete Reply Error: {e}")
            return {"success": False, "message": str(e)}, 500
