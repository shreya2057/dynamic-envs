export const runtimeEnv = async () => {
  const res = await fetch("/_next/static/env.json", {
    cache: "no-store",
  });
  const env = await res.json();
  return env;
};
