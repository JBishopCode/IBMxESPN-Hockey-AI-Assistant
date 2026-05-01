# =============================================================
# Ice Intelligence - Configuration Example
# Copy this file to config.py and fill in your credentials.
# =============================================================

# ESPN Fantasy Hockey
ESPN_LEAGUE_ID = 0          # Your league ID (integer) - Found in browser url
ESPN_YEAR = 2026            # 2025-26 season = 2026
ESPN_S2 = "your_espn_s2_cookie_here"   # Found in chrome dev tools on the ESPN website 
ESPN_SWID = "{your-swid-cookie-here}"  # ^ Application -> cookies -> www.espn.com -> value for "espn_s2" and "SWID"

# IBM watsonx
WATSONX_API_KEY = "your_ibm_api_key_here"   
WATSONX_PROJECT_ID = "your_project_id_here" 
WATSONX_URL = "https://us-south.ml.cloud.ibm.com"
MODEL_ID = "meta-llama/llama-3-3-70b-instruct"

# Agent settings
FREE_AGENT_FETCH_SIZE = 50
SESSION_LOG_DIR = "logs" # Directory will have to be added by user 
