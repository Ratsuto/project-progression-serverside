import fs from 'fs';
import path from 'path';

// Define where logs will be saved
const LOG_DIR = path.join(process.cwd(), 'logs');
const LOG_FILE = path.join(LOG_DIR, 'access_log.txt');

// Helper function to write to file
export const writeLog = (message) => {
	const timestamp = new Date().toLocaleString('sv-SE', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	}).replace(',', '');
	const logMessage = `[${timestamp}] ${message}\n`;

	// 1. Create folder if it doesn't exist
	if (!fs.existsSync(LOG_DIR)) {
		fs.mkdirSync(LOG_DIR, {recursive: true});
	}

	// 2. Append to file (and show in console)
	fs.appendFile(LOG_FILE, logMessage, (err) => {
		if (err) console.error("Failed to write to log file:", err);
	});

	// Optional: Keep console log for real-time debugging
	console.log(logMessage.trim());
};
