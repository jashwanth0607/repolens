\# 🔍 RepoLens



\### AI-Powered Repository Analysis \& Code Intelligence Platform



RepoLens is an AI-powered developer tool that analyzes software repositories and provides insights into \*\*code quality, security issues, dependencies, project structure, and potential improvements\*\*.



It combines a \*\*FastAPI backend\*\*, \*\*Next.js frontend\*\*, and \*\*Groq-powered AI analysis\*\* to turn a code repository into an easy-to-understand technical report.



\---



\## ✨ Features



\### 🤖 AI-Powered Code Analysis



Uses Groq-powered language models to analyze repository information and generate meaningful developer insights.



\### 🔐 Security Analysis



Identifies potential security concerns in the analyzed codebase and highlights areas that may require attention.



\### 🐛 Issue Detection



Scans repository files for potential issues and organizes findings into an understandable format.



\### 📦 Dependency Analysis



Examines project dependencies and provides information useful for understanding the project's software stack.



\### 📊 Code Quality Analysis



Analyzes repository structure and code characteristics to identify possible quality improvements.



\### 🏗️ Architecture Visualization



Provides an overview of the repository architecture so developers can understand how the different components are connected.



\### 📄 Analysis Reports



Generates structured analysis results that can be reviewed and downloaded for future reference.



\### 💬 AI Assistant



A dedicated AI assistant allows developers to interact with repository analysis results and ask questions about their project.



\---



\## 🧠 How RepoLens Works



```text

&#x20;                 ┌─────────────────────┐

&#x20;                 │     Developer       │

&#x20;                 │   Uploads / Selects │

&#x20;                 │     Repository      │

&#x20;                 └──────────┬──────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                 ┌─────────────────────┐

&#x20;                 │   RepoLens Frontend │

&#x20;                 │      Next.js        │

&#x20;                 └──────────┬──────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                 ┌─────────────────────┐

&#x20;                 │   FastAPI Backend   │

&#x20;                 └──────────┬──────────┘

&#x20;                            │

&#x20;             ┌──────────────┼──────────────┐

&#x20;             ▼              ▼              ▼

&#x20;      ┌────────────┐ ┌────────────┐ ┌────────────┐

&#x20;      │ Repository │ │  Security  │ │ Dependency │

&#x20;      │  Scanner   │ │  Analyzer  │ │  Analyzer  │

&#x20;      └────────────┘ └────────────┘ └────────────┘

&#x20;             │              │              │

&#x20;             └──────────────┼──────────────┘

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │ Quality \& Issue │

&#x20;                   │    Analysis     │

&#x20;                   └────────┬────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │   Groq AI       │

&#x20;                   │    Analysis     │

&#x20;                   └────────┬────────┘

&#x20;                            │

&#x20;                            ▼

&#x20;                   ┌─────────────────┐

&#x20;                   │ Analysis Report │

&#x20;                   │ + AI Assistant  │

&#x20;                   └─────────────────┘

```



\---



\## 🛠️ Tech Stack



\### Frontend



\* \*\*Next.js\*\*

\* \*\*React\*\*

\* \*\*TypeScript\*\*

\* \*\*CSS\*\*

\* ESLint



\### Backend



\* \*\*Python\*\*

\* \*\*FastAPI\*\*

\* Repository analysis services

\* REST API architecture



\### AI



\* \*\*Groq API\*\*

\* Large Language Model powered analysis



\### Development Tools



\* Git

\* GitHub

\* VS Code

\* npm

\* Python virtual environments



\---



\## 📁 Project Structure



```text

RepoLens/

│

├── backend/

│   ├── main.py

│   ├── requirements.txt

│   │

│   ├── services/

│   │   ├── dependency\_analyzer.py

│   │   ├── groq\_service.py

│   │   ├── issue\_scanner.py

│   │   ├── quality\_analyzer.py

│   │   ├── repository\_scanner.py

│   │   └── security\_analyzer.py

│   │

│   └── .env.example

│

├── frontend/

│   ├── app/

│   │   ├── globals.css

│   │   ├── layout.tsx

│   │   └── page.tsx

│   │

│   ├── components/

│   │   ├── AIAssistant.tsx

│   │   ├── AnalysisDashboard.tsx

│   │   ├── ArchitectureView.tsx

│   │   ├── ReportDownloadButton.tsx

│   │   ├── RepositoryAnalyzer.tsx

│   │   └── Sidebar.tsx

│   │

│   ├── lib/

│   │   └── types.ts

│   │

│   └── package.json

│

├── package.json

├── package-lock.json

└── README.md

```



