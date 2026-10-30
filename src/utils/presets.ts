import { ResumeAnalysisRecord, JobMatchRecord } from '../types';

export const SAMPLE_RESUMES: {
  id: string;
  name: string;
  role: string;
  description: string;
  rawText: string;
}[] = [
  {
    id: 'ai-ml-grad',
    name: 'Alex Rivera — AI & Data Science Candidate',
    role: 'AI / ML Engineer',
    description: 'B.S. in Computer Science with focus on Deep Learning, PyTorch, Python, and Computer Vision.',
    rawText: `ALEX RIVERA
Email: alex.rivera@example.com | Phone: (555) 349-2810 | Location: Austin, TX | LinkedIn: linkedin.com/in/alexrivera-ai | GitHub: github.com/alexrivera

SUMMARY
Results-driven Computer Science graduate specialized in Machine Learning, Computer Vision, and Neural Networks. Built high-accuracy sentiment analysis pipelines and real-time object detection systems. Seeking an AI/ML Engineer or Data Scientist role.

EDUCATION
University of Texas at Austin — B.S. in Computer Science, Minor in Mathematics
Graduation: May 2024 | GPA: 3.82/4.0
Honors: Dean's Honor List (4 semesters), ACM Student Chapter Technical Lead

TECHNICAL SKILLS
• Programming Languages: Python, C++, SQL, JavaScript, R
• Machine Learning / AI: PyTorch, TensorFlow, Scikit-Learn, Pandas, NumPy, OpenCV, Hugging Face Transformers
• Tools & Platforms: Git, Docker, Linux, Jupyter Notebook, Weights & Biases, FastAPI
• Databases: PostgreSQL, MongoDB, Redis
• Cloud & DevOps: AWS (S3, EC2), Google Cloud Platform (basic)

PROJECTS
1. Real-Time Autonomous Drone Vision System (PyTorch, OpenCV, ROS, FastAPI)
• Engineered a real-time object tracking pipeline using YOLOv8, reaching 42 FPS on edge hardware.
• Decreased detection latency by 35% through FP16 quantization and ONNX runtime integration.
• Deployed microservice backend using FastAPI and Docker containers.

2. Multimodal Medical Diagnosis Assistant (TensorFlow, BERT, Python)
• Trained fine-tuned BERT & ResNet model on 120,000 anonymized chest X-rays and radiology reports.
• Achieved 94.2% diagnostic accuracy, outperforming baseline models by 8.7%.
• Published findings in IEEE Student Symposium on Healthcare AI.

3. Distributed Sentiment & Topic Modeling Pipeline (PySpark, Kafka, PostgreSQL)
• Streamed and processed 500k+ daily social tweets using Apache Kafka and PySpark NLP.
• Visualized trend clusters with interactive Streamlit dashboard.

EXPERIENCE & INTERNSHIPS
Machine Learning Engineering Intern — CognitiveScale (June 2023 – August 2023)
• Developed automated data cleansing and feature engineering pipelines in Python/Pandas for enterprise clients.
• Refactored model serving endpoints to utilize async batching, cutting AWS server costs by 22%.
• Collaborated in weekly Agile scrums with 8 senior ML practitioners and data engineers.

CERTIFICATIONS
• DeepLearning.AI Deep Learning Specialization (Coursera, 2023)
• AWS Certified Cloud Practitioner (2024)

ACHIEVEMENTS
• 1st Place Winner — HackTX 2023 (Best Generative AI Hack, 350+ competing teams)
• University Merit Scholarship recipient (2020 – 2024)`
  },
  {
    id: 'fullstack-web',
    name: 'Sarah Chen — Full Stack Web Engineer',
    role: 'Full Stack Developer',
    description: 'React, Node.js, TypeScript, PostgreSQL, and Cloud microservices developer.',
    rawText: `SARAH CHEN
Email: sarah.chen@example.com | Phone: (555) 782-9912 | Location: Seattle, WA | Portfolio: sarahchen.dev

SUMMARY
Innovative Full Stack Software Engineer with 2 years of hands-on project and startup internship experience. Proficient in React, Next.js, Node.js, TypeScript, and distributed database design. Passionate about building fast, accessible web applications.

EDUCATION
University of Washington — B.S. in Informatics (Software Engineering Track)
Graduation: June 2024 | GPA: 3.75/4.0

TECHNICAL SKILLS
• Programming Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
• Frontend: React, Next.js, Tailwind CSS, Redux Toolkit, Framer Motion, Jest
• Backend: Node.js, Express, REST APIs, GraphQL, Prisma ORM, WebSockets
• Databases: PostgreSQL, Supabase, Redis
• DevOps & Tools: Git, GitHub Actions, Docker, Vercel, AWS (S3, Lambda)

PROJECTS
1. CollabBoard: Real-Time Collaborative Whiteboard (React, TypeScript, WebSockets, Canvas)
• Designed end-to-end multi-tenant collaborative canvas supporting 50+ concurrent users per room with CRDT synchronization.
• Built vector drawing tools, sticky notes, and instant export to SVG/PDF.
• Reached 10,000+ monthly active users and 450 GitHub stars.

2. DevHire: Applicant Tracking & Portfolio Builder (Next.js, Tailwind CSS, PostgreSQL, Prisma)
• Architected a responsive SaaS application featuring ATS resume scoring and custom developer portfolios.
• Integrated Stripe subscription billing and automated webhook handling.
• Achieved 98/100 Google Lighthouse performance score.

EXPERIENCE
Software Engineering Intern — CloudScale Software (June 2023 – Sept 2023)
• Modernized legacy UI components to React 18 and Tailwind CSS, increasing page load speed by 28%.
• Implemented end-to-end Cypress test suites covering 85% of critical checkout user flows.
• Authored comprehensive developer documentation and reusable component library.

CERTIFICATIONS & AWARDS
• Meta Front-End Developer Professional Certificate (2023)
• 2nd Place — DubHacks 2022 (Best Web Application)`
  },
  {
    id: 'data-analyst',
    name: 'David Patel — Data & BI Analyst',
    role: 'Data Analyst / Business Intelligence',
    description: 'Strong SQL, Tableau, Power BI, Python, and business metrics modeling.',
    rawText: `DAVID PATEL
Email: david.patel@example.com | Phone: (555) 412-8831 | Location: Chicago, IL | LinkedIn: linkedin.com/in/david-patel-data

SUMMARY
Analytical and business-oriented Data Analyst with a track record of transforming messy business data into actionable growth strategies. Master of SQL queries, Tableau dashboards, and predictive forecasting with Python.

EDUCATION
University of Illinois Urbana-Champaign — B.S. in Information Systems & Analytics
Graduation: May 2024 | GPA: 3.68/4.0

TECHNICAL SKILLS
• Analytics & Querying: Advanced SQL, Python (Pandas, NumPy, Matplotlib, Seaborn), Excel (VLOOKUP, Pivot Tables, Macros)
• Business Intelligence: Tableau, Power BI, Looker Studio, Metabase
• Data Warehousing: Snowflake, Google BigQuery, PostgreSQL
• Statistics & Modeling: Regression Analysis, A/B Testing, Cohort Retention, Time Series Forecasting

PROJECTS
1. E-Commerce Customer Lifetime Value & Churn Predictor (Python, SQL, Tableau)
• Extracted and transformed 2.4M transaction rows using PostgreSQL window functions.
• Built logistic regression and random forest models predicting churn with 88% precision.
• Created executive Tableau dashboards tracking weekly cohort retention for product managers.

2. Supply Chain Optimization Analytics (BigQuery, Power BI, Python)
• Identified supplier delivery bottlenecks across 14 distribution centers, pinpointing $140,000 in annual freight cost savings.

EXPERIENCE
Data Analytics Intern — Horizon Financial Group (June 2023 – August 2023)
• Automated 12 recurring manual weekly revenue reports using SQL scripts and Python mailers.
• Developed an interactive Power BI dashboard utilized by senior vice presidents for quarterly reviews.

CERTIFICATIONS
• Google Data Analytics Professional Certificate
• Tableau Desktop Specialist`
  }
];

