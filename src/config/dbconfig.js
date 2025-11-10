import oracledb from 'oracledb';
import 'dotenv/config';

let connection;

export async function getConnection() {
    if (connection) return connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.ORACLE_USER,
            password: process.env.ORACLE_PASSWORD,
            connectString: process.env.ORACLE_CONNECT_STRING,
        });
        console.log("✅ Connected to Oracle Database");
        return connection;
    } catch (err) {
        console.error("❌ Oracle connection failed:", err);
        throw err;
    }
}
