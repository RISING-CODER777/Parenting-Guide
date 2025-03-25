import boto3
import botocore.config
import json
from datetime import datetime

def generate_parenting_advice(query: str) -> str:
    prompt = f"""Human: I need expert parenting guidance on: {query}.  
             Provide detailed, practical, and empathetic advice tailored for new moms, focusing solely on the parenting query. Avoid medical tangents (e.g., defining fever) unless directly relevant to the parenting question.  
             Format your response with bold section headers (using **text**) and use line breaks (\n) to separate each point for a neat, list-like structure instead of a big paragraph.Here’s an example format:

**Section Header**
- Point 1
- Point 2

Assistant:"""

    body = {
        "prompt": prompt,
        "max_gen_len": 1024,
        "temperature": 0.7,
        "top_p": 0.95
    }

    try:
        bedrock = boto3.client("bedrock-runtime", region_name="us-east-1",
                               config=botocore.config.Config(read_timeout=300, retries={'max_attempts': 3}))
        response = bedrock.invoke_model(body=json.dumps(body), modelId="meta.llama3-8b-instruct-v1:0")

        response_content = response.get('body').read()
        response_data = json.loads(response_content)
        advice_details = response_data.get('generation', 'No advice available at the moment.')
        return advice_details
    except Exception as e:
        print(f"Error generating parenting advice: {e}")
        return "Error processing your request. Please try again later."

def save_advice_to_s3(s3_key, s3_bucket, advice_text):
    s3 = boto3.client('s3')

    try:
        s3.put_object(Bucket=s3_bucket, Key=s3_key, Body=advice_text)
        print("Advice successfully saved to S3")
    except Exception as e:
        print("Error when saving advice to S3: ", e)

def lambda_handler(event, context):
    event = json.loads(event['body'])
    parenting_query = event.get('query', 'General parenting advice')

    advice_text = generate_parenting_advice(query=parenting_query)

    if advice_text and "Error" not in advice_text:
        current_time = datetime.now().strftime('%Y%m%d_%H%M%S')
        s3_key = f"parenting-advice/{current_time}.txt"
        s3_bucket = 'aws-bedrock-parenting'  
        save_advice_to_s3(s3_key, s3_bucket, advice_text)
    else:
        print("No valid parenting advice was generated")

    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': 'http://localhost:5173',  
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
        'body': json.dumps({'message': 'Parenting advice generation completed', 'advice': advice_text})
    }