import sys
import os


sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.insert import save_leads

def test_supabase_insert():
    print("🚀 Starting test insert...")
    
    # 1. Create dummy data
    mock_leads = [
        {
            "name": "Test Business",
            "phone": "123-456-7890",
            "website": "https://testexample.com",
            "rating": 4.5,
            "niche": "Software",
            "location": "New York"
        },
        {
            "name": "No Website Biz",
            "phone": None,
            "website": None,
            "rating": 0,
            "niche": "Consulting",
            "location": "London"
        }
    ]

    try:
        # 2. Run the function
        save_leads(mock_leads)
        print("✅ Success! Check your Supabase dashboard.")
    except Exception as e:
        print(f"❌ Error during insertion: {e}")

if __name__ == "__main__":
    test_supabase_insert()