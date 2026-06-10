import axios from 'axios';

const AUTH_API = '/evaluation-service/auth';
const LOG_API = '/evaluation-service/logs';

const CREDENTIALS = {
    email: "darshanvenkatesan2005@gmail.com",
    name: "darshan v",
    rollNo: "e0323040",
    accessCode: "DvwEDZ",
    clientID: "d7a5f804-619d-4cbf-a6ca-fecee4e3f76a",
    clientSecret: "xEzbKqEvMrFptrnx"
};

export async function getBrowserToken() {
    const now = Math.floor(Date.now() / 1000);
    const storedToken = localStorage.getItem('ACCESS_TOKEN');
    const storedExpiry = parseInt(localStorage.getItem('TOKEN_EXPIRY') || '0', 10);

    if (storedToken && now < storedExpiry) {
        return storedToken;
    }

    const response = await axios.post(AUTH_API, CREDENTIALS);
    const { access_token, expires_in } = response.data;

    localStorage.setItem('ACCESS_TOKEN', access_token);
    localStorage.setItem('TOKEN_EXPIRY', expires_in);

    return access_token;
}

export async function Log(level, pkg, message) {
    try {
        const token = await getBrowserToken();
        await axios.post(
            LOG_API,
            {
                stack: "frontend",
                level: level.toLowerCase(),
                package: pkg.toLowerCase(),
                message: message.substring(0, 48)
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );
    } catch (_) {}
}