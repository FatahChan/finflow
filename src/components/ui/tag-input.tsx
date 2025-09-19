import { useState, type KeyboardEvent } from "react";
import { Input } from "./input";
import { Badge } from "./badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add tag...",
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-3 py-1.5 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => { removeTag(tag); }}
              className="ml-1 hover:bg-destructive/20 rounded-full p-1 touch-manipulation"
              aria-label={`Remove ${tag}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); }}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
          placeholder={value.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[140px] border-none shadow-none focus-visible:ring-0 px-0 text-base"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>
      <div className="text-xs text-muted-foreground">
        Press Enter or comma to add tags
      </div>
    </div>
  );
}
