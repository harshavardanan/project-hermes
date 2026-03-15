import React from "react";
import type { Reaction } from "../../types/index";
interface ReactionPickerProps {
    onSelect: (emoji: string) => void;
    currentReactions?: Reaction[];
    currentUserId?: string;
    emojis?: string[];
    className?: string;
    align?: "left" | "right";
}
export declare const ReactionPicker: React.FC<ReactionPickerProps>;
export {};
//# sourceMappingURL=ReactionPicker.d.ts.map