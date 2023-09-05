import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import getUserTimezone from "./getUserTimezone";

const createDateInTimezone = (date?: string | Date) => {
  const now = new Date();

  const formattedDate = format(
    utcToZonedTime(
      date ? date : now,
      process.env.NODE_ENV === "development" ? getUserTimezone() : "UTC"
    ),
    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
  );

  const parsedDate = parseISO(formattedDate);

  return parsedDate;
};

export default createDateInTimezone;
