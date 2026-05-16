/**
 * Structured logger utility
 * Provides colored, timestamped log output
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function timestamp() {
  return new Date().toISOString().slice(11, 23);
}

const logger = {
  info: (message, data = '') => {
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.blue}ℹ${COLORS.reset}  ${message}`, data);
  },

  success: (message, data = '') => {
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.green}✅${COLORS.reset} ${message}`, data);
  },

  warn: (message, data = '') => {
    console.warn(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}⚠${COLORS.reset}  ${message}`, data);
  },

  error: (message, data = '') => {
    console.error(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.red}❌${COLORS.reset} ${message}`, data);
  },

  socket: (message, data = '') => {
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.cyan}📡${COLORS.reset} ${message}`, data);
  },

  db: (message, data = '') => {
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.magenta}🗄${COLORS.reset}  ${message}`, data);
  },

  ai: (message, data = '') => {
    console.log(`${COLORS.gray}[${timestamp()}]${COLORS.reset} ${COLORS.yellow}🤖${COLORS.reset} ${message}`, data);
  },
};

export default logger;
