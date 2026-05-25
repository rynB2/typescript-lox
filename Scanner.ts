import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { createErrorReporter } from "./ErrorReporter";

const errorReporter = createErrorReporter();

export interface Scanner {
  scanTokens: () => Token[];
}

// parameters are the constructor
export const createScanner = (source: string): Scanner => {
  const tokens: Token[] = [];
  let start = 0;
  let current = 0;
  let line = 1;

  const isAtEnd = (): boolean => current >= source.length;

  const advance = (): string => source.charAt(current++);

  const addToken = (type: TokenType, literal: unknown = null): void => {
    const text = source.substring(start, current);
    tokens.push({ type: type, lexeme: text, literal: literal, line: line });
  };

  const scanToken = (): void => {
    const c = advance();

    switch (c) {
      // single char tokens
      case "(":
        addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        addToken(TokenType.COMMA);
        break;
      case ".":
        addToken(TokenType.DOT);
        break;
      case "-":
        addToken(TokenType.MINUS);
        break;
      case "+":
        addToken(TokenType.PLUS);
        break;
      case ";":
        addToken(TokenType.SEMICOLON);
        break;
      case "*":
        addToken(TokenType.STAR);
        break;
      default:
        errorReporter.error(line, "Unexpected character.");
        break;
    }
  };

  const scanTokens = (): Token[] => {
    while (!isAtEnd()) {
      start = current;
      scanToken();
    }

    tokens.push({
      type: TokenType.EOF,
      lexeme: "",
      literal: null,
      line: line,
    });

    return tokens;
  };

  return { scanTokens };
};
