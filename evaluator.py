import json
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# 1. API Configuration
# ==========================================
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)

model = genai.GenerativeModel('gemini-3-flash-preview')

# ==========================================
# 2. The Core Evaluator Function
# ==========================================
def evaluate_website_data(scraped_json_data):
    """
    Takes parsed JSON data from the scraper and returns an LLM evaluation in JSON.
    """
    print("Evaluating data with the LLM...")
    
    # The prompt forces the LLM to act as an auditor and return strict JSON
    prompt = f"""
    You are an expert website evaluator and UX auditor. 
    Analyze the following scraped website data and provide a score from 1 to 100.
    
    Evaluate based on:
    1. SEO best practices (title, description, headers).
    2. Content structure (logical H1/H2s).
    3. Technical health (missing alt text, word count).
    
    Website Data:
    {json.dumps(scraped_json_data, indent=2)}
    
    You MUST return ONLY a valid JSON object matching this exact structure:
    {{
      "overall_score": 85,
      "needs_improvement": true,
      "strengths": ["...", "..."],
      "critical_issues": ["...", "..."],
      "actionable_recommendations": ["...", "..."]
    }}
    """
    
    try:
        # We explicitly ask the Gemini model to return JSON natively
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.2 # Lower temperature for analytical, consistent scoring
            )
        )
        
        # The response is guaranteed to be a JSON string, so we parse it into a Python dictionary
        return json.loads(response.text)
        
    except Exception as e:
        print(f"Error during LLM evaluation: {e}")
        return None

# ==========================================
# 3. How to Use It (Example Execution)
# ==========================================
if __name__ == "__main__":
    incoming_data_from_scraper = {
        "page_metadata": {
            "url": "https://example.com",
            "title_tag": "Home | Example",
            "meta_description": "" 
        },
        "technical_and_ux_indicators": {
            "images_without_alt_text": 3,
            "broken_links_found": 0
        }
    }
    
    evaluation_result = evaluate_website_data(incoming_data_from_scraper)
    
    print("\n--- Final Evaluation Result ---")
    print(json.dumps(evaluation_result, indent=2))