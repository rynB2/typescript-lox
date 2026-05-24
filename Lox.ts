import * as fs from "fs";
import * as readline from "readline";

function main(args: string[]): void {
  if (args.length > 1) {
    console.log("Usage: jlox [script]");
    process.exit(64);
  } else if (args.length === 1) {
    runFile(args[0]);
  } else {
    runPrompt();
  }
}

// function sliceArgs(args: string[]): string[] {
//   return args.slice(2);
// }
let hadError = false;
const sliceArgs = (args: string[]): string[] => args.slice(2);

function runFile(path: string) {
  const bytes = fs.readFileSync(path);
  run(bytes.toString("utf-8"));
  if (hadError) {
    process.exit(65);
  }
}

function runPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptUser = () => {
    rl.question("> ", (line: string) => {
      // we do not need a manual exit here, as node.js lets the OS handle it
      run(line);
      hadError = false;
      promptUser();
    });
  };

  promptUser();
}

function run(source: string) {
  const scanner: = new Scanner(source);
  const tokens: Token[] = scanner.scanTokens();

  for (const token of tokens) {
    console.log(token);
  }
}

main(sliceArgs(process.argv));
