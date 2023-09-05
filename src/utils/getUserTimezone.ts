const getUserTimezone = () => {
  if (typeof Intl === "object" && typeof Intl.DateTimeFormat === "function") {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return userTimezone;
  } else {
    return "UTC";
  }
};

export default getUserTimezone;
