// src/api/user.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const loginWithPhone = async (phoneNumber: string) => {
    const response = await fetch(`${API_URL}/user/send-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber }),
    });

    if (!response.ok) {
        throw new Error('Failed to login');
    }

    return await response.json(); // Assuming the response returns user data or a success message
};

export const verifyotp = async (phoneNumber: string, code: string)=>{
    const response = await fetch(`${API_URL}/user/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            phoneNumber: phoneNumber,
            code: code
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to login with otp');
    }

    return await response.json();
};
