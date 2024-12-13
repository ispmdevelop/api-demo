# POC Policy API powered by AI

## 1. Install dependencies
`yarn install`

## 2. Fill out variables environments
* LOCAL_SERVER_LISTENING= (Set to true to run as express server) (false is to run in aws lambda)
* PORT=(Port to run the express application)
* OPEN_AI_CONFIG={"key": "","model": "gpt-4o-mini","temperature": 0, "maxRetries": 3} (fill the api key from open ai)
*  LANGCHAIN_TRACING_V2=true (optional for langchain tracing)
* LANGCHAIN_ENDPOINT="https://api.smith.langchain.com"(optional for langchain tracing)
* LANGCHAIN_API_KEY="" (optional for langchain tracing)
* LANGCHAIN_PROJECT="" (optional for langchain tracing)
* BEDROCK_AWS_ACCESS_KEY_ID= (optional for claude model from aws)
* BEDROCK_AWS_SECRET_ACCESS_KEY=(optional for claude model from aws)
* BEDROCK_AWS_REGION=us-east-1 (optional for claude model from aws)
* PREFER_BEDROCK_MODEL="anthropic.claude-3-sonnet-20240229-v1:0" (optional for claude model from aws, leave empty to use Open AI config)


## 3. Run the project
`yarn run start`

## 4. Postman collection on root dir:
