// function selectElementContents(el: Node) {
//   var range = document.createRange();
//   range.selectNodeContents(el);
//   range.selectNodeContents(el);
//   var sel = window.getSelection();
//   if (sel) {
//     console.log(sel);
//     sel.removeAllRanges();
//     sel.addRange(range);
//     return sel;
//   }
// }

const NUMBER_ARG_REGEX_PARTIAL = "[0-9]+";
const WORD_ARG_REGEX_PARTIAL = '[^" /]*';
const QUOTED_ARG_REGEX_PARTIAL = '"[^/"]*"';
const SENTENCE_ARG_REGEX_PARTIAL = ".*";

const commands = [
  {
    id: "add",
    description: "Add two numbers together",
    arguments: [
      {
        match: NUMBER_ARG_REGEX_PARTIAL,
        id: "a"
      },
      {
        match: NUMBER_ARG_REGEX_PARTIAL,
        id: "b"
      }
    ]
  },
  {
    id: "shout",
    description: "Shout from the rooftops"
  },
  {
    id: "repeat",
    description: "Repeat a phrase n times",
    arguments: [
      {
        match: NUMBER_ARG_REGEX_PARTIAL,
        id: "count"
      },
      {
        match: QUOTED_ARG_REGEX_PARTIAL,
        id: "phrase"
      }
    ]
  },
  {
    id: "hello",
    description: "Say hello!",
    arguments: [
      {
        match: WORD_ARG_REGEX_PARTIAL,
        id: "name"
      }
    ]
  },
  {
    id: "upper-all",
    description: "Uppercase everything",
    arguments: [
      {
        match: SENTENCE_ARG_REGEX_PARTIAL,
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
const normalizeFoundCmdStr = (value) => value.replace("/", "").replace(" ", "");

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
  const concatenatedCmdStr = `${preText}${postText}`;

  // check if formatted like command because
  // we only check for a starting slash in `pre`
  // and may have only found a value in `post`
  const isFormattedLikeCmd = concatenatedCmdStr.startsWith("/");

  if (isFormattedLikeCmd) {
    const commandIndex = pos - preText.length;
    return {
      id: normalizeFoundCmdStr(concatenatedCmdStr),
      startPos: commandIndex
    };
  }

  // next, handle if there is a fully declared command
  // before our cursor position
  const fullyDeclaredCmdsBeforePosition = preStr.match(/\/[a-zA-Z0-9-_]* /g);

  if (fullyDeclaredCmdsBeforePosition) {
    // we only want the most recent command declared
    const [lastCmdStr] = fullyDeclaredCmdsBeforePosition.slice(-1);
    const startPos = preStr.lastIndexOf(lastCmdStr);

    return {
      id: normalizeFoundCmdStr(lastCmdStr),
      startPos
    };
  }

  return null;
};

const getSlashCommand = (str, pos) => {
  const info = findRawFocusedCommandString(str, pos);

  if (!info) return null;

  const command = findCommand(info.id);

  if (!command) return null;

  // these rough arg matchers can
  // be abstracted!
  // const argRegex = command.arguments
  //   ? `(${QUOTED_ARG_REGEX_PARTIAL_W_SPACE}|${STANDARD_ARG_REGEX_PARTIAL_W_SPACE}){0,${command.arguments.length}}`
  //   : "";

  // const argRegexList = (command.arguments || []).map((arg, i) =>
  //   i === command.arguments.length - 1
  //     ? `(${QUOTED_ARG_REGEX_PARTIAL}|${STANDARD_ARG_REGEX_PARTIAL})`
  //     : `(${QUOTED_ARG_REGEX_PARTIAL_W_SPACE}|${STANDARD_ARG_REGEX_PARTIAL_W_SPACE})`
  // );

  // this wraps each argument's `match` regex partials
  // with whitespace and parens according to their position
  // in the arg list
  const argRegexList = (command.arguments || []).map((arg, i) => {
    // default to case where arg is not first or last
    let match = `(${arg.match})? ?`;
    // handle last arg case next. If it's the only arg,
    // this will get overridden in the next condition
    if (i === command.arguments.length - 1) {
      match = `(${arg.match})?`;
    }
    // finally, handle the first arg case
    if (i === 0) {
      match = ` ?(${arg.match})? ?`;
    }

    return match;
  });

  const argRegex = argRegexList.join("");
  console.log(argRegex);

  const idAndArgsRegex = new RegExp(`^/${info.id}${argRegex}`);
  console.log(idAndArgsRegex);
  const slashChainList = str.substring(info.startPos).match(idAndArgsRegex);

  if (slashChainList) {
    const slashChain = slashChainList[0];
    console.log(slashChainList);
    const endPos = info.startPos + slashChain.length;

    if (pos > endPos) {
      return null;
    }

    return command;
  }
};

const showWord = (e) => {
  let text = "";
  const { value, selectionStart } = e.target;
  const command = getSlashCommand(value, selectionStart);

  if (command) {
    text = `/${command.id} ${createArgumentDefinition(command.arguments)} (${
      command.description
    })`;
  }
  show.innerText = text;
};

if (input) {
  input.addEventListener("click", showWord);
  input.addEventListener("keyup", showWord);
}

const createArgumentDefinition = (args = []) =>
  args.reduce(
    (acc, curr, index) =>
      `${acc}[${curr.name || curr.id}]${args.length !== index + 1 ? " " : ""}`,
    ""
  );