export const SAMPLE_JOB_DESCRIPTIONS: {
  id: string;
  title: string;
  company: string;
  location: string;
  experienceLevel: string;
  description: string;
}[] = [
  {
    id: 'ai-ml-eng',
    title: 'Junior AI / Machine Learning Engineer',
    company: 'Apex Intelligence Labs',
    location: 'Austin, TX (Hybrid)',
    experienceLevel: 'Entry to 1 Year',
    description: `About Apex Intelligence Labs:
We build state-of-the-art vision and natural language processing solutions for industrial automation and smart cities.

Role Overview:
We are seeking an enthusiastic AI/ML Engineer to join our core intelligence team. You will train, evaluate, optimize, and deploy neural network architectures to production environments.

Responsibilities:
• Implement computer vision and deep learning models using PyTorch or TensorFlow.
• Build automated feature engineering and data preprocessing pipelines with Python, Pandas, and NumPy.
• Optimize model inference latency using ONNX, TensorRT, or quantization techniques for edge deployment.
• Work with SQL and PostgreSQL databases to query, clean, and annotate multimodal training datasets.
• Containerize AI services with Docker and deploy microservices with FastAPI and AWS (EC2, S3).
• Participate in code reviews, technical presentations, and agile sprint planning.

Requirements & Qualifications:
• Bachelor's or Master's degree in Computer Science, Data Science, or related STEM field.
• Strong programming fundamentals in Python and familiarity with C++ or Linux shell scripting.
• Hands-on experience with PyTorch, TensorFlow, Scikit-learn, OpenCV, or Hugging Face.
• Solid understanding of linear algebra, calculus, probability, and neural network fundamentals.
• Familiarity with Git version control, Docker containerization, and REST APIs.
• Strong communication skills and collaborative team mindset.

Nice to Have:
• Experience with cloud platforms (AWS, GCP).
• Published student research or hackathon achievements in AI.
• Familiarity with Kubernetes and MLOps tools like MLflow or Weights & Biases.`
  },
  {
    id: 'fullstack-dev',
    title: 'Associate Full Stack Developer',
    company: 'Nova Digital Systems',
    location: 'Remote / Seattle, WA',
    experienceLevel: '0 - 2 Years',
    description: `Nova Digital Systems is looking for an Associate Full Stack Developer to build modern cloud applications.

What You'll Do:
• Develop responsive, accessible web interfaces using React, TypeScript, and Tailwind CSS.
• Design and maintain robust RESTful and GraphQL APIs using Node.js and Express.
• Write clean, maintainable SQL queries and schema migrations with PostgreSQL and Prisma ORM.
• Implement automated unit and end-to-end test suites using Jest or Cypress.
• Deploy serverless workflows and manage assets on AWS (S3, CloudFront).
• Collaborate with UI/UX designers and product managers to deliver engaging customer experiences.

Requirements:
• Degree in Computer Science, Software Engineering, or equivalent practical experience.
• Proficiency in TypeScript, JavaScript (ES6+), React, and Node.js.
• Understanding of relational databases (PostgreSQL or MySQL) and indexing.
• Experience with Git, GitHub pull request workflows, and CI/CD pipelines.
• Familiarity with Docker and basic cloud deployment concepts.
• Passion for clean code, code review culture, and continuous learning.`
  },
  {
    id: 'data-scientist',
    title: 'Junior Data Scientist',
    company: 'Vanguard Analytics',
    location: 'Chicago, IL (Hybrid)',
    experienceLevel: 'Entry-Level',
    description: `Vanguard Analytics provides predictive insights for enterprise retail and fintech clients.

Role Responsibilities:
• Formulate business problems into statistical and machine learning models.
• Write complex SQL queries to extract data from Snowflake and BigQuery data lakes.
• Perform exploratory data analysis (EDA), hypothesis testing, and A/B test evaluation using Python (Pandas, SciPy).
• Build regression, classification, and clustering models using Scikit-Learn and XGBoost.
• Create compelling visualizations and dashboards in Tableau or Power BI.
• Present analytical insights and strategic recommendations to non-technical stakeholders.

Qualifications:
• Degree in Statistics, Mathematics, Computer Science, Economics, or Analytics.
• Strong SQL proficiency (CTEs, Window Functions, joins, aggregations).
• Python data stack expertise: Pandas, NumPy, Matplotlib, Scikit-Learn.
• Understanding of experimental design and A/B testing methodologies.
• Experience presenting data narratives with BI tools (Tableau, Power BI).`
  }
];
