import { useState, useRef } from "react";
import { Input, Button, message } from "antd";
import { AudioOutlined, SendOutlined } from "@ant-design/icons";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import AudioTranscriber from "./AudioTranscriber"; // Import the new component

// Load AWS credentials and configuration from environment variables
const REGION = import.meta.env.VITE_AWS_REGION;
const ACCESS_KEY = import.meta.env.VITE_AWS_ACCESS_KEY;
const SECRET_KEY = import.meta.env.VITE_AWS_SECRET_KEY;
const S3_BUCKET = import.meta.env.VITE_S3_BUCKET;

// Initialize S3 client
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
});

const AdviceForm = ({ onSubmit }) => {
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone access granted.");

      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("Audio data available:", event.data);
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        console.log("Recording stopped. Processing audio...");
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const fileName = `audio-${Date.now()}.webm`;
          console.log("Audio file created:", fileName);

          message.loading("Uploading audio...");
          const s3UploadUrl = await uploadToS3(audioBlob, fileName);
          if (!s3UploadUrl) throw new Error("S3 upload failed");
          console.log("Audio uploaded to S3:", s3UploadUrl);
          message.success("Audio uploaded successfully!");

          await verifyS3Object(fileName);

          message.loading("Transcribing audio...");
          const transcription = await AudioTranscriber.transcribeAudio(
            fileName
          ); // Call the new component
          if (!transcription) throw new Error("Transcription failed");
          console.log("Transcription result:", transcription);
          message.success("Transcription complete!");
          setQuery(transcription);
        } catch (error) {
          console.error("Error processing audio:", error);
          message.error("Error processing audio: " + error.message);
        }
      };

      recorder.start();
      setListening(true);
      console.log("Recording started...");
    } catch (error) {
      console.error("Microphone access denied:", error);
      message.error("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      console.log("Stopping recording...");
      mediaRecorder.stop();
      setListening(false);
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  };

  const uploadToS3 = async (audioBlob, fileName) => {
    try {
      console.log("Starting upload to S3...");
      const arrayBuffer = await audioBlob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const filePath = `audio-recordings/${fileName}`;

      const params = {
        Bucket: S3_BUCKET,
        Key: filePath,
        Body: buffer,
        ContentType: "audio/webm",
      };

      console.log("Upload params:", params);
      const command = new PutObjectCommand(params);
      console.log("Generated PutObjectCommand:", command);

      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
      console.log("Presigned URL for manual testing:", presignedUrl);

      const uploadResult = await s3.send(command);
      console.log("Upload successful:", uploadResult);
      console.log("ETag:", uploadResult.ETag);

      return `s3://${S3_BUCKET}/${filePath}`;
    } catch (error) {
      console.error("Upload Error Details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: error.code,
      });
      message.error("Error uploading to S3: " + error.message);
      return null;
    }
  };

  const verifyS3Object = async (fileName) => {
    const filePath = `audio-recordings/${fileName}`;
    try {
      const params = {
        Bucket: S3_BUCKET,
        Key: filePath,
      };
      const headResult = await s3.send(new HeadObjectCommand(params));
      console.log(`Verified S3 object exists: ${filePath}`, headResult);
    } catch (error) {
      console.error("S3 object verification failed:", error);
      throw new Error(
        `S3 object ${filePath} does not exist or is inaccessible: ${error.message}`
      );
    }
  };

  const handleSubmit = () => {
    if (!query.trim()) return;
    console.log("Submitting query:", query);
    onSubmit(query);
    setQuery("");
  };

  return (
    <div className="form-container">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask parenting advice..."
        size="large"
        addonAfter={
          listening ? (
            <AudioOutlined
              onClick={stopRecording}
              style={{ cursor: "pointer", color: "red" }}
            />
          ) : (
            <AudioOutlined
              onClick={startRecording}
              style={{ cursor: "pointer", color: "gray" }}
            />
          )
        }
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSubmit}
        style={{ marginTop: 10 }}
      >
        Submit
      </Button>
    </div>
  );
};

export default AdviceForm;
