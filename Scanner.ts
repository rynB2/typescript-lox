import { Token } from "./Token";
import { TokenType } from "./TokenType";
import { createErrorReporter } from "./ErrorReporter";

// in ts, property keys are strings, so explicit "" is not needed
const KEYWORDS: Record<string, TokenType> = {
  and: TokenType.AND,
  class: TokenType.CLASS,
  else: TokenType.ELSE,
  false: TokenType.FALSE,
  for: TokenType.FOR,
  fun: TokenType.FUN,
  if: TokenType.IF,
  nil: TokenType.NIL,
  or: TokenType.OR,
  print: TokenType.PRINT,
  return: TokenType.RETURN,
  super: TokenType.SUPER,
  this: TokenType.THIS,
  true: TokenType.TRUE,
  var: TokenType.VAR,
  while: TokenType.WHILE,
} as const;

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

  const isDigit = (c: string): boolean => {
    return c >= "0" && c <= "9";
  };

  const isAlpha = (c: string): boolean => {
    return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
  };

  const isAlphaNumeric = (c: string): boolean => {
    return isAlpha(c) || isDigit(c);
  };

  // returns current char, THEN moves current forward
  const advance = (): string => source.charAt(current++);

  const peek = (): string => {
    if (isAtEnd()) return "\0";
    return source.charAt(current);
  };

  const peekNext = (): string => {
    if (current + 1 >= source.length) return "\0";
    return source.charAt(current + 1);
  };

  const match = (expected: string): boolean => {
    if (isAtEnd()) return false;
    if (source.charAt(current) !== expected) return false;
    current++;
    return true;
  };

  const handleString = (): void => {
    while (peek() !== '"' && !isAtEnd()) {
      if (peek() === "\n") {
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

  const handleNumber = (): void => {
    while (isDigit(peek())) {
      advance();
    }

    // look for a fractional part
    if (peek() === "." && isDigit(peekNext())) {
      // consume the "."
      advance();
      while (isDigit(peek())) {
        advance();
      }
    }

    addToken(TokenType.NUMBER, Number(source.substring(start, current)));
  };

  const handleIdentifier = (): void => {
    while (isAlphaNumeric(peek())) {
      advance();
    }
    const text = source.substring(start, current);
    let type: TokenType = KEYWORDS[text] ?? TokenType.IDENTIFIER;
    addToken(type);
  };

  const handleBlockComment = (): void => {
    while (!isAtEnd()) {
      // handle newlines
      if (peek() === "\n") {
        line++;
      }

      // comment end -- consume both characters, then finish
      if (peek() === "*" && peekNext() === "/") {
        advance();
        advance();
        return;
      }

      // continue to consume the comment block if not finished
      advance();
    }

    errorReporter.error(line, "Unterminated block comment.");
  };

  const addToken = (type: TokenType, literal: unknown = null): void => {
    const text = source.substring(start, current);
    tokens.push({ type, lexeme: text, literal, line });
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
      // one or two chars
      case "!":
        addToken(match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        addToken(match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL);
        break;
      case "<":
        addToken(match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case ">":
        addToken(match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER);
        break;
      // comments
      case "/":
        if (match("/")) {
          while (peek() !== "\n" && !isAtEnd()) {
            advance();
          }
        } else if (match("*")) {
          handleBlockComment();
        } else {
          addToken(TokenType.SLASH);
        }
        break;
      // skip over newlines/whitespace
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        line++;
        break;
      // strings
      case '"':
        handleString();
        break;
      default:
        if (isDigit(c)) {
          handleNumber();
        } else if (isAlpha(c)) {
          handleIdentifier();
        } else {
          errorReporter.error(line, "Unexpected character.");
        }

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
      line,
    });

    return tokens;
  };

  return { scanTokens };
};
