import logger from "pino";
import { format } from "date-fns";

const log = logger({
  transport: {
    target: "pino-pretty",
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${format(new Date(), "MM/d/yyyy - hh:mm:ss a")}"`,
});

export default log;
