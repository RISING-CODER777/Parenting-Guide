## 👶 Parenting-Guide

A web app for new moms to get parenting advice using AWS Bedrock, Lambda, API Gateway, S3, and React + Vite.

## 🛠️ Tech Stack

- **Frontend**: React + Vite  
- **Backend**: AWS Lambda, API Gateway  
- **AI Model**: AWS Bedrock (Meta LLaMA 3 8B Instruct)  
- **Storage**: AWS S3 (`aws-bedrock-parenting`)

## 🚀 Setup

### Backend
1. **Lambda Function**  
   - In AWS Lambda, create `ParentingGuideFunction`. 
   - Copy the code from `app.py` (in the backend directory) into the Lambda editor and save.  

2. **API Gateway**  
   - Create a REST API, add a `POST` method, link to `ParentingGuideFunction`, enable CORS for `http://localhost:5173`, and deploy.  

3. **S3 Configuration**  
   - Ensure the `aws-bedrock-parenting` bucket exists.  
   - **Bucket Policy**:  
     ```json
     {
         "Version": "2012-10-17",
         "Statement": [
             {
                 "Effect": "Allow",
                 "Principal": "*",
                 "Action": ["s3:GetObject", "s3:PutObject"],
                 "Resource": "arn:aws:s3:::aws-bedrock-parenting/audio-recordings/*"
             }
         ]
     }
     ```
   - **CORS Policy**:  
     ```json
     [
         {
             "AllowedHeaders": ["*"],
             "AllowedMethods": ["GET", "PUT", "HEAD"],
             "AllowedOrigins": ["*"],
             "ExposeHeaders": [],
             "MaxAgeSeconds": 3000
         }
     ]
     ```

4. **IAM Policies for Lambda**  
   | **Policy Name**            | **Type**      | **Attached Via** |  
   |----------------------------|---------------|------------------|  
   | AmazonS3FullAccess         | AWS managed   | Directly         |  
   | AmazonTranscribeFullAccess | AWS managed   | Directly         |  
   - **Custom Inline Policy**:  
     - Name: `BedrockInvokeModelPolicy`  
     - JSON:  
       ```json
       {
           "Version": "2012-10-17",
           "Statement": [
               {
                   "Effect": "Allow",
                   "Action": "bedrock:InvokeModel",
                   "Resource": "arn:aws:bedrock:us-east-1::model/meta.llama3-8b-instruct-v1:0"
               }
           ]
       }
       ```

### Frontend
1. **Install**  
   ```
   cd frontend/parenting-ai-ui
   npm install
   ```

2. **Set Up Environment Variables**  
   - Create a `.env` file in `frontend/parenting-ai-ui`.  
   - Add the following, replacing with your values:  
     ```
     VITE_API_URL=<your-api-gateway-url>
     VITE_AWS_REGION=<your-aws-region>
     VITE_AWS_ACCESS_KEY=<your-access-key>
     VITE_AWS_SECRET_KEY=<your-secret-key>
     VITE_S3_BUCKET=aws-bedrock-parenting
     ```

3. **Run**  
   ```
   npm run dev
   ```

## 📜 Resources

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)  
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)  
- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html)  
- [AWS S3 Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html)  
- [React + Vite Documentation](https://vitejs.dev/guide/)  
- [Meta LLaMA 3 Model on AWS Bedrock](https://aws.amazon.com/bedrock/llama-models/)  

## 💬 Feedback

Open an issue for suggestions!

---

Happy parenting! 🌟

---
