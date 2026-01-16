import {writeLog} from "../utils/Logger.js";
import {userService} from "../service/userService.js";
import {respond} from "../utils/Response.js";

export const registerUserDetail = async (req, res) => {
    writeLog(`==========[ registerUserDetail START ]==========`);
    try {
        const {encryptedData} = req.body;
        const file = req.file;
        writeLog(`[REQUEST] Param Sent to service: ${JSON.stringify(encryptedData)}`);

        if (!encryptedData) {
            writeLog(`[REQUEST] Missing encrypted Data`);
            return respond.error(res, 400, 'Missing encrypted Data', false);
        }

        return await userService.registerUser(res, file, encryptedData);
    } catch (err) {
        respond.error(res, 409, 'Register Failed.');
        writeLog(`[ERROR] ❌ Register Exception: ${err.message}`);
    } finally {
        writeLog(`==========[ registerUserDetail END ]==========`);
    }
};

export const getLoginDetail = async (req, res) => {
    writeLog(`==========[ getLoginDetail START ]==========`);
    try {
        const {encryptedData} = req.body;
        writeLog(`[REQUEST] Param Sent to service: ${JSON.stringify(encryptedData)}`);

        if (!encryptedData) {
            writeLog(`[REQUEST] Missing encrypted Data`);
            return respond.error(res, 400, 'Missing encrypted Data', false);
        }
        return await userService.getLoginDetail(res, encryptedData);
    } catch (err) {
        respond.error(res, 401, 'Login Failed.');
        writeLog(`[ERROR] ❌ Login Exception: ${err.message}`);
    } finally {
        writeLog(`==========[ getLoginDetail END ]==========`);
    }
};