interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  showAdmin?: boolean;
}

export default function Navigation({ activeTab, onTabChange, showAdmin = false }: NavigationProps) {
  const tabs = [
    { key: "dashboard", icon: "fas fa-home", label: "Dashboard" },
    { key: "accounts", icon: "fas fa-upload", label: "Submit Accounts" },
    { key: "reports", icon: "fas fa-chart-line", label: "Reports" },
    { key: "quiz", icon: "fas fa-question-circle", label: "Daily Quiz" },
    { key: "referral", icon: "fas fa-users", label: "Referrals" },
    ...(showAdmin ? [{ key: "admin", icon: "fas fa-cog", label: "Admin" }] : []),
  ];

  return (
    <nav className="bg-white border-b border-border sticky top-16 z-40">
      <div className="container mx-auto px-4">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-3 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'tab-active'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              data-testid={`tab-${tab.key}`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
