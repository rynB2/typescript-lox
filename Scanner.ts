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

  const peek = (): string => {
    if (isAtEnd()) return "\0";
    return source.charAt(current);
  };

  const match = (expected: string): boolean => {
    if (isAtEnd()) return false;
    if (source.charAt(current) != expected) return false;
    current++;
    return true;
  };

  const string = (): void => {
    while (peek() != '"' && !isAtEnd()) {
      if (peek() == "\n") {
        // handle multi-line string edge case
        line++;
      }
      advance();
    }

    if (isAtEnd()) {
      errorReporter.error(line, "Unterminated string.");
      return;
    }

    // the closing ".
    advance();

    // trim the surrounding quotes
    const value = source.substring(start + 1, current - 1);
    addToken(TokenType.STRING, value);
  };

  const number = (): void => {
    while (isDigit(peek())) advance();

    // look for a fractional part
    if (peek() == "." && isDigit(peekNext())) {
      // consume the "."
      advance();
      while (isDigit(peek())) advance();
    }

    const text = addToken(
      TokenType.NUMBER,
      Number(source.substring(start, current)),
    );
  };

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
