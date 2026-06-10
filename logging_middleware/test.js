const Log = require('./index');

async function runTest() {
    try {
        const result = await Log("backend", "info", "config", "Testing logging middleware");
        process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    } catch (error) {
        process.stderr.write((error.response?.data || error.message) + '\n');
    }
}

runTest();