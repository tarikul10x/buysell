import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

export default function Home() {
  const { user, logout, isLogoutPending } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user?.firstName || user?.username || "User"}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You are now signed in to Gen Z International.
            </p>
            <Button
              onClick={() => logout()}
              disabled={isLogoutPending}
              variant="outline"
            >
              {isLogoutPending ? "Signing out..." : "Sign Out"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
