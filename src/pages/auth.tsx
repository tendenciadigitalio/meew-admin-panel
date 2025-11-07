import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error);
      setIsLoading(false);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md border-2 border-black">
        <CardHeader className="space-y-4 text-center">
          <CardTitle className="text-3xl font-bold uppercase tracking-tight">
            MEEW ADMIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="uppercase text-xs font-bold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@meew.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-black"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="uppercase text-xs font-bold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-black"
              />
            </div>
            {error && (
              <div className="rounded-sm border-2 border-red-600 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-zinc-800 uppercase font-bold"
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
