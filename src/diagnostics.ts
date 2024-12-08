import * as vscode from "vscode";
import { SecurityIssue } from "./types";

export class DiagnosticsHandler {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("codeguardian");
  }

  public updateDiagnostics(
    document: vscode.TextDocument,
    issues: SecurityIssue[]
  ): void {
    const diagnostics: vscode.Diagnostic[] = [];

    for (const issue of issues) {
      const range = this.getIssueRange(document, issue);
      const diagnostic = new vscode.Diagnostic(
        range,
        this.formatMessage(issue),
        this.mapSeverity(issue.severity)
      );

      // Enhanced metadata
      diagnostic.code = {
        value: issue.rule,
        target: vscode.Uri.parse(`https://owasp.org/www-project-top-ten/`),
      };
      diagnostic.source = "CodeGuardian";
      diagnostic.tags = this.getDiagnosticTags(issue);

      // Add related information
      const lineText = document.lineAt(range.start.line).text;
      diagnostic.relatedInformation = [
        new vscode.DiagnosticRelatedInformation(
          new vscode.Location(document.uri, range),
          `Vulnerable code: ${lineText.trim()}`
        ),
      ];

      diagnostics.push(diagnostic);
    }

    this.diagnosticCollection.set(document.uri, diagnostics);

    // Show summary notification
    if (diagnostics.length > 0) {
      vscode.window
        .showInformationMessage(
          `CodeGuardian: Found ${diagnostics.length} security ${
            diagnostics.length === 1 ? "issue" : "issues"
          }`,
          "Show Details"
        )
        .then((selection) => {
          if (selection === "Show Details") {
            vscode.commands.executeCommand("workbench.action.problems.focus");
          }
        });
    }
  }

  private getIssueRange(
    document: vscode.TextDocument,
    issue: SecurityIssue
  ): vscode.Range {
    const line = Math.max(issue.line - 1, 0);
    const lineText = document.lineAt(line);

    // Start from first non-whitespace character
    const startChar = lineText.firstNonWhitespaceCharacterIndex;

    return new vscode.Range(
      new vscode.Position(line, startChar),
      new vscode.Position(line, lineText.text.length)
    );
  }

  private mapSeverity(severity: string): vscode.DiagnosticSeverity {
    const severityMap: { [key: string]: vscode.DiagnosticSeverity } = {
      critical: vscode.DiagnosticSeverity.Error,
      high: vscode.DiagnosticSeverity.Error,
      medium: vscode.DiagnosticSeverity.Warning,
      low: vscode.DiagnosticSeverity.Information,
    };

    return (
      severityMap[severity.toLowerCase()] || vscode.DiagnosticSeverity.Hint
    );
  }

  private formatMessage(issue: SecurityIssue): string {
    // Separate vulnerability name, description, and fix with proper formatting
    const parts = issue.message.split("\n");
    const vulnName = parts[0];
    let description = "";
    let fix = "";

    // Parse message parts
    const descStart = issue.message.indexOf("Description: ");
    const fixStart = issue.message.indexOf("Recommendation: ");

    if (descStart !== -1) {
      description = issue.message
        .slice(
          descStart + "Description: ".length,
          fixStart !== -1 ? fixStart : undefined
        )
        .trim();
    }

    if (fixStart !== -1) {
      fix = issue.message.slice(fixStart + "Recommendation: ".length).trim();
    }

    // Format the complete message
    let formattedMessage = `${vulnName} [${issue.severity.toUpperCase()}]\n`;
    if (description) {
      formattedMessage += `\n${description}`;
    }
    if (fix) {
      formattedMessage += `\n\nRecommended Fix:\n${fix}`;
    }

    return formattedMessage;
  }

  private getDiagnosticTags(issue: SecurityIssue): vscode.DiagnosticTag[] {
    const tags: vscode.DiagnosticTag[] = [];

    // Mark security issues as problems that should be addressed
    tags.push(vscode.DiagnosticTag.Unnecessary);

    // Add specific tags based on severity
    if (issue.severity === "critical" || issue.severity === "high") {
      tags.push(vscode.DiagnosticTag.Unnecessary);
    }

    // Add deprecated tag for deprecated features/practices
    if (issue.rule.toLowerCase().includes("deprecated")) {
      tags.push(vscode.DiagnosticTag.Deprecated);
    }

    return tags;
  }

  public clearDiagnostics(): void {
    this.diagnosticCollection.clear();
  }

  public dispose(): void {
    this.diagnosticCollection.dispose();
  }

  public getIssueDiagnostics(
    document: vscode.TextDocument
  ): vscode.Diagnostic[] {
    return (this.diagnosticCollection.get(document.uri) || []).slice();
  }

  public getQuickFixes(diagnostic: vscode.Diagnostic): vscode.CodeAction[] {
    const quickFixes: vscode.CodeAction[] = [];

    // Create quick fix action with more descriptive title
    const fix = new vscode.CodeAction(
      `Fix ${
        typeof diagnostic.code === "object" && "value" in diagnostic.code
          ? diagnostic.code.value
          : "security"
      } issue`,
      vscode.CodeActionKind.QuickFix
    );

    // Add fix command with diagnostic information
    fix.command = {
      command: "codeguardian.quickFix",
      title: "Apply security fix",
      arguments: [diagnostic],
    };

    // Add diagnostic information to the fix
    fix.diagnostics = [diagnostic];
    fix.isPreferred = true;

    quickFixes.push(fix);
    return quickFixes;
  }
}

export class DiagnosticProvider implements vscode.CodeActionProvider {
  private diagnosticsHandler: DiagnosticsHandler;

  constructor(diagnosticsHandler: DiagnosticsHandler) {
    this.diagnosticsHandler = diagnosticsHandler;
  }

  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const quickFixes: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source === "CodeGuardian") {
        quickFixes.push(...this.diagnosticsHandler.getQuickFixes(diagnostic));
      }
    }

    return quickFixes;
  }
}
