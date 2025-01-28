# CodeGuardian - Your AI-Powered Code Security Companion

## Description
CodeGuardian is a powerful VSCode extension that helps developers write secure code by providing real-time vulnerability detection and comprehensive security insights. Powered by local AI through LMStudio, it analyzes your code without compromising privacy or performance.

### Authors:
- **[Gokuleshwaran Narayanan](https://www.github.com/gokulnpc)** - Computer Scientist
- **[Adithyah Nair](https://www.github.com/adithyahnair)** - Computer Scientist

## Repository Contents
This repository contains the core TypeScript files responsible for CodeGuardian's functionality:
- `analyzer.ts`: Handles the static code analysis and vulnerability detection.
- `diagnostics.ts`: Manages the reporting of detected vulnerabilities.
- `extension.ts`: Entry point of the VSCode extension, setting up interactions and integrations.
- `types.ts`: Defines the types and interfaces used within the extension.
- `example/example.py`: Sample vulnerable application for testing CodeGuardian.

## Setup Instructions

### Step 1: Install Requirements
1. Install **Visual Studio Code** if not already installed.
2. Clone this repository:
   ```sh
   git clone https://github.com/gokulnpc/codeguardian.git
   cd codeguardian
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

### Step 2: Set Up LMStudio
1. Download and install **LMStudio** from [LMStudio](https://lmstudio.ai).
2. Configure **LMStudio** to run locally for code analysis.

### Step 3: Install CodeGuardian Extension
1. Open **Visual Studio Code**.
2. Run the following command to install the extension locally:
   ```sh
   npm run build
   code --install-extension codeguardian.vsix
   ```
3. Enable CodeGuardian and allow it to scan files for vulnerabilities.

## Testing Instructions
To verify the installation and setup:
1. Navigate to the `example` directory in the repository.
2. Open `example.py` in Visual Studio Code.
3. CodeGuardian should now highlight vulnerabilities in real-time.
4. On the top search bar, enter `>CodeGuardian: Analyze Current File`
6. Check **CodeGuardian’s** security panel in VS Code to view detected vulnerabilities.

## Usage Instructions
Once the application is set up, follow these steps:
1. Open any code file in VS Code.
2. As you type, CodeGuardian provides real-time security feedback.
3. View detailed vulnerability reports in the **CodeGuardian Security Panel**.
4. Apply suggested fixes to improve code security.
5. Use the detected issues to validate security best practices.

Now you have successfully installed and tested CodeGuardian! 🚀

