const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

let input = "";
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath =
    payload?.tool_response?.filePath ?? payload?.tool_input?.file_path;

  if (!filePath || !fs.existsSync(filePath)) process.exit(0);

  const isMarkdown = /\.mdx?$/i.test(filePath);
  const isJsLike = /\.(jsx?|tsx?|mjs|cjs)$/i.test(filePath);
  const isPrettierTarget =
    isMarkdown || isJsLike || /\.(json|css|html)$/i.test(filePath);

  const run = (cmd, args) => {
    try {
      execFileSync(cmd, args, {
        cwd: process.cwd(),
        stdio: "pipe",
        shell: process.platform === "win32",
      });
    } catch (err) {
      process.stderr.write(err.stdout?.toString() ?? "");
      process.stderr.write(err.stderr?.toString() ?? "");
    }
  };

  if (isPrettierTarget) {
    run("npx", ["--no-install", "prettier", "--write", filePath]);
  }
  if (isJsLike) {
    run("npx", ["--no-install", "eslint", "--fix", filePath]);
  }

  process.exit(0);
});
