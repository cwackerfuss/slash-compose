# compose-slash

A small library written in vanilla Typescript that enables customizable slash commands in any input field!

## Features

- Define commands either synchronously or later on.
- Initialize the library on any `input` or `textarea`.
- Tab to execute valid command.
- Positions cursor correctly after a command is executed.
- Define command parameters with flexible regex matching.
- Optionally update any text in the input area -- you're not limited to only operating on the slash command and its parameters!
- Override the change handler to trigger your own behavior.

## Run the demo

- Download project, then `npm i` and `npm run start`

## How to use

- Define some commands
- Call `Slash()` on a field, for example:
  - `Slash({ commands, target: document.querySelector("textarea") })`

### Command model

A command has the following properties:

- `id: string`: the string a user must type to initialize this command
- `description: string`: a human readable description of what the command does
- `params: CommandParam[]`: an optional list of params that this command accepts. Optional
- `executeCommand: (CommandContext) => CommandUpdate | null`: function that's called when you tab to complete and allows for updating the text.

### Command Param model

A command can include a parameter modeled like so:

- `match: string`: a regex match
- `id: string`: the human readable name of this param
- `accessor: (string) => any`: modify the value before passing it to the match context. (e.g. take a stringified number and convert it to a number) Optional

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
