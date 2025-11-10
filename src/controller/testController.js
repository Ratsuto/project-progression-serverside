import oracledb from "oracledb";
import {getConnection} from "../config/dbconfig.js";

export const getMerchantByValue = async (req, res) => {
    try {
        const {merchantId, merchantName} = req.body;

        if (!merchantId || !merchantName) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: merchantId and merchantName",
            });
        }

        const conn = await getConnection();

        const result = await conn.execute(
            `SELECT IS_SERVICES_SUSPENDED
             FROM BR_MERCHANT_DETAILS
             WHERE MERCHANTID = :merchantId
               AND MERCHANTNAME = :merchantName`,
            {merchantId, merchantName},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Merchant not found",
            });
        }

        let {IS_SERVICES_SUSPENDED} = result.rows[0];

        try {
            IS_SERVICES_SUSPENDED = JSON.parse(IS_SERVICES_SUSPENDED);
        } catch {
        }

        //const encryptedData = encrypt(JSON.stringify(IS_SERVICES_SUSPENDED));

        res.status(200).json({
            success: true,
            data: IS_SERVICES_SUSPENDED,
        });
    } catch (err) {
        console.error("❌ Error fetching merchant:", err);
        res.status(500).json({
            success: false,
            message: "Failed to fetch merchant",
        });
    }
};