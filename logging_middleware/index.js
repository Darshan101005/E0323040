const axios = require('axios');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: envPath });

async function getValidToken() {
    require('dotenv').config({ path: envPath });

    const now = Math.floor(Date.now() / 1000);
    const expiry = parseInt(process.env.TOKEN_EXPIRY || '0', 10);

    if (process.env.ACCESS_TOKEN && now < expiry) {
        return process.env.ACCESS_TOKEN;
    }

    const authBody = {
        email: process.env.EMAIL,
        name: process.env.NAME,
        rollNo: process.env.ROLL_NO,
        accessCode: process.env.ACCESS_CODE,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    };

    const response = await axios.post('http://4.224.186.213/evaluation-service/auth', authBody);
    const { access_token, expires_in } = response.data;

    let envContent = '';
    if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
    }

    const envLines = envContent.split('\n').filter(line =>
        !line.startsWith('ACCESS_TOKEN=') &&
        !line.startsWith('TOKEN_EXPIRY=') &&
        line.trim() !== ''
    );

    envLines.push(`ACCESS_TOKEN=${access_token}`);
    envLines.push(`TOKEN_EXPIRY=${expires_in}`);

    fs.writeFileSync(envPath, envLines.join('\n') + '\n');

    process.env.ACCESS_TOKEN = access_token;
    process.env.TOKEN_EXPIRY = expires_in;

    return access_token;
}

async function Log(stack, level, pkg, message) {
    const token = await getValidToken();
    const response = await axios.post(
        'http://4.224.186.213/evaluation-service/logs',
        {
            stack: stack.toLowerCase(),
            level: level.toLowerCase(),
            package: pkg.toLowerCase(),
            message: message
        },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.data;
}

module.exports = Log;