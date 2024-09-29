'use client'

import { useState, createContext, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowRight, Smartphone, Lock, Moon, Sun, AlertCircle } from "lucide-react"
import { loginWithPhone, verifyotp } from '@/api/user'

// Create a context for the theme
const ThemeContext = createContext({
    isDark: false,
    toggleTheme: () => { },
})

// Theme provider component
const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [isDark])

    const toggleTheme = () => setIsDark(!isDark)

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

// Hook to use the theme
const useTheme = () => useContext(ThemeContext)

// Theme toggle button component
const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="absolute top-4 right-4"
        >
            {isDark ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}

// Country codes (simplified list)
const countryCodes = [
    { code: '+91', country: 'India' },
    { code: '+44', country: 'UK' },
    { code: '+1', country: 'USA' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
]

export default function ChatLogin() {
    const router = useRouter()
    const [step, setStep] = useState<'phone' | 'otp'>('phone')
    const [countryCode, setCountryCode] = useState('+91')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [error, setError] = useState('')

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        // Simulate sending OTP
        e.preventDefault()
        setIsLoading(true)

        try {
            // Call your API here
            const result = await loginWithPhone(`${countryCode}${phoneNumber}`);
            (result.waitTime)? setError(result.msg):setStep('otp'); // Move to the OTP step
        } catch (error) {
            console.error('Error sending OTP:', error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleOtpSubmit = async(e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        try {
            // Call the verifyotp function
            const result = await verifyotp(`${countryCode}${phoneNumber}`, otp);
            // Handle successful verification
            console.log(result); // You can handle the result as needed
            setIsLoading(false);
            router.push('/home'); // Redirect to home screen
        } catch (error) {
            // Handle error during OTP verification
            setIsLoading(false);
            setError('Incorrect OTP. Please try again.'); // Update with the appropriate message
            console.error(error); // Log the error for debugging
        }
    }

    const handleResendOtp = () => {
        if (cooldown === 0) {
            setIsLoading(true)
            setError('')
            // Simulate resending OTP
            setTimeout(() => {
                setIsLoading(false)
                setCooldown(30)
            }, 1500)
        }
    }

    return (
        <ThemeProvider>
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                <Card className="w-full max-w-md relative">
                    <ThemeToggle />
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-gray-100 text-xl">Chat App Login</CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400">
                            {step === 'phone'
                                ? 'Enter your phone number to receive a one-time password.'
                                : 'Enter the OTP sent to your phone.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        {step === 'phone' ? (
                            <form onSubmit={handlePhoneSubmit}>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="phoneNumber" className="text-gray-700 dark:text-gray-300">Phone Number</Label>
                                        <div className="flex">
                                            <Select value={countryCode} onValueChange={setCountryCode}>
                                                <SelectTrigger className="w-[110px]">
                                                    <SelectValue placeholder="Code" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {countryCodes.map((country) => (
                                                        <SelectItem key={country.code} value={country.code}>
                                                            {country.code} {country.country}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="relative flex-1 ml-2">
                                                <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                                <Input
                                                    id="phoneNumber"
                                                    placeholder="Enter your phone number"
                                                    value={phoneNumber}
                                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                                    className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Sending OTP...' : 'Send OTP'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleOtpSubmit}>
                                <div className="grid w-full items-center gap-4">
                                    <div className="flex flex-col space-y-1.5">
                                        <Label htmlFor="otp" className="text-gray-700 dark:text-gray-300">One-Time Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="otp"
                                                placeholder="Enter the OTP"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                className="pl-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full mt-6" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                                <Button
                                    variant="link"
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={cooldown > 0 || isLoading}
                                    className="w-full mt-2"
                                >
                                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {step === 'otp' && (
                                <Button
                                    variant="link"
                                    onClick={() => {
                                        setStep('phone')
                                        setOtp('')
                                        setError('')
                                    }}
                                    className="text-blue-500 dark:text-blue-400"
                                >
                                    Change phone number
                                </Button>
                            )}
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </ThemeProvider>
    )
}