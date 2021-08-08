import { defaultOnContextChange } from "./on-context-change";
import { findCommandById, findRawCommandString, parseCommandContext } from "./slash-utils";
import { Command, CommandContext, OnContextChangeFn, SlashOptions, SlashTarget } from "./types";

export default class Slash {
  currentContext: CommandContext = null
  target: SlashTarget
  commands: Command[] = []
  onContextChange: OnContextChangeFn
 
  constructor(options: SlashOptions) {
    this.target = options.target
    this.commands = options.commands
    this.onContextChange = options.onContextChange || defaultOnContextChange
    this.target.addEventListener("click", this.onTargetEvent);
    this.target.addEventListener("keyup", this.onTargetEvent);
  }

  onTargetEvent = (e) => {
    const { value, selectionStart} = e.target
    this.currentContext = this.getCommandContext(value, selectionStart);

    // if there's a command that can be run,
    // allow the user to execute the command,
    // otherwise unmount the event listener
    if (this.currentContext && this.currentContext.match.isValid) {
      this.target.addEventListener("keydown", this.executeCommand);
    } else {
      this.target.removeEventListener("keydown", this.executeCommand);
    }
    this.onContextChange(this.target, this.currentContext);
  }

  // find the relevant command based on user cursor position,
  // and assemble any data we may need to process the command
  getCommandContext = (inputText: string, cursorPos: number) => {
    const raw = findRawCommandString(inputText, cursorPos);

    if (!raw) return null;

    const command = findCommandById(this.commands, raw.id);

    if (!command) return null;

    return parseCommandContext(command, raw);
  }

  // event that runs when user executes command
  executeCommand = (e) => {
    if (e.keyCode === 9) {
      e.preventDefault();
      const update = this.currentContext.command.executeCommand(this.currentContext);
      if (!update) return;

      const {
        // default to existing string partials
        // if these are undefined since it's a
        // better DX to not require these to be
        // passed in the update.
        pre = this.currentContext.stringPartials.pre,
        post = this.currentContext.stringPartials.post,
        replacement
      } = update;
      // set the actual input value!
      this.target.value = `${pre}${replacement}${post}`;
      // set the updated cursor position
      this.target.selectionEnd = pre.length + `${replacement}`.length;
    }
  };

  addCommand = (command: Command) => {
    this.commands.push(command);
  };

  removeCommand = (commandId: string) => {
    this.commands = this.commands.filter((c) => c.id !== commandId);
  };
}
