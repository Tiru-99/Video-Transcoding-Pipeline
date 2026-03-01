# 🚀 Video Processing Microservices Architecture

This project is a distributed video processing system built using **Bun**, **AWS S3**, **AWS SQS**, and **Docker-based workers**.

It consists of three independent services:

- 🎨 Frontend Service  
- 📤 Upload Service  
- ⚙️ Worker Service  

---

# 🏗️ Architecture Overview

The architecture diagram is available in the root folder:

```
architecture.png
```

It describes:

Frontend → Upload Service → S3 (Temporary) → SQS → Worker → S3 (Permanent)

---

# 🧩 System Flow

1. User uploads video via Frontend  
2. Upload Service stores file in Temporary S3 bucket  
3. S3 triggers an event → pushes message to SQS  
4. Worker Service consumes SQS message  
5. Worker processes video (Docker pipeline)  
6. Processed video uploaded to Permanent S3 bucket  

---

# 🛠️ Tech Stack

- Runtime: Bun
- Cloud: AWS S3, AWS SQS
- Containerization: Docker
- Architecture: Event-driven microservices

---

# 📦 Project Structure

```
root/
│
├── frontend/
│   └── sampleenv.txt
│
├── upload-service/
│   └── sampleenv.txt
│
├── worker-service/
│   └── sampleenv.txt
│
└── architecture.png
```

---

# ⚙️ Prerequisites

Make sure you have installed:

- Bun
- Docker
- AWS account with S3 and SQS access

---

# ☁️ AWS Setup (IMPORTANT)

## 1️⃣ Create Two S3 Buckets

You MUST create two buckets:

### 🟡 Temporary Upload Bucket
Used by Upload Service for raw uploads.

Example:
```
my-app-temp-uploads
```

### 🟢 Permanent Upload Bucket
Used by Worker Service for processed videos.

Example:
```
my-app-processed-videos
```

---

## 2️⃣ Create an SQS Queue

Create a Standard SQS queue.

Example:
```
video-processing-queue
```

Copy:
- Queue URL
- Queue ARN

---

## 3️⃣ Connect S3 → SQS (CRITICAL STEP)

You must configure Event Notification on the Temporary Upload Bucket.

Steps:

1. Open AWS S3
2. Go to Temporary Upload Bucket
3. Go to Properties
4. Scroll to Event Notifications
5. Create Event Notification
6. Select:
   - Event type: All object create events
7. Destination:
   - Choose SQS Queue
   - Select your created queue

⚠️ Make sure SQS policy allows S3 to send messages.

Without this step, Worker will not receive messages.

---

# 🔐 Environment Setup (ALL SERVICES)

Each service contains:

```
sampleenv.txt
```

You MUST copy it:

```bash
cp sampleenv.txt .env
```

Fill all required environment variables before running.

If `.env` is not configured properly, the service will fail.

---

# 🎨 Frontend Service

### Install

```bash
cd frontend
bun install
```

### Run

```bash
bun run dev
```

---

# 📤 Upload Service

Handles file uploads and pushes them to S3.

### Install

```bash
cd upload-service
bun install
```

### Run

```bash
bun run dev
```

Required environment variables include:

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- TEMP_S3_BUCKET_NAME
- SQS_QUEUE_URL

---

# ⚙️ Worker Service (Docker Required)

⚠️ Docker is REQUIRED for this service.

This service runs a video processing pipeline inside Docker containers.

### Check Docker

```bash
docker --version
docker ps
```

If Docker is not running, start it before continuing.

### Install

```bash
cd worker-service
bun install
```

### Run

```bash
bun run dev
```

---

# 🐳 Worker Processing Pipeline

Worker does the following:

- Pull video from Temporary S3 bucket
- Run Docker-based processing pipeline
- Transcode / convert video formats
- Upload processed output to Permanent S3 bucket

---

# ▶️ Running the Full System

Start services in this order:

1. Worker Service (Docker must be running)
2. Upload Service
3. Frontend Service

Then:

- Upload a video from frontend
- Verify it appears in Temporary S3 bucket
- Check SQS receives message
- Verify Worker processes it
- Confirm processed video appears in Permanent S3 bucket

---

# 🧠 Key Concepts Used

- Event-driven architecture
- Asynchronous processing with SQS
- AWS S3 object storage
- Distributed microservices
- Dockerized media pipeline

---

# 📌 Important Notes

- Docker is mandatory for Worker Service
- Two S3 buckets are required
- S3 → SQS event wiring is mandatory
- All services require proper `.env` setup
- Bun must be installed globally

---

# 📄 License

MIT License