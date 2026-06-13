export type AiResult =
  | { status: "ok"; text: string }
  | { status: "error"; message: string }
  | { status: "not_configured" };

export type AiRequest = {
  system: string;
  user: string;
  maxTokens?: number;
};

export interface AiProvider {
  generate(input: AiRequest): Promise<AiResult>;
}
