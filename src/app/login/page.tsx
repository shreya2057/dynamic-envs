"use client";
import { httpClient } from "@/lib/httpClient";
import { runtimeEnv } from "@/utils/env";

const Page = () => {
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = httpClient.post("/login", {
        username: "admin",
        password: "admin",
      });
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <form onSubmit={onSubmit}>
      <input name="username" />
      <input name="password" />
      <button type="submit">Login</button>
    </form>
  );
};

export default Page;
