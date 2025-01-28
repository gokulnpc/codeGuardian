# Instructions to load the example and use CodeGuardian:

## Step 1: Install Requirements

1. Install **Visual Studio Code** if not already installed.

## Step 2: Set Up LMStudio

1. Download and install **LMStudio** from [LMStudio](https://lmstudio.ai).
2. Configure **LMStudio** to run locally for code analysis.

## Step 3: Install CodeGuardian

1. Open **Visual Studio Code**.
2. Install **CodeGuardian** from the VSCode marketplace: [CodeGuardian](https://marketplace.visualstudio.com/items?itemName=gokulnpc.codeguardian).
3. Enable CodeGuardian and allow it to scan files for vulnerabilities.

## Step 4: Load the Example Code

1. Open VS Code and navigate to the `example` directory.
2. Open `example.py` in the editor.
3. On the top search bar, enter `>CodeGuardian: Analyze Current File`
4. CodeGuardian should now highlight vulnerabilities in real-time.

## Step 5: View Detected Vulnerabilities

1. Check **CodeGuardian’s** security panel in VS Code.
2. Expected vulnerabilities detected:

   - SQL Injection in `login()`
   - Insecure password storage in `login()`
   - Path traversal in `upload_file()`
   - Command injection in `upload_file()`
   - Cross-site scripting (XSS) in `profile()`
   - Insecure configuration in `app.run()`

3. Apply **CodeGuardian's** suggested fixes and re-test the application.

Now you have successfully tested CodeGuardian with a known vulnerable application!
