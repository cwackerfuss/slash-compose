import {
  createParamHints,
  findRawCommandString,
  parseCommandContext
} from "./slash-utils";
import { Command, CommandContext } from "./types";

type SlashOptions = {
  commands: Command[];
  target: HTMLTextAreaElement | HTMLInputElement;
};

export function Slash(options: SlashOptions) {
  let target = options.target;
  let commands = options.commands;
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
    let text = "";
    const { value, selectionStart } = e.target;
    currentContext = this.getCommandContext(value, selectionStart);

    if (currentContext) {
      const {
        command,
        match: { isValid }
      } = currentContext;
      text = `/${command.id} ${createParamHints(command.params)} (${
        command.description
      }) - ${isValid ? "Tab to apply" : "Not ready..."}`;
      console.log(text);
      target.addEventListener("keydown", this.completeCommand);
    } else {
      target.removeEventListener("keydown", this.completeCommand);
    }
    // show.innerText = text;
  };

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

  this.completeCommand = (e) => {
    if (e.which === 9) {
      e.preventDefault();
      const update = currentContext.command.onComplete(currentContext);
      if (!update) return;

      const { pre, post, replacement } = update;
      target.value = `${pre}${replacement}${post}`;
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
