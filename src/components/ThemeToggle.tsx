import { Moon, Sun } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
    const { preferences, toggleTheme } = useUserPreferences();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="brutal-btn w-10 h-10 bg-background"
            title={preferences.theme === 'light' ? "Switch to dark mode" : "Switch to light mode"}
        >
            {preferences.theme === 'light' ? (
                <Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
            ) : (
                <Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
