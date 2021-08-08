import { defaultOnContextChange } from "./on-context-change";
import Slash from "./slash";
import { Command } from "./types";

const NUMBER_PARAM_REGEX_PARTIAL = "[0-9]+";
const WORD_PARAM_REGEX_PARTIAL = '[^" /]*';
const QUOTED_PARAM_REGEX_PARTIAL = '"[^/"]*"';
const SENTENCE_PARAM_REGEX_PARTIAL = ".*";

// define some commands
const commands: Command[] = [
  {
    id: "add",
    description: "Add two numbers together",
    params: [
      {
        match: NUMBER_PARAM_REGEX_PARTIAL,
        id: "a",
        accessor: (val: string) => +val
      },
      {
        match: NUMBER_PARAM_REGEX_PARTIAL,
        id: "b",
        accessor: (val: string) => +val
      }
    ],
    executeCommand: (ctx) => ({
      replacement: ctx.match.data[0].value + ctx.match.data[1].value
    })
  },
  {
    id: "repeat",
    description: 'Repeat a phrase n times (ex. /repeat 3 "hey "',
    params: [
      {
        match: NUMBER_PARAM_REGEX_PARTIAL,
        id: "count",
        accessor: (val) => +val
      },
      {
        match: QUOTED_PARAM_REGEX_PARTIAL,
        id: "phrase",
        accessor: (val) => val.replace(/"/g, "")
      }
    ],
    executeCommand: (ctx) => ({
      replacement: ctx.match.data[1].value.repeat(ctx.match.data[0].value)
    })
  },
  {
    id: "upper",
    description: "Uppercase everything",
    params: [
      {
        match: SENTENCE_PARAM_REGEX_PARTIAL,
        id: "sentence"
      }
    ],
    executeCommand: (ctx) => ({
      replacement: ctx.match.data[0].value.toUpperCase()
    })
  },
  {
    id: "upperWordBefore",
    description: "Uppercase a previous word",
    executeCommand: (ctx) => {
      const match = ctx.stringPartials.pre.replace(/\b(\w+) *$/, (v) =>
        v.toUpperCase()
      );

      return {
        replacement: "",
        pre: match
      };
    }
  },
  {
    id: "surprise",
    description: "roll the dice",
    executeCommand: () => ({
      replacement:
        "We're no strangers to love, You know the rules and so do I, A full commitment's what I'm thinking of, You wouldn't get this from any other guy, I just wanna tell you how I'm feeling, Gotta make you understand, Never gonna give you up, Never gonna let you down, Never gonna run around and desert you, Never gonna make you cry, Never gonna say goodbye, Never gonna tell a lie and hurt you"
    })
  }
];

// initialize Slash
const slash = new Slash({ commands, target: document.querySelector("textarea") });

// add a command after initialization
slash.addCommand({
  id: "greeting",
  description: "Say hello to someone",
  params: [
    {
      match: ".*",
      id: "name"
    }
  ],
  executeCommand: (ctx) => ({
    replacement: `Hello, ${ctx.match.data[0].value}!`
  })
})

// remove a command after initialization
slash.removeCommand('greeting')