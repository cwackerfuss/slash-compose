const NUMBER_PARAM_REGEX_PARTIAL = "[0-9]+";
const WORD_PARAM_REGEX_PARTIAL = '[^" /]*';
const QUOTED_PARAM_REGEX_PARTIAL = '"[^/"]*"';
const SENTENCE_PARAM_REGEX_PARTIAL = ".*";

const commands = [
  {
    id: "add",
    description: "Add two numbers together",
    params: [
      {
        match: NUMBER_PARAM_REGEX_PARTIAL,
        id: "a"
      },
      {
        match: NUMBER_PARAM_REGEX_PARTIAL,
        id: "b"
      }
    ],
    onComplete: (context) => {}
  },
  {
    id: "shout",
    description: "Shout from the rooftops"
  },
  {
    id: "repeat",
    description: "Repeat a phrase n times",
    params: [
      {
        match: NUMBER_PARAM_REGEX_PARTIAL,
        id: "count"
      },
      {
        match: QUOTED_PARAM_REGEX_PARTIAL,
        id: "phrase"
      }
    ]
  },
  {
    id: "hello",
    description: "Say hello!",
    params: [
      {
        match: WORD_PARAM_REGEX_PARTIAL,
        id: "name"
      }
    ]
  },
  {
    id: "upper-all",
    description: "Uppercase everything",
    params: [
      {
        match: SENTENCE_PARAM_REGEX_PARTIAL,
        id: "sentence"
      }
    ]
  }
];

const findCommand = (value) => {
  return commands.find((c) => c.id.toLowerCase() === value.toLowerCase());
};

const show = document.querySelector("span");
const input = document.querySelector("textarea");

// trims the value so we're only looking at the command ID
const normalizeFoundCommandString = (value) =>
  value.replace("/", "").replace(" ", "");

const getPreString = (str, pos) => str.substring(0, pos);
const getPostString = (str, pos) => str.substring(pos);

const findRawFocusedCommandString = (str, pos) => {
  const preStr = getPreString(str, pos);
  const postStr = getPostString(str, pos);

  // handle if the user has positioned
  // their cursor in the middle of a command
  const pre = preStr.match(/\/[a-zA-Z0-9-_]*$/);
  const post = postStr.match(/^[a-zA-Z0-9-_]+/);

  const preText = pre ? pre[0] : "";
  const postText = post ? post[0] : "";

  // stick em together
  const concatenatedCommandString = `${preText}${postText}`;

  // check if formatted like command because
  // we only check for a starting slash in `pre`
  // and may have only found a value in `post`
  const isFormattedLikeCommand = concatenatedCommandString.startsWith("/");

  if (isFormattedLikeCommand) {
    const commandIndex = pos - preText.length;
    return {
      id: normalizeFoundCommandString(concatenatedCommandString),
      startPos: commandIndex
    };
  }

  // next, handle if there is a fully declared command
  // before our cursor position
  const fullyDeclaredCommandsBeforePosition = preStr.match(
    /\/[a-zA-Z0-9-_]* /g
  );

  if (fullyDeclaredCommandsBeforePosition) {
    // we only want the most recent command declared
    const [lastCommandString] = fullyDeclaredCommandsBeforePosition.slice(-1);
    const startPos = preStr.lastIndexOf(lastCommandString);

    return {
      id: normalizeFoundCommandString(lastCommandString),
      startPos
    };
  }

  return null;
};

// this prepares each param's `match` regex partials
// with whitespace and parens according to their position
// in the param list
const prepareParamRegexPartialList = (params = []) => {
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

const mapCommandGroupMatches = (command, matches) => {
  // shift the first match, it's the complete command
  // group string, including command and any args.
  const full = matches.shift();
  let data = null;
  let isValid = true;

  // if this command has params,
  // map them to the remaining match array items
  if (command.params) {
    data = command.params.map((param, i) => {
      // if any one these matches are falsey,
      // flag `isValid` so the UI can disallow
      // command completion
      if (!matches[i]) isValid = false;
      return { id: param.id, value: matches[i] };
    });
  }

  return {
    full,
    isValid,
    data
  };
};

const getCommandContext = (str, pos) => {
  const info = findRawFocusedCommandString(str, pos);

  if (!info) return null;

  const command = findCommand(info.id);

  if (!command) return null;

  const paramsRegex = prepareParamRegexPartialList(command.params);
  const commandGroupRegex = new RegExp(`^/${info.id}${paramsRegex}`);
  const commandGroupMatches = str
    .substring(info.startPos)
    .match(commandGroupRegex);

  if (commandGroupMatches) {
    const match = mapCommandGroupMatches(command, commandGroupMatches);

    const endPos = info.startPos + match.full.length;

    // if the text cursor is after the possible bounds of
    // the match, we shouldn't let them operate on it.
    if (pos > endPos) {
      return null;
    }

    const context = {
      preString: getPreString(str, info.startPos),
      postString: getPostString(str, endPos),
      match,
      command
    };

    return context;
  }
};

const showWord = (e) => {
  let text = "";
  const { value, selectionStart } = e.target;
  const context = getCommandContext(value, selectionStart);

  if (context) {
    const { command } = context;
    text = `/${command.id} ${createParamDefinition(command.params)} (${
      command.description
    })`;
  }
  show.innerText = text;
};

if (input) {
  input.addEventListener("click", showWord);
  input.addEventListener("keyup", showWord);
}

const createParamDefinition = (params = []) =>
  params.reduce(
    (acc, curr, index) =>
      `${acc}[${curr.name || curr.id}]${
        params.length !== index + 1 ? " " : ""
      }`,
    ""
  );
