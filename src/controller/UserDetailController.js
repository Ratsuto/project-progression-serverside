import {getConnection} from "../config/dbconfig.js";
import oracledb from "oracledb";

export const getUserDetail = async (req, res) => {
    try {

        const conn = await getConnection();
        const {username} = req.body;

        if (!username) {
            return res.json({
                success: false,
                message: "Username is required",
            });
        }

        const result = await conn.execute(
            `SELECT OP.*, R.ROLE_NAME, R.ROLE_TYPE
             FROM MG_OPERATORS OP
                      LEFT JOIN MG_ROLES R ON R.ROLE_ID = OP.ROLE_ID
             WHERE OP.OPERATOR_ID = :username`,
            {username},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        if (!result.rows || result.rows.length === 0) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        const row = result.rows[0];

        // If OPERATOR_IMAGE is a LOB, we need to read it
        if (row.OPERATOR_IMAGE) {
            row.OPERATOR_IMAGE = await readLobToBase64(row.OPERATOR_IMAGE);
        }

        return res.json({
            success: true,
            data: row,
        });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

function readLobToBase64(lob) {
    return new Promise((resolve, reject) => {
        let chunks = [];

        lob.setEncoding("base64"); // encode as base64

        lob.on("data", chunk => chunks.push(chunk));
        lob.on("end", () => resolve(chunks.join("")));
        lob.on("error", err => reject(err));
    });
}

export const getRoleDetail = async (req, res) => {
    try {
        const conn = await getConnection();
        const result = await conn.execute(
            `SELECT *
             FROM MG_ROLES`,
            [],
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        const row = result.rows;
        return res.json({
            success: true,
            operator: row,
        });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({success: false, message: "Internal server error"});
    }
}

