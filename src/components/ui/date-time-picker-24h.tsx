"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCallback, useMemo } from "react";

type DateTimePicker24hPropsWithISOString = {
  value: string;
  onChange: (value: string) => void;
  toISOString: true;
};
type DateTimePicker24hPropsWithoutISOString = {
  value: Date;
  onChange: (value: Date) => void;
  toISOString?: false;
};

type DateTimePicker24hProps =
  | DateTimePicker24hPropsWithISOString
  | DateTimePicker24hPropsWithoutISOString;
const hours = Array.from({ length: 24 }, (_, i) => i);

export function DateTimePicker24h({
  value: propValue,
  onChange: propOnChange,
  toISOString,
}: DateTimePicker24hProps) {
  const value = useMemo(
    () => (toISOString ? new Date(propValue) : propValue),
    [propValue, toISOString],
  );
  const onChange = useCallback(
    (value: Date) => {
      if (toISOString) {
        propOnChange(value.toISOString());
      } else {
        propOnChange(value);
      }
    },
    [propOnChange, toISOString],
  );
  const handleDateSelect = useCallback(
    (selectedDate: Date | undefined) => {
      if (selectedDate) {
        onChange(selectedDate);
      }
    },
    [onChange],
  );

  const handleTimeChange = useCallback(
    (type: "hour" | "minute", timeValue: string) => {
      if (!value) return;
      const newDate = new Date(value);
      if (type === "hour") {
        newDate.setHours(Number.parseInt(timeValue));
      } else if (type === "minute") {
        newDate.setMinutes(Number.parseInt(timeValue));
      }
      onChange(newDate);
    },
    [onChange, value],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "MM/dd/yyyy hh:mm")
          ) : (
            <span>MM/DD/YYYY hh:mm</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="sm:flex">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="flex flex-col divide-y sm:h-[300px] sm:flex-row sm:divide-x sm:divide-y-0">
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {hours.reverse().map((hour) => (
                  <Button
                    key={hour}
                    size="icon"
                    variant={
                      value && value.getHours() === hour ? "default" : "ghost"
                    }
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() => handleTimeChange("hour", hour.toString())}
                  >
                    {hour}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
            <ScrollArea className="w-64 sm:w-auto">
              <div className="flex p-2 sm:flex-col">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                  <Button
                    key={minute}
                    size="icon"
                    variant={
                      value && value.getMinutes() === minute
                        ? "default"
                        : "ghost"
                    }
                    className="aspect-square shrink-0 sm:w-full"
                    onClick={() =>
                      handleTimeChange("minute", minute.toString())
                    }
                  >
                    {minute.toString().padStart(2, "0")}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="sm:hidden" />
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
