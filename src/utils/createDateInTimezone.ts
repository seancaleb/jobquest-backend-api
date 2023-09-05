const createDateInTimezone = (timeZone: string, date?: string | Date) => {
  return date
    ? new Date(new Date(date).toLocaleString("en-US", { timeZone }))
    : new Date(new Date().toLocaleString("en-US", { timeZone }));
};

export default createDateInTimezone;
