import {protectData} from "../utils/encryption.js";
import {getConnection} from "../config/dbconfig.js";
import oracledb from "oracledb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "4523E1F338F493237D9E38EB718B5A46";

export const registerUserDetail = async (req, res) => {
    try {
        const {operatorId, operatorName, operatorPass, operatorEmail, roleId} = req.body;
        const file = req.file; //multer stores the uploaded file here

        if (!operatorId || !operatorPass) {
            return res.status(403).json({
                success: false,
                message: "Please fill userID and password",
            });
        }

        if (!roleId) {
            return res.status(403).json({
                success: false,
                message: "Please select a role",
            });
        }

        const protectPassword = protectData(operatorPass);
        const conn = await getConnection();

        //If user uploaded a file, store its buffer as BLOB
        const imageBuffer = file ? file.buffer : null;

        const result = await conn.execute(
            `INSERT INTO MG_OPERATORS
                 (OPERATOR_ID, OPERATOR_NAME, OPERATOR_PASSWORD, OPERATOR_EMAIL, OPERATOR_IMAGE, ROLE_ID, LAST_UPDATED_DATE)
             VALUES (:operatorId, :operatorName, :protectPassword, :operatorEmail, :operatorImage, :roleId, SYSDATE)`,
            {
                operatorId,
                operatorName,
                protectPassword,
                operatorEmail,
                operatorImage: imageBuffer,
                roleId
            },
            {autoCommit: true}
        );

        if (result.rowsAffected && result.rowsAffected > 0) {
            return res.status(200).json({
                success: true,
                message: "Register successful",
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Register failed. No rows affected.",
            });
        }

    } catch (err) {
        console.error("Error Exception:", err);

        if (err.errorNum === 1) {
            return res.status(409).json({
                success: false,
                message: "User ID already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
            error: err.message,
        });
    }
};

export const getLoginDetail = async (req, res) => {
    try {
        const {username, password} = req.body;

        if (!username || !password) {
            return res.json({
                success: false,
                message: "Username and password are required.",
            });
        }

        const protectPassword = protectData(password);

        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT *
             FROM MG_OPERATORS
             WHERE OPERATOR_ID = :username
               AND OPERATOR_PASSWORD = :protectPassword`,
            {username, protectPassword},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        if (!result.rows || result.rows.length === 0) {
            // Use generic message to avoid username enumeration
            return res.json({
                success: false,
                message: "Invalid username or password.",
            });
        }

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            {id: user.OPERATOR_ID, username: user.OPERATOR_NAME},
            JWT_SECRET,
            {expiresIn: "2h"}
        );

        return res.json({
            success: true,
            message: "Login successful",
            token,
        });
    } catch (err) {
        console.error("❌ Login Exception:", err);
        res.json({
            success: false,
            message: "Server error. Please try again later.",
        });
    }
};