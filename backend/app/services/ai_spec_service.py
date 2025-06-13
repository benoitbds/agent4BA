import openai
import json
from app.core.config import get_settings
from fastapi import HTTPException # Added for use within FastAPI app

settings = get_settings()
# Ensure OPENAI_API_KEY is loaded and set for the openai library
if not settings.openai_api_key:
    # This check is important. If the key is missing, the service cannot function.
    # Consider logging this error prominently if a logging system is in place.
    raise ValueError("OPENAI_API_KEY is not set in the environment variables or .env file. The AI Spec service cannot start.")
openai.api_key = settings.openai_api_key

class AISpecService:
    def __init__(self, model_name: str = "gpt-3.5-turbo"):
        self.model_name = model_name
        # Validate model choice or make it more configurable if necessary
        if self.model_name not in ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo-preview", "gpt-4o"]: # Added gpt-4o
            print(f"Warning: Specified model_name '{self.model_name}' may not support JSON mode or ChatCompletion.acreate. Using 'gpt-3.5-turbo' as default or ensure compatibility.")
            # Potentially default to a known good model or raise an error

    async def generate_specifications(self, project_name: str, project_description: str, project_goals: list[str]) -> dict:
        prompt = self._build_prompt(project_name, project_description, project_goals)

        try:
            # Log the attempt to call OpenAI API
            # print(f"Attempting to generate specs for project: {project_name} using model: {self.model_name}") # Replace with logging

            response = await openai.ChatCompletion.acreate(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert AI assistant specialized in generating functional specifications for software projects. Your goal is to help users define clear, concise, and comprehensive epics, features, and user stories. Output the specifications in JSON format as requested."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7, # A balance between creativity and predictability
                response_format={ "type": "json_object" } # Request JSON output
            )

            response_content = response.choices[0].message.content
            if not response_content:
                print("OpenAI API returned an empty response content.") # Replace with proper logging
                raise HTTPException(status_code=500, detail="AI service received an empty response from OpenAI.")

            # print(f"Raw response from OpenAI: {response_content[:500]}...") # Replace with logging, be careful with sensitive data

            try:
                specifications = json.loads(response_content)
            except json.JSONDecodeError as json_err:
                print(f"Initial JSON decoding failed: {json_err}. Raw response: {response_content[:500]}") # Replace with logging
                # Attempt to extract JSON from markdown if response_format failed or model doesn't fully support
                if "```json" in response_content:
                    # print("Attempting to extract JSON from markdown code block.") # Replace with logging
                    try:
                        json_str = response_content.split("```json", 1)[1].split("```", 1)[0].strip()
                        specifications = json.loads(json_str)
                        # print("Successfully extracted and parsed JSON from markdown.") # Replace with logging
                    except json.JSONDecodeError as md_json_err:
                        print(f"Failed to decode JSON from markdown block. Error: {md_json_err}. Content: {json_str[:500]}") # Replace with logging
                        raise HTTPException(status_code=500, detail=f"AI response format error after attempting markdown extraction. Malformed JSON. Preview: {response_content[:200]}")
                    except Exception as e:
                        print(f"Unexpected error during markdown JSON extraction: {e}") # Replace with logging
                        raise HTTPException(status_code=500, detail=f"Unexpected error processing AI response. Preview: {response_content[:200]}")
                else:
                    raise HTTPException(status_code=500, detail=f"AI response was not valid JSON and not in expected markdown format. Preview: {response_content[:200]}")

            # Basic validation of the expected structure
            if not isinstance(specifications, dict) or "epics" not in specifications:
                error_detail = f"Generated JSON is not a dictionary or does not contain the 'epics' root key. Received type: {type(specifications)}. Keys: {list(specifications.keys()) if isinstance(specifications, dict) else 'N/A'}"
                print(error_detail) # Replace with logging
                # print(f"Problematic JSON: {str(specifications)[:500]}") # Replace with logging
                raise HTTPException(status_code=500, detail=f"AI generated unexpected JSON structure. {error_detail}")

            # print("Successfully generated and parsed specifications.") # Replace with logging
            return specifications

        except openai.APIError as e: # Catch general API errors (networking, server-side issues from OpenAI)
            print(f"OpenAI API error: {e.status_code} - {e.message if e.message else str(e)}") # Replace with logging
            raise HTTPException(status_code=getattr(e, 'status_code', 502), detail=f"AI service API error: {e.message if e.message else str(e)}")
        except openai.APITimeoutError as e:
            print(f"OpenAI API timeout: {str(e)}") # Replace with logging
            raise HTTPException(status_code=504, detail="AI service request timed out.")
        except openai.RateLimitError as e:
            print(f"OpenAI API rate limit exceeded: {e.message if e.message else str(e)}") # Replace with logging
            raise HTTPException(status_code=429, detail=f"AI service rate limit hit. Please try again later.")
        except openai.AuthenticationError as e: # Catch authentication errors
            print(f"OpenAI API Authentication Error: {e.message if e.message else str(e)}") # Replace with logging
            raise HTTPException(status_code=401, detail=f"AI service authentication failed. Check API key. Error: {e.message if e.message else str(e)}")
        except openai.InvalidRequestError as e: # Catch errors like malformed requests, invalid model
             print(f"OpenAI API Invalid Request Error: {e.message if e.message else str(e)} (Param: {e.param if e.param else 'N/A'})") # Replace with logging
             raise HTTPException(status_code=400, detail=f"AI service invalid request to OpenAI. Error: {e.message if e.message else str(e)} (Param: {e.param if e.param else 'N/A'})")
        except HTTPException: # Re-raise HTTPExceptions that were already handled (like JSON parsing issues)
            raise
        except Exception as e: # Catch any other unexpected errors
            print(f"An unexpected error occurred in AISpecService: {type(e).__name__} - {e}") # Replace with logging
            # Consider logging traceback for unexpected errors
            raise HTTPException(status_code=500, detail=f"Unexpected error in AI service: {type(e).__name__} - {str(e)}")


    def _build_prompt(self, project_name: str, project_description: str, project_goals: list[str]) -> str:
        goals_section = ""
        # Filter out empty or whitespace-only goals before joining
        valid_goals = [goal.strip() for goal in project_goals if goal and goal.strip()]
        if valid_goals:
            goals_string = "\n- ".join(valid_goals)
            goals_section = f"""\n
        Key Project Goals:
        - {goals_string}"""

        prompt = f"""
        You are an AI assistant tasked with generating functional specifications for a software project.
        The project details are as follows:

        Project Name: {project_name}

        Project Description:
        {project_description}{goals_section}

        Based on this information, please generate a comprehensive set of functional specifications.
        The specifications should be broken down into a hierarchy of Epics, Features, and User Stories.

        Output Format Instructions:
        - The entire output MUST be a single, valid JSON object.
        - The root of the JSON object must be a key named "epics", which is an array of epic objects.
        - Each epic object must have:
            - "title": A string for the epic's title.
            - "description": A string describing the epic.
            - "features": An array of feature objects related to this epic.
        - Each feature object must have:
            - "title": A string for the feature's title.
            - "description": A string describing the feature.
            - "user_stories": An array of strings, where each string is a user story.
        - Each user story string must follow the format: "As a [type of user], I want [an action] so that [a benefit/value]."

        Example JSON Structure:
        {{
          "epics": [
            {{
              "title": "User Account Management",
              "description": "Covers all aspects of user registration, login, profile management, and authentication.",
              "features": [
                {{
                  "title": "User Registration",
                  "description": "Allows new users to create an account.",
                  "user_stories": [
                    "As a new user, I want to be able to sign up with my email and password so that I can access the platform.",
                    "As a new user, I want to receive a confirmation email after registration so that I can verify my account."
                  ]
                }},
                {{
                  "title": "User Login",
                  "description": "Allows existing users to log in to their accounts.",
                  "user_stories": [
                    "As an existing user, I want to be able to log in with my credentials so that I can access my personalized content."
                  ]
                }}
              ]
            }},
            {{
              "title": "Product Catalog",
              "description": "Manages the display and organization of products available on the platform.",
              "features": [
                {{
                  "title": "Product Listing",
                  "description": "Displays products to users with filtering and sorting options.",
                  "user_stories": [
                    "As a customer, I want to be able to view a list of all available products so that I can browse what's for sale.",
                    "As a customer, I want to be able to filter products by category and price so that I can find relevant items quickly."
                  ]
                }}
              ]
            }}
          ]
        }}

        Please ensure the generated JSON is complete, well-formed, and strictly adheres to this structure.
        Do not include any explanatory text or markdown formatting outside the JSON object itself.
        Focus on creating meaningful and actionable specifications based on the project details.
        """
        return prompt
