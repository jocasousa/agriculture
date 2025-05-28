require("@testing-library/jest-dom");

// Polyfill para TextEncoder/TextDecoder (caso não existam no Node)
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Polyfill para import.meta.env (Vite)
globalThis.import = {
  meta: { env: { VITE_API_URL: "http://localhost:3002" } },
};
