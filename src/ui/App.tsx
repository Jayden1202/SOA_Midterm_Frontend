
import { useEffect, useSyncExternalStore } from "react";
import { LoginView } from "./LoginView";
import { Dashboard } from "./Dashboard";
import History from "./History";
import { useMe } from "../api/hooks";

function useHash() {
  const subscribe = (cb: () => void) => {
    window.addEventListener("hashchange", cb);
    return () => window.removeEventListener("hashchange", cb);
  };
  const get = () => window.location.hash;
  return useSyncExternalStore(subscribe, get, get);
}

export function App() {
  const me = useMe();
  const isLogged = !!me.data?.data;
  const hash = useHash();

  useEffect(() => { me.refetch(); }, []);

  const onHistory = hash.startsWith("#/history");

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 center">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tuition Payment</h1>
        <nav className="text-sm">
          <a href="#/history" className="link mr-3">History</a>
          <a href="#" className="link">Main Page</a>
        </nav>
      </header>
      {!isLogged ? <LoginView /> : (onHistory ? <History /> : <Dashboard />)}
    </div>
  );
}
