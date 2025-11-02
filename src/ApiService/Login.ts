export const loginApi = async (email: string, password: string) => {
    try {

        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        console.log('Founded Data',data);
        return data;
    } catch (error) {
        console.error('Error occured when try to login :', error);
    }
}