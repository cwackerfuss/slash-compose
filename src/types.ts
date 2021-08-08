export type CommandParam = {
  match: string;
  id: string;
  accessor?: (val: string) => unknown;
};

export type CommandUpdate = {
  replacement: string;
  pre?: string;
  post?: string;
};

export type Command = {
  id: string;
  description: string;
  params?: CommandParam[];
  executeCommand: (ctx: CommandContext) => CommandUpdate | null;
};

export type CommandMatch = {
  full: string;
  isValid: boolean;
  data: null | { id: string; value: unknown; rawValue: string };
};

export type CommandContext = {
  command: Command;
  match: CommandMatch;
  raw: RawCommandData;
  stringPartials: {
    pre: string;
    post: string;
  };
};

export type RawCommandData = {
  id: string;
  startPos: number;
  inputText: string;
  cursorPos: number;
};

export type SlashTarget = HTMLTextAreaElement | HTMLInputElement;

export type OnContextChangeFn = (
  target: SlashTarget,
  ctx: CommandContext | null
) => void;

export type SlashOptions = {
  commands: Command[];
  target: SlashTarget;
  onContextChange?: OnContextChangeFn;
};
