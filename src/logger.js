import Logger from "pretty-js-log";

let instance = null;

function getLogger() {
  if (!instance) {
    instance = new Logger.logFactory({
      colors: true,
    });
  }
  return instance;
}

export { getLogger };
