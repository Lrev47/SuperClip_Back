# date.ts

- [ ] Test file made
- [ ] File made
- [ ] File passed the tests

## Purpose

This utility file provides standardized date and time handling functions for the application. It offers consistent date formatting, parsing, comparison, and manipulation capabilities while handling timezone issues and internationalization. The utility ensures consistent date operations across the application and simplifies working with date/time data.

## Dependencies

- External packages:
  - date-fns (for date manipulation and formatting)
- Internal modules:
  - ../config/app (for timezone and locale settings)

## Inputs/Outputs

- **Input**: Date objects, date strings, timestamps, durations
- **Output**: Formatted dates, parsed date objects, comparison results

## Data Types

```typescript
import { Locale } from 'date-fns';

// Date format presets
export enum DateFormat {
  ISO = 'ISO',
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG',
  FULL = 'FULL',
  API = 'API',
  DATABASE = 'DATABASE',
  TIMESTAMP = 'TIMESTAMP',
}

// Time units for duration calculations
export enum TimeUnit {
  MILLISECOND = 'millisecond',
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

// Options for date formatting
export interface FormatOptions {
  format?: DateFormat | string;
  timezone?: string;
  locale?: Locale;
}

// Duration representation
export interface Duration {
  value: number;
  unit: TimeUnit;
}

// Range of dates
export interface DateRange {
  start: Date;
  end: Date;
}
```

## API/Methods

### formatDate

- Description: Formats a date according to the specified format
- Signature: `formatDate(date: Date | string | number, options?: FormatOptions): string`
- Parameters:
  - date: Date to format (Date object, ISO string, or timestamp)
  - options: Format options including pattern, timezone, and locale
- Returns: Formatted date string
- Usage: `formatDate(new Date(), { format: DateFormat.LONG })`

### parseDate

- Description: Parses a date string to a Date object
- Signature: `parseDate(dateString: string, format?: DateFormat | string, timezone?: string): Date`
- Parameters:
  - dateString: String representation of date
  - format: Expected format of the input string
  - timezone: Timezone to use for parsing
- Returns: JavaScript Date object
- Throws: Error if parsing fails
- Usage: `parseDate('2023-01-01', DateFormat.ISO)`

### now

- Description: Gets the current date/time, optionally in a specific timezone
- Signature: `now(timezone?: string): Date`
- Parameters:
  - timezone: Optional timezone (defaults to app timezone)
- Returns: Current Date object
- Usage: `const today = now()`

### toTimestamp

- Description: Converts a date to a Unix timestamp (seconds since epoch)
- Signature: `toTimestamp(date: Date | string | number): number`
- Parameters:
  - date: Date to convert
- Returns: Unix timestamp (seconds)
- Usage: `const timestamp = toTimestamp(new Date())`

### fromTimestamp

- Description: Creates a Date from a Unix timestamp
- Signature: `fromTimestamp(timestamp: number): Date`
- Parameters:
  - timestamp: Unix timestamp (seconds)
- Returns: Date object
- Usage: `const date = fromTimestamp(1640995200)`

### addTime

- Description: Adds a specified duration to a date
- Signature: `addTime(date: Date, duration: Duration): Date`
- Parameters:
  - date: Starting date
  - duration: Amount of time to add
- Returns: New Date with added duration
- Usage: `const nextWeek = addTime(now(), { value: 1, unit: TimeUnit.WEEK })`

### subtractTime

- Description: Subtracts a specified duration from a date
- Signature: `subtractTime(date: Date, duration: Duration): Date`
- Parameters:
  - date: Starting date
  - duration: Amount of time to subtract
- Returns: New Date with subtracted duration
- Usage: `const lastMonth = subtractTime(now(), { value: 1, unit: TimeUnit.MONTH })`

### diffBetweenDates

- Description: Calculates the difference between dates in specified units
- Signature: `diffBetweenDates(startDate: Date, endDate: Date, unit: TimeUnit): number`
- Parameters:
  - startDate: Earlier date
  - endDate: Later date
  - unit: Unit for the result
