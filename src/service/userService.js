import {writeLog} from "../utils/Logger.js";
import {decryptPayload, protectData} from "../utils/Encryption.js";
import {getConnection} from "../config/dbconfig.js";
import oracledb from "oracledb";
import jwt from "jsonwebtoken";
import {respond} from "../utils/Response.js";
import sharp from "sharp";
import {baseAuthRequest} from "../utils/BaseRequest.js";

const JWT_SECRET = process.env.JWT_SECRET || "4523E1F338F493237D9E38EB718B5A46";

export const userService = {

	async getLoginDetail(res, encryptedData) {
		writeLog(`[SERVICE] Processing login detail`);
		try {
			const {username, password, baseRequest} = decryptPayload(encryptedData);
			writeLog(`[REQ PARAM] Username: ${username}`);
			writeLog(`[REQ PARAM] Password: ${password}`);
			writeLog(`[REQ PARAM] Base Request: ${JSON.stringify(baseRequest)}`);

			baseAuthRequest.username = username;
			baseAuthRequest.password = password;

			if (!username || !password) {
				writeLog('[VALIDATION] Username and password are required.');
				return respond.error(res, 401, 'Username and password are required.', false);
			}

			const protectPassword = protectData(password);
			const conn = await getConnection();

			const result = await conn.execute(
				`SELECT *
                 FROM MG_OPERATORS
                 WHERE OPERATOR_ID = :username
                   AND OPERATOR_PASSWORD = :protectPassword`,
				{
					username,
					protectPassword
				},
				{outFormat: oracledb.OUT_FORMAT_OBJECT}
			);

			if (!result.rows || result.rows.length === 0) {
				writeLog('[VALIDATION] Invalid username or password.');
				return respond.error(res, 401, 'Invalid username or password.', false);
			}

			const user = result.rows[0];
			const basicRequest = JSON.parse(user.BASIC_REQUEST);
			const invalid = ['basicAuth', 'basicAuthPass', 'username', 'password'].some(key => basicRequest[key] !== baseAuthRequest[key]);

			if (invalid) {
				writeLog(`[VALIDATION] Invalid request: ${JSON.stringify(basicRequest)}`);
				return respond.error(res, 403, 'Invalid request. Please try again.', false);
			}

			// Generate JWT token
			const token = jwt.sign(
				{id: user.OPERATOR_ID, username: user.OPERATOR_NAME, baseRequest: basicRequest, date: new Date()},
				JWT_SECRET,
				{expiresIn: "2h"}
			);
			writeLog(`[TOKEN] JWT Token: ${token}`);

			const sessionId = jwt.sign(new Date().toLocaleTimeString(), JWT_SECRET);
			const loginTime = new Date();
			const loginStatus = 'SIGN IN';

			//update session
			const updateSession = await conn.execute(
				`UPDATE MG_OPERATORS
                 SET SESSION_ID   = :sessionId,
                     LOGIN_TIME   = :loginTime,
                     LOGIN_STATUS = :loginStatus
                 WHERE OPERATOR_ID = :username
                   AND OPERATOR_PASSWORD = :protectPassword`,
				{
					sessionId,
					loginTime,
					loginStatus,
					username,
					protectPassword
				},
				{autoCommit: true}
			);

			if (updateSession.rowsAffected && updateSession.rowsAffected > 0) {
				writeLog(`[UPDATE] Session ID: ${sessionId}`);
				writeLog('[UPDATE] Update session completed');
			} else {
				writeLog('[UPDATE] Update session failed');
			}

			const respData = {
				token,
				sessionId
			}

			writeLog('[RESULT] Login successful');
			return respond.success(res, 200, 'Login successful', true, respData);
		} catch (err) {
			writeLog(`[ERROR] ❌ Login Exception: ${err.message}`);
			respond.error(res, 401, `${err.message}`, false);
		} finally {
			writeLog(`[SERVICE] Processing login detail End`);
		}
	},

	async registerUser(res, image, encryptedData) {
		writeLog(`[SERVICE] Processing register user`);

		try {
			let {operatorId, operatorName, operatorPass, operatorEmail, roleId, baseRequest} = decryptPayload(encryptedData);
			const file = image;  //multer stores the uploaded file here

			writeLog(`[REQ PARAM] Operator ID:  ${operatorId}`);
			writeLog(`[REQ PARAM] Operator Name:  ${operatorName}`);
			writeLog(`[REQ PARAM] Operator Password:  ${operatorPass}`);
			writeLog(`[REQ PARAM] Operator Email:  ${operatorEmail}`);
			writeLog(`[REQ PARAM] Operator Role ID:  ${roleId}`);
			writeLog(`[REQ PARAM] Base Request:  ${JSON.stringify(baseRequest)}`);

			if (operatorId.slice(0, 3).toUpperCase() !== 'ABC') {
				operatorId = 'ABC' + operatorId;
			}

			if (!operatorId || !operatorPass) {
				writeLog('[VALIDATION] User did not fill userID and password.');
				return respond.error(res, 403, 'Please fill userID and password', false);
			}

			if (!roleId) {
				writeLog('[VALIDATION] User did not select role.');
				return respond.error(res, 403, 'Please select a role', false);
			}

			const protectPassword = protectData(operatorPass);
			const conn = await getConnection();

			//If user uploaded a file, store it's buffer as BLOB
			const imageBuffer = file ? file.buffer : null;
			const convertWebp = imageBuffer != null ? await sharp(imageBuffer).webp({quality: 80, lossless: false, effort: 4}).toBuffer() : null;

			const result = await conn.execute(
				`INSERT INTO MG_OPERATORS
                 (OPERATOR_ID, OPERATOR_NAME, OPERATOR_PASSWORD, OPERATOR_EMAIL, OPERATOR_IMAGE, ROLE_ID, LAST_UPDATED_DATE, BASIC_REQUEST)
                 VALUES (:operatorId, :operatorName, :protectPassword, :operatorEmail, :operatorImage, :roleId, SYSDATE, :baseRequest)`,
				{
					operatorId,
					operatorName,
					protectPassword,
					operatorEmail,
					operatorImage: convertWebp,
					roleId,
					baseRequest: JSON.stringify(baseRequest)
				},
				{autoCommit: true}
			);

			if (result.rowsAffected && result.rowsAffected > 0) {
				writeLog('[RESULT] Register successful');
				return respond.success(res, 200, 'Register successful', true);
			} else {
				writeLog('[RESULT] Register failed. No rows affected.');
				return respond.error(res, 403, 'Register failed.', false);
			}
		} catch (err) {
			if (err.errorNum === 1) {
				writeLog('[CANCEL] User ID already exists.');
				return respond.error(res, 409, 'User already exists.', false);
			}

			writeLog(`[ERROR] Exception: ${err.message}.`);
			respond.error(res, 500, `Server error: ${err.message}`, false);
		} finally {
			writeLog(`[SERVICE] Processing register user End`);
		}
	}
}