\---



\## 🚀 Getting Started



\### Prerequisites



Make sure you have the following installed:



\* Python 3.10+

\* Node.js 18+

\* npm

\* Git

\* A Groq API key



\---



\## 1. Clone the Repository



```bash

git clone https://github.com/jashwanth0607/repolens.git

cd repolens

```



\---



\## 2. Backend Setup



Navigate to the backend:



```bash

cd backend

```



Create a virtual environment:



\### Windows



```powershell

python -m venv venv

```



Activate it:



```powershell

venv\\Scripts\\Activate.ps1

```



\### Linux / macOS



```bash

python3 -m venv venv

source venv/bin/activate

```



Install dependencies:



```bash

pip install -r requirements.txt

```



\---



\## 3. Configure the Groq API



Create a `.env` file inside the `backend` directory:



```text

backend/.env

```



Add:



```env

GROQ\_API\_KEY=your\_groq\_api\_key\_here

```



> ⚠️ Never commit `.env` to GitHub. The repository already includes `.gitignore` rules to keep API keys out of version control.



\---



\## 4. Start the Backend



From the `backend` directory:



```bash

uvicorn main:app --reload

```



The backend will be available at:



```text

http://127.0.0.1:8000

```



FastAPI documentation:



```text

http://127.0.0.1:8000/docs

```



\---



\## 5. Start the Frontend



Open another terminal and return to the project root:



```bash

cd repolens

```



Then:



```bash

cd frontend

npm install

npm run dev

```



The frontend will normally be available at:



```text

http://localhost:3000

```



Open the address in your browser.



\---



\## 🔄 Application Workflow



```text

Repository

&#x20;   │

&#x20;   ▼

Repository Scanner

&#x20;   │

&#x20;   ├──► Dependency Analysis

&#x20;   │

&#x20;   ├──► Security Analysis

&#x20;   │

&#x20;   ├──► Issue Detection

&#x20;   │

&#x20;   └──► Quality Analysis

&#x20;             │

&#x20;             ▼

&#x20;         Groq AI

&#x20;             │

&#x20;             ▼

&#x20;      Analysis Results

&#x20;             │

&#x20;      ┌──────┼──────┐

&#x20;      ▼      ▼      ▼

&#x20;  Dashboard Architecture AI Assistant

&#x20;      │

&#x20;      ▼

&#x20;  Downloadable Report

```



\---



\## 🎯 Use Cases



RepoLens can be useful for:



\* 👨‍💻 Developers reviewing unfamiliar repositories

\* 🎓 Students learning software project structure

\* 🔎 Developers performing preliminary code reviews

\* 🛡️ Identifying potential security concerns

\* 📦 Understanding project dependencies

\* 🏗️ Understanding repository architecture

\* 📊 Generating structured project analysis

\* 🤖 Interacting with repository insights using AI



\---



\## 🔐 Security



RepoLens is designed with API-key protection in mind.



Sensitive environment files such as:



```text

.env

.env.\*

```



are excluded from version control.



Developers should always store API credentials locally and use environment variables rather than hardcoding secrets in source code.



\---



\## 📌 Current Status



\*\*Status: Active Development\*\*



Current capabilities include:



\* Repository scanning

\* Security analysis

\* Dependency analysis

\* Issue scanning

\* Code quality analysis

\* AI-powered analysis

\* Architecture visualization

\* AI assistant

\* Report generation



Future improvements may include:



\* Pull request analysis

\* GitHub repository integration

\* Historical code-quality tracking

\* More programming-language support

\* Automated fix suggestions

\* Advanced repository metrics

\* CI/CD integration



\---



\## 🧪 Development



Backend:



```bash

uvicorn main:app --reload

```



Frontend:



```bash

npm run dev

```



Build the frontend:



```bash

npm run build

```



\---



\## 🤝 Contributing



Contributions and suggestions are welcome.



1\. Fork the repository

2\. Create a feature branch



```bash

git checkout -b feature/your-feature

```



3\. Make your changes

4\. Commit your changes



```bash

git commit -m "Add your feature"

```



5\. Push the branch



```bash

git push origin feature/your-feature

```



6\. Open a Pull Request



\---



\## 📄 License



This project is currently intended as a portfolio and learning project.



A formal open-source license can be added in a future release.



\---



\## 👨‍💻 Author



\*\*Jashwanth Allamneni\*\*



GitHub: \[@jashwanth0607](https://github.com/jashwanth0607)



\---



⭐ If you find RepoLens interesting, consider giving the repository a star.



