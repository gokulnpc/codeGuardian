import * as vscode from "vscode";
import { DiagnosticsHandler, DiagnosticProvider } from "./diagnostics";
import { SecurityAnalyzer } from "./analyzer";

export function activate(context: vscode.ExtensionContext) {
  console.log("CodeGuardian is now active");

  // Initialize handlers
  const diagnosticsHandler = new DiagnosticsHandler();
  const diagnosticProvider = new DiagnosticProvider(diagnosticsHandler);
  const securityAnalyzer = new SecurityAnalyzer();

  // Register diagnostic provider for supported languages
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ["javascript", "typescript", "python", "java", "cpp"],
      diagnosticProvider,
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix],
      }
    )
  );

  // Register commands
  const analyzeFileCommand = registerAnalyzeFileCommand(
    securityAnalyzer,
    diagnosticsHandler
  );

  const analyzeWorkspaceCommand = registerAnalyzeWorkspaceCommand(
    securityAnalyzer,
    diagnosticsHandler
  );

  // Register status bar item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.text = "$(shield) CodeGuardian";
  statusBarItem.command = "codeguardian.analyzeFile";
  statusBarItem.tooltip = "Analyze current file for security issues";
  statusBarItem.show();

  // Add file watcher for analyze on save
  const fileWatcher = registerFileWatcher(securityAnalyzer, diagnosticsHandler);

  // Add to subscriptions
  context.subscriptions.push(
    analyzeFileCommand,
    analyzeWorkspaceCommand,
    fileWatcher,
    statusBarItem
  );
}

function registerAnalyzeFileCommand(
  securityAnalyzer: SecurityAnalyzer,
  diagnosticsHandler: DiagnosticsHandler
): vscode.Disposable {
  return vscode.commands.registerCommand(
    "codeguardian.analyzeFile",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage(
          "CodeGuardian: Please open a file to analyze"
        );
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "CodeGuardian: Analyzing security vulnerabilities...",
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 });

            const document = editor.document;
            const code = document.getText();
            const language = document.languageId;

            // Clear existing diagnostics
            diagnosticsHandler.clearDiagnostics();

            // Analyze code
            const result = await securityAnalyzer.analyzeCode(code, language);

            progress.report({ increment: 100 });

            // Update diagnostics with results
            diagnosticsHandler.updateDiagnostics(document, result.issues);
          }
        );
      } catch (error) {
        console.error("Analysis error:", error);
        vscode.window.showErrorMessage(
          `CodeGuardian: Error analyzing file - ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );
}

function registerAnalyzeWorkspaceCommand(
  securityAnalyzer: SecurityAnalyzer,
  diagnosticsHandler: DiagnosticsHandler
): vscode.Disposable {
  return vscode.commands.registerCommand(
    "codeguardian.analyzeWorkspace",
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showWarningMessage(
          "CodeGuardian: Please open a workspace to analyze"
        );
        return;
      }

      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "CodeGuardian: Analyzing workspace...",
            cancellable: true,
          },
          async (progress, token) => {
            // Find all supported files
            const files = await vscode.workspace.findFiles(
              "{**/*.js,**/*.ts,**/*.py,**/*.java,**/*.cpp}",
              "{**/node_modules/**,**/dist/**,**/build/**,**/.git/**}"
            );

            const totalFiles = files.length;
            let processedFiles = 0;

            for (const file of files) {
              if (token.isCancellationRequested) {
                vscode.window.showInformationMessage(
                  "CodeGuardian: Analysis cancelled"
                );
                return;
              }

              const document = await vscode.workspace.openTextDocument(file);
              const code = document.getText();
              const language = document.languageId;

              progress.report({
                increment: (1 / totalFiles) * 100,
                message: `Analyzing ${vscode.workspace.asRelativePath(
                  file
                )} (${++processedFiles}/${totalFiles})`,
              });

              try {
                const result = await securityAnalyzer.analyzeCode(
                  code,
                  language
                );
                diagnosticsHandler.updateDiagnostics(document, result.issues);
              } catch (error) {
                console.error(`Error analyzing ${file.fsPath}:`, error);
                // Continue with next file
              }
            }
          }
        );
      } catch (error) {
        console.error("Workspace analysis error:", error);
        vscode.window.showErrorMessage(
          `CodeGuardian: Error analyzing workspace - ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }
  );
}

function registerFileWatcher(
  securityAnalyzer: SecurityAnalyzer,
  diagnosticsHandler: DiagnosticsHandler
): vscode.Disposable {
  return vscode.workspace.onDidSaveTextDocument(async (document) => {
    const config = vscode.workspace.getConfiguration("codeguardian");
    if (config.get("analyzeOnSave")) {
      const supportedLanguages = [
        "javascript",
        "typescript",
        "python",
        "java",
        "cpp",
      ];

      if (supportedLanguages.includes(document.languageId)) {
        try {
          const result = await securityAnalyzer.analyzeCode(
            document.getText(),
            document.languageId
          );
          diagnosticsHandler.updateDiagnostics(document, result.issues);
        } catch (error) {
          console.error("Auto-analysis error:", error);
          // Silent fail on auto-analysis but log the error
        }
      }
    }
  });
}

export function deactivate() {
  // Clean up resources
}
