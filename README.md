# C.over: Energy & Carbon Oversight

**C.over** is an enterprise-grade energy management ecosystem providing granular visibility into grid intake and solar generation. By integrating live telemetry with AI-driven insights, C.over empowers facility managers to optimize consumption, reduce carbon footprints, and generate audit-ready energy reports with a single click.

---

## Team: POWERPUFF GIRLS 
**Members**:
* Krisha A/P Nandakumar
* Olivia Cheong Yun Ching
* Zainab Hana

## Technologies Used
* **Frontend**: React.js, Tailwind CSS,Vite
* **API**: Google Gemini API (2.5 Flash)
* **Data Strategy**: A cloud database emulator (tnbCloudRegistry.js) built using clean JavaScript ES6 object mappings to model real, production-ready utility API responses without needing weeks of legal API approvals.

## Target User: 
Company registered as Designated Energy Consumers (DES)

## Challenge and Approach
## The Challenge
- **Greenwashing risk**: REM-registered companies may be fined if they cannot prove sustainability claims.  
- **Redundant / wasteful usage**: Excess electricity consumption undermines national energy efficiency goals.  
- **Threshold enforcement (Act 861)**: DES (≥ RM2.4M annual spend) must comply or face fines up to RM100,000 and imprisonment.  
- **Peak hour penalties**: Higher costs during peak demand periods highlight poor energy management.  

---

## Our Approach
- **Real-Time Telemetry**: Dynamic engine aggregating multi-source energy data.  
- **AI Integration**: Google Gemini translates raw telemetry into actionable, human-readable optimization advice.  
- **Print Optimization**: Custom CSS `@media print` directives enable seamless, multi-page audit report generation without data loss.  

---
## Usage Instructions

To run **C.OVER** locally, you will need to have a development environment set up on your machine.

### 1. Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js (LTS version)**: Runtime environment for executing JavaScript code.  
- **npm (Node Package Manager)**: Installed automatically with Node.js.  
- **Git**: Version control system used to manage and clone the repository.  


### 2. Getting Started
Once your environment is ready, follow these steps in your terminal:

**Clone the repository**

### 3. Navigate to the project folder
cd C-OVER

### 3. Install dependencies
npm install

### 4.Configure API
Open src/components/DashboardMain.jsx

### 5. Launch the application
npm start

### 6. View the Dashboard

Once the server starts, your browser should automatically open:
E.g:http://localhost:3000
