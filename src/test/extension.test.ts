// import * as assert from "assert";
// import * as vscode from "vscode";
// import { SecurityAnalyzer } from "../analyzer";
// import { DiagnosticsHandler } from "../diagnostics";

// suite("CodeGuardian Extension Test Suite", function () {
//   // Increase timeout for LLM processing
//   this.timeout(150000);

//   const analyzer = new SecurityAnalyzer();
//   const diagnosticsHandler = new DiagnosticsHandler();

//   // Sample vulnerable code snippets
//   const vulnPythonCode = {
//     sqlInjection: `
// def login():
//     username = request.form['username']
//     password = request.form['password']
//     query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
//     result = db.execute(query)
//     return "Login successful" if result else "Login failed"`,

//     commandInjection: `
// @app.route('/process')
// def process_file():
//     filename = request.args.get('filename')
//     os.system(f"processing_script.sh {filename}")
//     return "Processing complete"`,

//     xss: `
// @app.route('/profile')
// def profile():
//     name = request.args.get('name', '')
//     return f"<h1>Welcome, {name}!</h1>"`,

//     pathTraversal: `
// @app.route('/download')
// def download():
//     filename = request.args.get('file')
//     return send_file(f"uploads/{filename}")`,

//     insecureDeserialization: `
// @app.route('/load_data')
// def load_data():
//     data = request.args.get('data')
//     return pickle.loads(base64.b64decode(data))`,
//   };

//   const secureCode = {
//     sqlInjection: `
// def login():
//     username = request.form['username']
//     password = request.form['password']
//     query = "SELECT * FROM users WHERE username = ? AND password = ?"
//     result = db.execute(query, (username, password))
//     return "Login successful" if result else "Login failed"`,

//     xss: `
// @app.route('/profile')
// def profile():
//     name = escape(request.args.get('name', ''))
//     return f"<h1>Welcome, {name}!</h1>"`,
//   };

//   test("Extension Activation", async function () {
//     const ext = vscode.extensions.getExtension("gokulnpc.codeguardian");
//     assert.notStrictEqual(ext, undefined);
//     if (ext) {
//       await ext.activate();
//       assert.strictEqual(ext.isActive, true);
//     }
//   });

//   suite("Security Analyzer Tests", function () {
//     suiteSetup(async function () {
//       // Wait for LLM server to be fully ready
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     });

//     test("Should detect SQL injection vulnerability", async function () {
//       const result = await analyzer.analyzeCode(
//         vulnPythonCode.sqlInjection,
//         "python"
//       );

//       assert.ok(result.issues.length > 0, "Should detect at least one issue");

//       const sqlInjectionIssue = result.issues.find((issue) =>
//         issue.message.toLowerCase().includes("sql injection")
//       );

//       assert.ok(sqlInjectionIssue, "Should detect SQL injection vulnerability");
//       assert.strictEqual(
//         sqlInjectionIssue?.severity,
//         "high",
//         "SQL injection should be high severity"
//       );
//       assert.ok(
//         sqlInjectionIssue?.line > 0,
//         "Should identify the specific line number"
//       );
//     });

//     test("Should detect command injection vulnerability", async function () {
//       const result = await analyzer.analyzeCode(
//         vulnPythonCode.commandInjection,
//         "python"
//       );

//       const commandInjectionIssue = result.issues.find(
//         (issue) =>
//           issue.message.toLowerCase().includes("command injection") ||
//           issue.message.toLowerCase().includes("os.system")
//       );

//       assert.ok(
//         commandInjectionIssue,
//         "Should detect command injection vulnerability"
//       );
//       assert.strictEqual(
//         commandInjectionIssue?.severity,
//         "critical",
//         "Command injection should be critical severity"
//       );
//     });

//     test("Should detect XSS vulnerability", async function () {
//       const result = await analyzer.analyzeCode(vulnPythonCode.xss, "python");

//       const xssIssue = result.issues.find(
//         (issue) =>
//           issue.message.toLowerCase().includes("xss") ||
//           issue.message.toLowerCase().includes("cross-site scripting")
//       );

//       assert.ok(xssIssue, "Should detect XSS vulnerability");
//       assert.ok(xssIssue?.line > 0, "Should identify the specific line number");
//     });

//     test("Should detect path traversal vulnerability", async function () {
//       const result = await analyzer.analyzeCode(
//         vulnPythonCode.pathTraversal,
//         "python"
//       );

//       const pathTraversalIssue = result.issues.find(
//         (issue) =>
//           issue.message.toLowerCase().includes("path traversal") ||
//           issue.message.toLowerCase().includes("directory traversal")
//       );

//       assert.ok(
//         pathTraversalIssue,
//         "Should detect path traversal vulnerability"
//       );
//     });

//     test("Should detect insecure deserialization", async function () {
//       const result = await analyzer.analyzeCode(
//         vulnPythonCode.insecureDeserialization,
//         "python"
//       );

//       const deserializationIssue = result.issues.find(
//         (issue) =>
//           issue.message.toLowerCase().includes("deserialization") ||
//           issue.message.toLowerCase().includes("pickle")
//       );

//       assert.ok(
//         deserializationIssue,
//         "Should detect insecure deserialization vulnerability"
//       );
//     });

//     test("Should handle secure SQL query correctly", async function () {
//       const result = await analyzer.analyzeCode(
//         secureCode.sqlInjection,
//         "python"
//       );

//       const sqlInjectionIssue = result.issues.find((issue) =>
//         issue.message.toLowerCase().includes("sql injection")
//       );

//       assert.strictEqual(
//         sqlInjectionIssue,
//         undefined,
//         "Should not detect SQL injection in parameterized query"
//       );
//     });

