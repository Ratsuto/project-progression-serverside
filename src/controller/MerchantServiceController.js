import {getConnection} from "../config/dbconfig.js";
import oracledb from "oracledb";

export const getIsServiceSuspended = async (req, res) => {
    try {
        const {merchantId, merchantName} = req.body;
        const conn = await getConnection();

        const result = await conn.execute(
            `SELECT IS_SERVICES_SUSPENDED, MERCHANTID, MERCHANTNAME
             FROM BR_MERCHANT_DETAILS
             WHERE MERCHANTID = :merchantId
               AND MERCHANTNAME = :merchantName`,
            {merchantId, merchantName},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        return res.status(200).json({
            success: true,
            data: result.rows,
        });
    } catch (err) {
        console.error("Error Exception:", err);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
            error: err.message,
        });
    }
}
