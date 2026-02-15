import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UtensilsCrossed, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  const fillDemo = (type: 'customer' | 'agent' | 'admin') => {
    const creds = {
      customer: { email: 'customer@villageeats.com', password: 'password' },
      agent: { email: 'agent@villageeats.com', password: 'password' },
      admin: { email: 'admin@villageeats.com', password: 'password' },
    };
    setEmail(creds[type].email);
    setPassword(creds[type].password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <UtensilsCrossed className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
            <CardDescription className="mt-1">
              Sign in to your Village Eats account
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link 
                to={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                className="text-primary font-medium hover:underline"
              >
                Create one
              </Link>
            </p>

            {/* Demo credentials */}
            <div className="w-full p-3 bg-muted/50 rounded-lg space-y-2">
              <p className="text-xs text-center text-muted-foreground font-medium">
                Quick Demo Login:
              </p>
              <div className="flex gap-2 justify-center">
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('customer')} className="text-xs">
                  Customer
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('agent')} className="text-xs">
                  Agent
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('admin')} className="text-xs">
                  Admin
                </Button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
