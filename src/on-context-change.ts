import { createParamHints } from "./slash-utils";
import { CommandContext, OnContextChangeFn, SlashTarget } from "./types";
import tippy, { Instance } from "tippy.js";
import "tippy.js/dist/tippy.css";

let tooltipInstance: Instance;

const getTooltipInstance = (target: SlashTarget) => {
  if (tooltipInstance) return tooltipInstance;

  tooltipInstance = tippy(target, {
    trigger: 'manual',
  });

  return tooltipInstance;
};

const createTooltipText = ({ command, match }: CommandContext) =>
  `/${command.id} ${createParamHints(command.params)} (${
    command.description
  }) - ${match.isValid ? "Tab to apply" : "Add more args..."}`;

export const defaultOnContextChange: OnContextChangeFn = (target, ctx) => {
  const tooltip = getTooltipInstance(target);
  if (!ctx) {
    tooltip.hide();
  } else {
    tooltip.setContent(createTooltipText(ctx));
    tooltip.show();
  }
};