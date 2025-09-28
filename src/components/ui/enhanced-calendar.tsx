import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  enableYearDropdown?: boolean;
  yearRange?: { start: number; end: number };
};

function EnhancedCalendar({ 
  className, 
  classNames, 
  showOutsideDays = true, 
  enableYearDropdown = true,
  yearRange = { start: 1900, end: new Date().getFullYear() + 10 },
  ...props 
}: EnhancedCalendarProps) {
  const [month, setMonth] = React.useState<Date>(props.month || new Date());

  const handleYearChange = (year: string) => {
    const newDate = new Date(month);
    newDate.setFullYear(parseInt(year));
    setMonth(newDate);
    props.onMonthChange?.(newDate);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() + increment);
    setMonth(newDate);
    props.onMonthChange?.(newDate);
  };

  const years = Array.from(
    { length: yearRange.end - yearRange.start + 1 },
    (_, i) => yearRange.start + i
  ).reverse();

  const CustomCaption = () => (
    <div className="flex justify-center pt-1 relative items-center space-x-2">
      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        )}
        onClick={() => handleMonthChange(-1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">
          {format(month, "MMMM")}
        </span>
        
        {enableYearDropdown ? (
          <Select
            value={month.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-auto w-auto border-0 p-0 bg-transparent hover:bg-accent focus:ring-0 focus:ring-offset-0">
              <div className="flex items-center space-x-1">
                <SelectValue className="text-sm font-medium" />
                <ChevronDown className="h-3 w-3 opacity-50" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[200px] overflow-y-auto">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm font-medium">{month.getFullYear()}</span>
        )}
      </div>

      <button
        type="button"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        )}
        onClick={() => handleMonthChange(1)}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 pointer-events-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
        IconLeft: () => null, // We handle navigation in CustomCaption
        IconRight: () => null,
      }}
      month={month}
      onMonthChange={setMonth}
      {...props}
    />
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };