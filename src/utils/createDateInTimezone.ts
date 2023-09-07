import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const createDateInTimezone = (timezone: string, date?: string | Date) => {
  const now = new Date();

  const formattedDate = format(
    utcToZonedTime(date ? date : now, timezone),
    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
  );

  const parsedDate = parseISO(formattedDate);

  return parsedDate;
};

export default createDateInTimezone;