//     test("Should handle secure XSS prevention correctly", async function () {
//       const result = await analyzer.analyzeCode(secureCode.xss, "python");

//       const xssIssue = result.issues.find(
//         (issue) =>
//           issue.message.toLowerCase().includes("xss") ||
//           issue.message.toLowerCase().includes("cross-site scripting")
//       );

//       assert.strictEqual(
//         xssIssue,
//         undefined,
//         "Should not detect XSS in escaped output"
//       );
//     });
//   });

//   suite("Diagnostics Handler Tests", function () {
//     test("Should create diagnostics for multiple security issues", async function () {
//       const document = await vscode.workspace.openTextDocument({
//         content: vulnPythonCode.sqlInjection,
//         language: "python",
//       });

//       const result = await analyzer.analyzeCode(
//         vulnPythonCode.sqlInjection,
//         "python"
//       );
//       diagnosticsHandler.updateDiagnostics(document, result.issues);

//       // Allow time for VS Code to process diagnostics
//       await new Promise((resolve) => setTimeout(resolve, 100));

//       const diagnostics = diagnosticsHandler.getIssueDiagnostics(document);
//       assert.ok(
//         diagnostics.length > 0,
//         "Should create diagnostics for security issues"
//       );

//       // Verify diagnostic properties
//       const diagnostic = diagnostics[0];
//       assert.ok(
//         diagnostic.range.start.line >= 0,
//         "Should have valid line number"
//       );
//       assert.ok(diagnostic.message.length > 0, "Should have detailed message");
//       assert.ok(
//         diagnostic.severity !== undefined,
//         "Should have severity level"
//       );
//     });

//     test("Should clear diagnostics", async function () {
//       const document = await vscode.workspace.openTextDocument({
//         content: vulnPythonCode.sqlInjection,
//         language: "python",
//       });

//       // First add some diagnostics
//       const result = await analyzer.analyzeCode(
//         vulnPythonCode.sqlInjection,
//         "python"
//       );
//       diagnosticsHandler.updateDiagnostics(document, result.issues);

//       // Then clear them
//       diagnosticsHandler.clearDiagnostics();
//       await new Promise((resolve) => setTimeout(resolve, 100));

//       const diagnostics = diagnosticsHandler.getIssueDiagnostics(document);
//       assert.strictEqual(
//         diagnostics.length,
//         0,
//         "Should remove all diagnostics"
//       );
//     });
//   });

//   suite("Command Tests", function () {
//     test("Should register analyze file command", async function () {
//       const commands = await vscode.commands.getCommands();
//       assert.ok(
//         commands.includes("codeguardian.analyzeFile"),
//         "Should register analyze file command"
//       );
//     });

//     test("Should analyze current file", async function () {
//       const document = await vscode.workspace.openTextDocument({
//         content: vulnPythonCode.sqlInjection,
//         language: "python",
//       });
//       await vscode.window.showTextDocument(document);

//       await vscode.commands.executeCommand("codeguardian.analyzeFile");

//       // Give sufficient time for analysis and diagnostic updates
//       await new Promise((resolve) => setTimeout(resolve, 5000));

//       const diagnostics = diagnosticsHandler.getIssueDiagnostics(document);
//       assert.ok(
//         diagnostics.length > 0,
//         "Should create diagnostics after analysis"
//       );
//     });
//   });
// });

import * as assert from "assert";
import * as vscode from "vscode";
import { SecurityAnalyzer } from "../analyzer";
import { DiagnosticsHandler } from "../diagnostics";

suite("Flask Security Analysis Tests", function () {
  this.timeout(100000); // 10 second timeout

  const analyzer = new SecurityAnalyzer();
  const diagnosticsHandler = new DiagnosticsHandler();

  test("Should detect multiple vulnerabilities in Flask application", async function () {
    const flaskCode = `
from flask import Flask, request
import sqlite3
import os

app = Flask(__name__)

def get_db():
    return sqlite3.connect('users.db')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    
    db = get_db()
    result = db.execute(query).fetchone()
    
    if result:
        return "Login successful"
    return "Login failed"

@app.route('/upload', methods=['POST'])
def upload_file():
    filename = request.files['file'].filename
    file_path = f"uploads/{filename}"
    
    os.system(f"mv {request.files['file'].filename} {file_path}")
    
    return "File uploaded successfully"

@app.route('/profile')
def profile():
    name = request.args.get('name', '')
    return f"<h1>Welcome, {name}!</h1>"
    `;

    const result = await analyzer.analyzeCode(flaskCode, "python");

    // Check for specific vulnerabilities
    const expectedVulnerabilities = [
      "SQL Injection",
      "Command Injection",
      "Cross-site scripting",
      "Path Traversal",
    ];

    assert.ok(
      result.issues.length >= 4,
      "Should detect at least 4 vulnerabilities"
    );

    // Verify each expected vulnerability is found
    for (const vuln of expectedVulnerabilities) {
      const found = result.issues.some((issue) =>
        issue.message.toLowerCase().includes(vuln.toLowerCase())
      );
      assert.ok(found, `Should detect ${vuln} vulnerability`);
    }

    // Verify line numbers are correct
    const sqlInjection = result.issues.find((i) =>
      i.message.toLowerCase().includes("sql injection")
    );
    assert.ok(
      sqlInjection?.line === 13 || sqlInjection?.line === 14,
      "SQL Injection should be detected at correct line"
    );

    // Test diagnostics integration
    const document = await vscode.workspace.openTextDocument({
      content: flaskCode,
      language: "python",
    });

    diagnosticsHandler.updateDiagnostics(document, result.issues);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const diagnostics = diagnosticsHandler.getIssueDiagnostics(document);
    assert.ok(
      diagnostics.length > 0,
      "Should create diagnostics for vulnerabilities"
    );
  });
});
