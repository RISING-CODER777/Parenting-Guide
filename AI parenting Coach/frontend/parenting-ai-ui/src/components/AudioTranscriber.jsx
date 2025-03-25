import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from "@aws-sdk/client-transcribe";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Load AWS credentials and configuration from environment variables
const REGION = import.meta.env.VITE_AWS_REGION;
const ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS_KEY;
const SECRET_KEY = import.meta.env.VITE_AWS_SECRET_KEY;
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET;

// Initialize S3 client (needed for presigned URL)
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

// Initialize Transcribe client
const transcribeService = new TranscribeClient({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

const AudioTranscriber = {
  transcribeAudio: async (fileName) => {
    try {
      const jobName = `transcribe-${Date.now()}`;
      console.log("Starting transcription job:", jobName);

      const params = {
        TranscriptionJobName: jobName,
        Media: {
          MediaFileUri: `s3://${S3_BUCKET}/audio-recordings/${fileName}`,
        },
        MediaFormat: "webm",
        LanguageCode: "en-US",
        OutputBucketName: S3_BUCKET,
        OutputKey: `transcriptions/${jobName}.json`,
      };

      console.log("Transcription job params:", params);
      await transcribeService.send(new StartTranscriptionJobCommand(params));
      console.log("Transcription started...");

      let jobStatus = "IN_PROGRESS";
      while (jobStatus === "IN_PROGRESS") {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        console.log("Checking transcription status...");

        const result = await transcribeService.send(
          new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
        );

        jobStatus = result.TranscriptionJob.TranscriptionJobStatus;
        console.log("Transcription status:", jobStatus);

        if (jobStatus === "COMPLETED") {
          const transcriptKey = `transcriptions/${jobName}.json`;
          console.log("Transcription file key:", transcriptKey);

          // Generate presigned URL for the transcription file
          const getCommand = new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: transcriptKey,
          });
          const transcriptUrl = await getSignedUrl(s3, getCommand, {
            expiresIn: 3600,
          });
          console.log("Presigned transcription URL:", transcriptUrl);

          try {
            const response = await fetch(transcriptUrl, {
              method: "GET",
              mode: "cors",
            });

            if (!response.ok) {
              throw new Error(`Fetch failed with status: ${response.status}`);
            }

            const data = await response.json();
            return data.results.transcripts[0].transcript;
          } catch (fetchError) {
            console.error("Fetch Error:", fetchError);
            throw new Error(
              "Failed to fetch transcription result: " + fetchError.message
            );
          }
        } else if (jobStatus === "FAILED") {
          console.error(
            "Transcription job failed:",
            result.TranscriptionJob.FailureReason
          );
          throw new Error("Transcription job failed.");
        }
      }
    } catch (error) {
      console.error("Transcription Error:", error);
      throw error; // Re-throw to let the caller handle it
    }
  },
};

export default AudioTranscriber;
