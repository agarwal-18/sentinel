import { login, register } from '../services/authService'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function Auth() {
    const [error, setError] = useState('')
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: ''
    })
    const navigate = useNavigate();

    const handleSubmit = async () => {
        
        try {
            setError('');
            if (isLogin) {
                const data = await login(formData.email, formData.password);
                localStorage.setItem('token', data.token);
            } else {
                await register(formData.name, formData.username, formData.email, formData.password);
                const loginData = await login(formData.email, formData.password);
                localStorage.setItem('token', loginData.token);
            }
            navigate('/dashboard');
        }
        catch (err) {
            const response = err.response?.data;
            if (response?.errors) {
                setError(response.errors[0].msg)
            }
            else if (response?.error) {
                setError(response.error)
            }
            else {
                setError('Something went wrong!')
            }
        }
    }

    return (
    <div className="flex min-h-screen items-center justify-center px-4">

        <div className="w-full max-w-md">

        {/* Branding */}
        <div className="mb-8 text-center">

            <button
            onClick={() => navigate("/")}
            className="
                text-4xl
                font-bold
                tracking-tight
                text-white
                transition-colors
                hover:text-zinc-300
            "
            >
            ⬡ Sentinel
            </button>

            <p className="mt-3 text-muted-foreground">
            Monitor your services with confidence.
            </p>

        </div>

        <Card>

            <CardHeader>

            <CardTitle>
                {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>

            <CardDescription>
                {isLogin
                ? "Sign in to access your monitors."
                : "Create an account to start monitoring services."}
            </CardDescription>

            </CardHeader>

            <CardContent className="space-y-4">

            {!isLogin && (
                <>
                <div className="space-y-2">
                    <Label>Name</Label>

                    <Input
                    value={formData.name}
                    placeholder="Your Name"
                    onChange={(e) =>
                        setFormData({
                        ...formData,
                        name: e.target.value,
                        })
                    }
                    />
                </div>

                <div className="space-y-2">
                    <Label>Username</Label>

                    <Input
                    value={formData.username}
                    placeholder="myusername"
                    onChange={(e) =>
                        setFormData({
                        ...formData,
                        username: e.target.value,
                        })
                    }
                    />
                </div>
                </>
            )}

            <div className="space-y-2">
                <Label>Email</Label>

                <Input
                type="email"
                placeholder="myemail@example.com"
                value={formData.email}
                onChange={(e) =>
                    setFormData({
                    ...formData,
                    email: e.target.value,
                    })
                }
                />
            </div>

            <div className="space-y-2">
                <Label>Password</Label>

                <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                    setFormData({
                    ...formData,
                    password: e.target.value,
                    })
                }
                />
            </div>
            
            {error && (
                <p className="text-sm text-red-500"> {error} </p>
            )}

            <Button
                className="
                w-full
                bg-white
                text-black
                hover:bg-zinc-200
                hover:text-black
                "
                onClick={handleSubmit}
            >
                {isLogin ? "Login" : "Create Account"}
            </Button>

            <button
                className="
                w-full
                text-sm
                text-muted-foreground
                hover:text-foreground
                transition-colors
                "
                onClick={() => {setIsLogin(!isLogin), setError('')}}
            >
                {isLogin
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </button>

            </CardContent>

        </Card>

        </div>

    </div>
    );

}
export default Auth