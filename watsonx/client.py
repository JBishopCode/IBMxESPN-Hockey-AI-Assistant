"""
watsonx/client.py
Handles IBM watsonx authentication and model inference.
Tokens are cached and refreshed automatically.
"""

import time
import requests
import config


class WatsonxClient:
    def __init__(self):
        self._token = None
        self._token_expiry = 0

    def _get_token(self) -> str:
        """Get or refresh IAM access token."""
        if self._token and time.time() < self._token_expiry - 60:
            return self._token

        response = requests.post(
            "https://iam.cloud.ibm.com/identity/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data=f"grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey={config.WATSONX_API_KEY}"
        )
        response.raise_for_status()
        data = response.json()
        self._token = data["access_token"]
        self._token_expiry = time.time() + data.get("expires_in", 3600)
        return self._token

    def generate(self, prompt: str, max_tokens: int = 1200) -> str:
        """Send a prompt to watsonx and return generated text."""
        token = self._get_token()
        url = f"{config.WATSONX_URL}/ml/v1/text/generation?version=2023-05-29"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        body = {
            "model_id": config.MODEL_ID,
            "project_id": config.WATSONX_PROJECT_ID,
            "input": prompt,
            "parameters": {
                "decoding_method": "greedy",
                "max_new_tokens": max_tokens,
                "min_new_tokens": 50,
                "repetition_penalty": 1.1,
            }
        }
        response = requests.post(url, headers=headers, json=body)
        response.raise_for_status()
        return response.json()["results"][0]["generated_text"]

    def test_connection(self) -> bool:
        """Test that watsonx is reachable and credentials are valid."""
        try:
            self._get_token()
            return True
        except Exception:
            return False
