# slash-compose

A small library written in vanilla Typescript that enables customizable slash commands in any input field!

[Check out the demo](https://zealous-noether-a01651.netlify.app/)

## Features

- Define commands either synchronously or later on.
- Initialize the library on any `input` or `textarea`.
- Tab to execute valid command.
- Positions cursor correctly after a command is executed.
- Define command parameters with flexible regex matching.
- Optionally update any text in the input area -- you're not limited to only operating on the slash command and its parameters!
- Override the change handler to trigger your own behavior.
- Dependency free (okay, Tippy is used in the demo for the default tooltip but that can easily be abstracted out)

## Run the demo

- Download project, then `npm i` and `npm run start`

## How to use

First, define some commands. For example, here's a command array with a simple command defined:
```
const commands: Command[] = [
  {
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
  }
]
```

Next, initialize a new Slash instance with your commands and a target:
```
const slash = new Slash({ commands, target: document.querySelector("textarea") })
```

Call a command by typing it into your input field with a slash in front:
```
/greeting Wilson
```

If your parameters are valid, you should be able to press `tab` and watch the above text be automatically replaced with "Hello, Wilson!"

### The `Slash` instance

As shown above, initializing `Slash` on a field is as easy as passing the function a target and some commands. When you call `Slash`, it also returns the Slash instance so that you can call additional methods on it.

Available options:

- `commands`: the initial command set
- `target`: the field you want to integrate Slash with
- `onContextChange`: an optional function that allows you to specify your own context change behavior.

```
type SlashOptions = {
  commands: Command[];
  target: SlashTarget;
  onContextChange?: OnContextChangeFn;
}
```

### Command model

A command has the following properties:

- `id`: the string a user must type to initialize this command
- `description`: a human readable description of what the command does
- `params`: an optional list of params that this command accepts. Optional
- `executeCommand`: function that's called when you tab to complete and allows for updating the text.

```
type Command = {
  id: string;
  description: string;
  params?: CommandParam[];
  executeCommand: (ctx: CommandContext) => CommandUpdate | null;
};
```

### Command - param

A command can include a parameter modeled like so:

- `match`: a regex match
- `id`: the human readable name of this param
- `accessor`: modify the value before passing it to the match context. (e.g. take a stringified number and convert it to a number) Optional

```
type CommandParam = {
  match: string;
  id: string;
  accessor?: (val: string) => unknown;
};
```

### Command - executeCommand

When a command is executed by the user, Slash passes the `CommandContext` object (documented below) as an argument to the command's `executeCommand` function. This object contains all the data you may need to update the text however you see fit.

To actually update the text for the user, return an object that represents the new state of the text field:
- `replacement`: the text that will replace the complete command text, including arguments
- `pre`: all text that comes _before_ the command text. Optional; if left undefined, the current text will not be affected.
- `post`: all text that comes _after_ the command text. Optional; like `pre`, if left undefined, the current text will not be affected.

```
type CommandUpdate = {
  replacement: string;
  pre?: string;
  post?: string;
};
```

*What happens after the `executeCommand` function completes?*
Slash combines pre, post, and replacement values from above to create the updated text value, and then repositions the user's cursor to the appropriate position.

### Command Context

The Command Context represents the current contextual state of your Slash instance, including:
- `command`: the command (if any) that is currently active under the user's text cursor
- `match`:
  - `full`: the complete command text, including the command and any arguments
  - `isValid`: whether or not the command's arguments are valid based on each param's `match` property
  - `data`: an array of parsed arguments and their ID's. Includes both the raw input value and the value returned from the param's `accessor` if one is defined.
- `raw`: general data regarding the user's current position in relation to the active command
- `stringPartials`: easy access to both the `pre` and `post` parsed values.

If no command is currently active, `onContextChange` will be called with `null` instead of the command context.

Here's what it looks like:
```
type CommandContext = {
  command: Command;
  match: {
    full: string;
    isValid: boolean;
    data: { id: string; value: unknown; rawValue: string } | null;
  };
  raw: {
    id: string;
    startPos: number;
    inputText: string;
    cursorPos: number;
  };
  stringPartials: {
    pre: string;
    post: string;
  };
};
```

## Requirements

The tool should:
- Support both parameter-based execution and generalized execution on the entire text contents.
- Give the user feedback on what a typed slash command does and which parameters it accepts, if any.
- Allow developer to manage which commands are available to the user.
- Give the developer control over the `onContextChange` handler to manage their own custom tooltip display, but provide a nice default.

## Assumptions

- A slash command should support variable number of parameters
- A slash command does not contain spaces
- A slash command could be typed and executed from the beginning, middle, or end of the text contents, and there may be multiple slash commands in the contents at once, but only one should ever be executable at any time.
- The library is built to be initialized on editable plaintext content and has only been tested in a textarea element.

## Tradeoffs

- I debated between using a JS map, object, or array of objects for the command params. A JS map would have been the best of both worlds since it's ordered and you can reference keys easily, but it's a little arcane for most developers. I went with an array, but I'd like to experiment with an object for better typescript type support.
- The implementation relies heavily on regex for contextualizing where the user has their cursor and which command is relevant. It may be because Regex is just intimidating, but I feel there are likely edgecases that break the code that I haven't discovered.

## Future Improvements

- Add an "example" field to the Command Param model so that it's more clear how params should be formatted
- Don't lose context between quotes when a param expects the argument to be wrapped in quotations
- The `executeCommand` command property should support returning a promise to perform async tasks (like picking from a list of options, fetching data from an API, or displaying a form that allows the user to create a new command)
- The Slash instance should be passed to `executeCommand` so that a command execution has the option to modify the instance in some way (add/remove a command, unmount, etc.)
- I didn't thoroughly test asynchronously adding or removing commands from an initialized Slash instance
- Better error and validation handling would improve the user experience. For example, in the demo, if you type something like `/add 1 foo`, the command becomes invalid when you're cursored over "foo", and it doesn't tell you it expects that to be a number instead of a string.
- Slash suggestions while you're typing would be awesome
- Better hook support without overriding default tooltip completely

## Potential Milestones

- I'd spend some more time making the tool generally more customizable, adding hooks and event handlers that the developer can leverage.
- Since this is a developer focused product and built to be extensible, I would possibly recommend releasing it as opensource to gain feedback from dev community and get help fixing bugs and building features.
- Abstract out the UI pieces (tooltip, maybe an integrated input field component), the base tool could be open source but the "Compose UI" could be private
- Gain feedback from user testing, work out any bugs and build missing features like Slash suggestions, better slash hinting, and some kind of Slash plugin tool.
