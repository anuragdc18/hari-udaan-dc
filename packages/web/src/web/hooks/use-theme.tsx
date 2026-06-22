import * as React from "react";

type Theme = "light" | "dark";
const ThemeCtx = React.createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});
export const useTheme = () => React.useContext(ThemeCtx);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof localStorage !== "undefined") {
      return (localStorage.getItem("hu-theme") as Theme) || "light";
    }
    return "light";
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("hu-theme", theme);
  }, [theme]);

  const toggle = React.useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
