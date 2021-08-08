import {
  Command,
  CommandContext,
  CommandMatch,
  CommandParam,
  RawCommandData
} from "./types";

// human readable param hints
export const createParamHints = (params: CommandParam[] = []) =>
  params.reduce(
    (acc, curr, index) =>
      `${acc}[${curr.id}]${params.length !== index + 1 ? " " : ""}`,
    ""
  );

// trims the value so we're only looking at the command ID
export const normalizeFoundCommandString = (value: string) =>
  value.replace("/", "").replace(" ", "");

// get substring before position
export const getPreString = (str: string, pos: number) => str.substring(0, pos);
// get substring after position
export const getPostString = (str: string, pos: number) => str.substring(pos);

// this identifies if there is a relevant command
// string we should consider taking action on
export const findRawCommandString = (
  inputText: string,
  cursorPos: number
): RawCommandData | null => {
  const preString = getPreString(inputText, cursorPos);
  const postString = getPostString(inputText, cursorPos);

  // handle if the user has positioned
  // their cursor in the middle of a command
  const pre = preString.match(/\/[a-zA-Z0-9-_]*$/);
  const post = postString.match(/^[a-zA-Z0-9-_]+/);

  const preText = pre ? pre[0] : "";
  const postText = post ? post[0] : "";

  // stick em together
  const concatenatedCommandString = `${preText}${postText}`;

  // check if formatted like command because
  // we only check for a starting slash in `pre`
  // and may have only found a value in `post`
  const isFormattedLikeCommand = concatenatedCommandString.startsWith("/");

  if (isFormattedLikeCommand) {
    const commandIndex = cursorPos - preText.length;
    return {
      id: normalizeFoundCommandString(concatenatedCommandString),
      startPos: commandIndex,
      cursorPos,
      inputText
    };
  }

  // next, handle if there is a fully declared command
  // before our cursor position
  const fullyDeclaredCommandsBeforePosition = preString.match(
    /\/[a-zA-Z0-9-_]* /g
  );

  if (fullyDeclaredCommandsBeforePosition) {
    // we only want the most recent command declared
    const [lastCommandString] = fullyDeclaredCommandsBeforePosition.slice(-1);
    const startPos = preString.lastIndexOf(lastCommandString);

    return {
      id: normalizeFoundCommandString(lastCommandString),
      startPos,
      cursorPos,
      inputText
    };
  }

  return null;
};

// this prepares each param's `match` regex partials
// with whitespace and parens according to their position
// in the param list
export const prepareParamRegexPartialList = (params: CommandParam[] = []) => {
  const list = params.map((param, i) => {
    // default to case where param is not first or last
    let match = `(${param.match})? ?`;
    // handle last param case next. If it's the only param,
    // this will get overridden in the next condition
    if (i === params.length - 1) {
      match = `(${param.match})?`;
    }
    // finally, handle the first param case
    if (i === 0) {
      match = ` ?(${param.match})? ?`;
    }

    return match;
  });

  return list.join("");
};

// take an array of match strings we got from
// our regex, and map them to the command params
// array
export const mapCommandGroupMatchArray = (
  command: Command,
  matches: string[]
): CommandMatch => {
  // shift the first match, it's the complete command
  // group string, including command and any args.
  const full = matches.shift();
  let data = null;
  let isValid = true;

  // if this command has params,
  // map them to the remaining match array items
  if (command.params) {
    data = command.params.map((param, i) => {
      const match = matches[i];
      // if any one these matches are falsey,
      // flag `isValid` so the UI can disallow
      // command completion
      if (!match) isValid = false;

      const value = param.accessor && match ? param.accessor(match) : match;
      return { id: param.id, value, rawValue: match };
    });
  }

  return {
    full,
    isValid,
    data
  };
};

export const parseCommandContext = (
  command: Command,
  raw: RawCommandData
): CommandContext | null => {
  const paramsRegex = prepareParamRegexPartialList(command.params);
  const commandGroupRegex = new RegExp(`^/${raw.id}${paramsRegex}`);
  const commandGroupMatchArray = raw.inputText
    .substring(raw.startPos)
    .match(commandGroupRegex);

  if (commandGroupMatchArray) {
    const match = mapCommandGroupMatchArray(command, commandGroupMatchArray);

    const endPos = raw.startPos + match.full.length;

    // if the text cursor is after the possible bounds of
    // the match, we shouldn't let them operate on it.
    if (raw.cursorPos > endPos) {
      return null;
    }

    const context: CommandContext = {
      stringPartials: {
        pre: getPreString(raw.inputText, raw.startPos),
        post: getPostString(raw.inputText, endPos)
      },
      match,
      command,
      raw
    };

    return context;
  }
};

export const findCommandById = (commands: Command[], commandId: string) => (
  commands.find((c) => c.id.toLowerCase() === commandId.toLowerCase())
)
