import { TokenType } from "./TokenType";

// export class Token {
//   constructor(
//     public readonly type: TokenType,
//     public readonly lexeme: string,
//     public readonly literal: unknown,
//     public readonly line: number,
//   ) {}

//   public toString(): string {
//     return `${this.type} ${this.lexeme} ${this.literal}`;
//   }
// }
//

export interface Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: unknown;
  readonly line: number;
}

export const formatToken = (token: Token): string => {
  return `${token.type} ${token.lexeme} ${token.literal}`;
};
