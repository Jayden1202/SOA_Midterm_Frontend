
import { useState } from "react";
import { useLogin, useMe } from "../api/hooks";

import { SHOW_TIPS } from "../lib/env";

export function LoginView() {
  const [username, setUsername] = useState("user1");
  const [password, setPassword] = useState("123");
  const login = useLogin();
  const me = useMe();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync({ username, password });
      await me.refetch();
    } catch (e: any) {
      alert(e.message || "Login failed");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div>
            <label className="label">Username</label>
            <input className="input w-full" value={username} onChange={e=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input w-full" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button className="btn btn-primary w-full" disabled={login.isPending}>
            {login.isPending ? "Logging in..." : "Login"}
          </button>
          {login.isError && <p className="text-red-400 text-sm">{(login.error as Error).message}</p>}
        </form>
      </div>
      {SHOW_TIPS && (
      <div className="card space-y-2">
        <h3 className="font-semibold">CORS Notes</h3>
        <ul className="list-disc list-inside text-sm opacity-80">
          <li>FE: <code>http://localhost:5173</code>, BE: <code>{import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"}</code></li>
          <li>BE must enable <code>Access-Control-Allow-Credentials: true</code> and allow FE origin.</li>
          <li>Cookie: <code>jwt_token</code> (HttpOnly).</li>
        </ul>
      </div>
      )}
    </div>
  );
}
