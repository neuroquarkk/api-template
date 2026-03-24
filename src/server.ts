import app from './app';
import { config } from './config';
import { checkConn } from './db';

async function main() {
    try {
        await checkConn();
        app.listen(config.PORT, () => {
            console.log(`Server started on ${config.PORT}`);
        });
    } catch (error) {
        process.exit(1);
    }
}

main();
