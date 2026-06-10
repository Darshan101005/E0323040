const Log = require('./index');

async function runTest() {
    try {
        const result = await Log("backend", "info", "config", "Testing dynamic token generation.");
        console.log(result);
    } catch (error) {
        console.error(error.response?.data || error.message);
    }
}

runTest();