interface ErrorReporter {
  hadError: boolean;
  report: (line: number, where: string, message: string) => void;
  error: (line: number, message: string) => void;
  clear: () => void;
}

const createErrorReporter = (): ErrorReporter => {
  const reporter: ErrorReporter = {
    hadError: false,
    report: (line: number, where: string, message: string) => {
      console.log(`[line ${line}] Error ${where}: ${message}`);
      reporter.hadError = true;
    },
    error: (line: number, message: string) => {
      reporter.report(line, "", message);
    },
    clear: () => {
      reporter.hadError = false;
    },
  };
  return reporter;
};

export const errorReporter = createErrorReporter();
