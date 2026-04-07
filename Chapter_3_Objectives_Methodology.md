# CHAPTER 3: OBJECTIVES AND METHODOLOGY

This chapter presents the objectives and methodology of the proposed AI Career Mapping Platform. The system is designed to assist users in identifying suitable career paths by analyzing their resumes, extracting skills, performing skill gap analysis, and generating AI-based learning roadmaps.

The methodology includes data acquisition, document parsing, skill extraction, readiness assessment, AI roadmap generation, system architecture, authentication, database design, and testing procedures.

## 3.1 Objectives of the Proposed Work

The main objectives of the AI Career Mapping Platform are listed below:

### 3.1.1 Secure User Authentication
The system provides secure user registration and login functionality. Authentication is implemented using **JSON Web Token (JWT)** to maintain secure stateless sessions.
- **User Data Privacy**: Protects personal information and career history.
- **Access Control**: Ensures only authenticated users can upload resumes and view private dashboards.
- **Data Persistence**: Allows users to retrieve and track previous analyses over time.

### 3.1.2 Resume Processing and Career Alignment
Users can upload resumes in **PDF** or **DOCX** formats. After uploading, the user selects a **Target Career** (e.g., Frontend Developer, Data Scientist, Full Stack Developer). This selection serves as the "Gold Standard" or reference model for the gap analysis.

### 3.1.3 Advanced Resume Parsing
The platform utilizes specialized libraries to convert binary document formats into structured text:
- **pdf-parse**: For extracting text from PDF documents.
- **mammoth**: For converting DOCX files to plain text without losing structural context.
The extracted text undergoes a cleaning phase to remove redundant whitespace, special characters, and non-informative bullet points.

### 3.1.4 Intelligent Skill Extraction
Unlike simple keyword matching, the system employs a multi-layered extraction strategy:
- **Section Scouting**: Identifies headers like "Technical Skills" or "Technologies" to focus extraction on relevant sections.
- **Normalization Engine**: Maps variations (e.g., "ReactJS", "React.js") to a canonical skill name ("React") using a predefined normalization dictionary.
- **Boundary-Aware Matching**: Uses Regular Expressions (Regex) with word boundaries to avoid false positives (e.g., matching "Java" inside "JavaScript").

### 3.1.5 Skill Gap Analysis and Feasibility Scoring
The system performs a logic-based comparison between the **User's Skill Profile** and the **Target Career Requirements**.
- **Matched Skills**: Indicators of existing competence.
- **Missing Skills**: The primary input for the learning roadmap.
- **Readiness Score**: Quantified as:
  $$Percentage = \left( \frac{\text{Matched Skills}}{\text{Total Required Skills}} \right) \times 100$$
- **Feasibility Assessment**: Categorizes the career transition as **High, Medium, or Low** feasibility based on the readiness score thresholds (e.g., >75% for High).

### 3.1.6 AI-Powered Learning Roadmap Generation
The system integrates the **Groq API** (Llama 3.1 8B Instant) to generate a personalized curriculum.
- **Focus Areas**: AI prioritizes missing skills while maintaining a logical progression from Foundations to Advanced Projects.
- **Dynamic Duration**: Roadmaps are scaled to the user's specified timeframe (e.g., 1 month vs 6 months).
- **Practical Milestones**: Each phase includes specific project suggestions and estimated learning hours.

### 3.1.7 Career Intelligence Dashboard
A centralized hub that visualizes:
- **Resume Match Percentage**: Interactive charts showing career alignment.
- **Skill Comparison Matrix**: Visual representation of "Current vs. Required" skills.
- **Alternative Career Suggestions**: Recommends top 3 careers the user might be qualified for based on their current skills.
- **Mentorship Eligibility**: If the readiness score exceeds 50%, users are prompted to contribute as mentors.

---

## 3.2 Methodology

The system follows a **Pipeline Architecture**, ensuring data flows seamlessly through various processing stages.

### 3.2.1 Data Acquisition Layer
Collecting user inputs including credentials, resume files, and career goals.
- **Multer Middleware**: Handles multipart/form-data for secure file uploads.
- **Validation**: Enforces file size limits and mimetype restrictions (PDF/DOCX).
- **Cleanup**: Temporary files are instantly deleted from the server (`fs.unlinkSync`) after processing to ensure zero-footprint data security.

### 3.2.2 Processing Layer (Parsing & Extraction)
1. **Format Identification**: Deterministic check of file extensions.
2. **Text Normalization**: Cleaning the raw output from `pdf-parse` or `mammoth`.
3. **Skill Dictionary Lookup**: Comparing extracted text against a curated database of common technical skills categorized by domain.

### 3.2.3 Analytics Layer (Gap Analysis)
- **Intersection Logic**: Efficient array operations in Node.js to find the intersection of "User Skills" and "Career Requirements".
- **Difference Logic**: Identifying the delta (Missing Skills).
- **Readiness Calculation**: Mathematical computation of the career fit score.

### 3.2.4 AI Generation Layer
- **Prompt Engineering**: The backend constructs a structured "System Prompt" for Llama 3.1, enforcing a specific JSON schema output.
- **Post-Processing**: Validating the AI-generated JSON before sending it to the frontend to prevent UI breaks.

### 3.2.5 UI/UX Component Layer
Built using **React 19** and **Tailwind CSS**, the interface prioritizes clarity and speed.
- **Framer Motion**: Used for smooth transitions between analysis steps.
- **State Management**: React Hooks manage the complex state of resume analysis and roadmap data.

---

## 3.3 Experimental Setup

### 3.3.1 System Architecture
The platform follows a **Client-Server Architecture**:
- **Client**: Single Page Application (SPA) for interactive visualization.
- **Server**: RESTful API built with Express.js for processing logic.
- **Database**: MongoDB for storing user profiles, skill assessments, and roadmaps.
- **AI Engine**: Groq API provides high-speed inference for Llama 3.1.

### 3.3.2 Technology Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, Framer Motion, Vite |
| **Backend** | Node.js, Express 5.0 (Beta) |
| **AI Processing** | Groq Cloud (Llama 3.1 8B) |
| **Database** | MongoDB (NoSQL) |
| **Authentication** | JSON Web Tokens (JWT), BcryptJS |
| **Cloud Hosting** | Render (Web Services) |

### 3.3.3 Testing and Validation
1. **API Validation**: Tested endpoints using Postman for authentication, upload, and analysis flows.
2. **Parsing Accuracy**: Verified text extraction accuracy across various resume templates (single-column vs. multi-column).
3. **User Acceptance Testing (UAT)**: Manual testing of the end-to-end flow from registration to viewing the roadmap.
4. **Performance Testing**: Ensured AI response times remain under 3 seconds for optimal user experience.
