import { defaultOnContextChange } from "./on-context-change";
import { findRawCommandString, parseCommandContext } from "./slash-utils";
import { Command, CommandContext, SlashOptions } from "./types";

export function Slash(options: SlashOptions) {
  let target = options.target;
  let commands = options.commands;
  let onContextChange = options.onContextChange || defaultOnContextChange;
  let currentContext: CommandContext = null;

  this.init = function () {
    target.addEventListener("click", this.onTrigger);
    target.addEventListener("keyup", this.onTrigger);

    return this;
  };

  this.findCommand = (value: string) => {
    return commands.find((c) => c.id.toLowerCase() === value.toLowerCase());
  };

  this.onTrigger = (e) => {
    const { value, selectionStart } = e.target;
    currentContext = this.getCommandContext(value, selectionStart);

    // if there's a command that can be run,
    // allow the user to execute the command,
    // otherwise unmount the event listener
    if (currentContext && currentContext.match.isValid) {
      target.addEventListener("keydown", this.executeCommand);
    } else {
      target.removeEventListener("keydown", this.executeCommand);
    }

    onContextChange(currentContext, target);
  };

  // find the relevant command based on user cursor position,
  // and assemble any data we may need to process the command
  this.getCommandContext = (
    inputText: string,
    cursorPos: number
  ): CommandContext | null => {
    const raw = findRawCommandString(inputText, cursorPos);

    if (!raw) return null;

    const command = this.findCommand(raw.id);

    if (!command) return null;

    return parseCommandContext(command, raw);
  };

  // event that runs when user executes command
  this.executeCommand = (e) => {
    if (e.keyCode === 9) {
      console.log("i run...");
      e.preventDefault();
      const update = currentContext.command.executeCommand(currentContext);
      if (!update) return;

      const {
        // default to existing string partials
        // if these are undefined since it's a
        // better DX to not require these to be
        // passed in the update.
        pre = currentContext.stringPartials.pre,
        post = currentContext.stringPartials.post,
        replacement
      } = update;
      // set the actual input value!
      target.value = `${pre}${replacement}${post}`;
      // set the updated cursor position
      target.selectionEnd = pre.length + `${replacement}`.length;
    }
  };

  this.addCommand = (command: Command) => {
    this.commands.push(command);
  };

  this.removeCommand = (commandId: string) => {
    this.commands = this.commands.filter((c) => c.id !== commandId);
  };

  return this.init();
}
