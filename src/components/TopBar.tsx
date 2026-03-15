import { Search, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const TopBar = ({ searchQuery, onSearchChange }: TopBarProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <span className="text-xs text-muted-foreground tabular-nums">12:45</span>
          <h1 className="text-sm font-semibold tracking-tight">🔥 PREMIUM FILES</h1>
          <button
            onClick={() => navigate("/admin/login")}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            title="Admin Login"
          >
            <LogIn className="w-4 h-4" />
          </button>
        </div>
        </div>
        <div className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="🔍 Find templates, icons, fonts..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
