// this lets postcss process the shared tailwind styles
const config = {
  // load the tailwind processor when css is built
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
