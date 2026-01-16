import oracledb from 'oracledb';
import 'dotenv/config';
import {writeLog} from "../utils/Logger.js";

let connection;

export async function getConnection() {
	if (connection) return connection;

	try {
		connection = await oracledb.getConnection({
			user: process.env.ORACLE_USER,
			password: process.env.ORACLE_PASSWORD,
			connectString: process.env.ORACLE_CONNECT_STRING,
		});
		writeLog("✅ Connected to Oracle Database");
		return connection;
	} catch (err) {
		writeLog("❌ Oracle connection failed:", err);
		throw err;
	}
}
