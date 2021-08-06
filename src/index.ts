import { Slash } from "./slash";
import { Command } from "./types";

const NUMBER_PARAM_REGEX_PARTIAL = "[0-9]+";
const WORD_PARAM_REGEX_PARTIAL = '[^" /]*';
const QUOTED_PARAM_REGEX_PARTIAL = '"[^/"]*"';
const SENTENCE_PARAM_REGEX_PARTIAL = ".*";

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
    onComplete: (context) => {
      const {
        stringPartials: { pre, post },
        match: { data }
      } = context;

      return {
        replacement: data[0].value + data[1].value,
        pre,
        post
      };
    }
  },
  {
    id: "shout",
    description: "Shout from the rooftops",
    onComplete: (context) => null
  },
  {
    id: "repeat",
    description: "Repeat a phrase n times",
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
    onComplete: (context) => {
      const {
        stringPartials: { pre, post },
        match: { data }
      } = context;

      return {
        replacement: data[1].value.repeat(data[0].value),
        pre,
        post
      };
    }
  },
  {
    id: "hello",
    description: "Say hello!",
    params: [
      {
        match: WORD_PARAM_REGEX_PARTIAL,
        id: "name"
      }
    ],
    onComplete: (context) => null
  },
  {
    id: "upper-all",
    description: "Uppercase everything",
    params: [
      {
        match: SENTENCE_PARAM_REGEX_PARTIAL,
        id: "sentence"
      }
    ],
    onComplete: (context) => null
  }
];

Slash({ commands, target: document.querySelector("textarea") });