- Returns: Difference in the specified unit
- Usage: `const daysPassed = diffBetweenDates(startDate, endDate, TimeUnit.DAY)`

### isAfter

- Description: Checks if a date is after another date
- Signature: `isAfter(date: Date, dateToCompare: Date): boolean`
- Parameters:
  - date: Date to check
  - dateToCompare: Date to compare against
- Returns: Boolean indicating if date is after dateToCompare
- Usage: `if (isAfter(userDate, expiryDate)) { ... }`

### isBefore

- Description: Checks if a date is before another date
- Signature: `isBefore(date: Date, dateToCompare: Date): boolean`
- Parameters:
  - date: Date to check
  - dateToCompare: Date to compare against
- Returns: Boolean indicating if date is before dateToCompare
- Usage: `if (isBefore(currentDate, deadline)) { ... }`

### isBetween

- Description: Checks if a date falls within a date range
- Signature: `isBetween(date: Date, range: DateRange, inclusive: boolean = true): boolean`
- Parameters:
  - date: Date to check
  - range: Date range with start and end
  - inclusive: Whether to include range boundaries
- Returns: Boolean indicating if date is in range
- Usage: `if (isBetween(eventDate, subscriptionPeriod)) { ... }`

### startOfDay

- Description: Returns the start of the day for a given date
- Signature: `startOfDay(date: Date): Date`
- Parameters:
  - date: Input date
- Returns: Date set to start of day (00:00:00)
- Usage: `const dayStart = startOfDay(someDate)`

### endOfDay

- Description: Returns the end of the day for a given date
- Signature: `endOfDay(date: Date): Date`
- Parameters:
  - date: Input date
- Returns: Date set to end of day (23:59:59.999)
- Usage: `const dayEnd = endOfDay(someDate)`

### startOfMonth

- Description: Returns the start of the month for a given date
- Signature: `startOfMonth(date: Date): Date`
- Parameters:
  - date: Input date
- Returns: Date set to the first day of month at 00:00:00
- Usage: `const monthStart = startOfMonth(someDate)`

### endOfMonth

- Description: Returns the end of the month for a given date
- Signature: `endOfMonth(date: Date): Date`
- Parameters:
  - date: Input date
- Returns: Date set to the last day of month at 23:59:59.999
- Usage: `const monthEnd = endOfMonth(someDate)`

## Test Specifications

### Unit Tests

- Should format dates correctly in different formats
- Should parse date strings correctly
- Should handle different timezones properly
- Should add and subtract time correctly
- Should calculate differences between dates accurately
- Should compare dates correctly
- Should determine start/end of day and month correctly
- Should handle edge cases like invalid dates and DST transitions

### Integration Tests

- Should integrate with user preferences for date formats
- Should work with dates from the database
- Should correctly format dates for API responses

## Implementation Notes

1. **Timezone Handling**:

   - Use explicit timezone conversions to avoid issues
   - Handle daylight saving time transitions correctly
   - Default to application timezone when not specified
   - Consider using UTC for internal storage and calculations

2. **Internationalization**:

   - Support multiple locales for date formatting
   - Handle different calendar systems if needed
   - Use locale-aware formatting for month names, weekdays

3. **Performance Considerations**:

   - Cache frequently used date formats
   - Use efficient date libraries with good performance
   - Be mindful of unnecessary date object creations

4. **Best Practices**:

   - Use immutable date operations (returning new Date objects)
   - Validate inputs to prevent errors with invalid dates
   - Use consistent date formats throughout the application
   - Store dates in ISO format in the database

5. **Edge Cases**:
   - Handle invalid dates gracefully
   - Account for leap years and leap seconds
   - Handle dates before 1970 and after 2038 correctly
   - Consider time precision requirements

## Related Files

- src/config/app.ts (for timezone and locale settings)
- src/middleware/request-parser.middleware.ts (for date parsing in requests)
- src/services/subscription.service.ts (for duration calculations)
- src/utils/validation.ts (for date validation)
