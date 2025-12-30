/*import * as XLSX from "xlsx";*/
/*import {getFlags} from "oracledb/lib/thin/sqlnet/ANO.js";*/

import ExcelJS from "exceljs";
import {getConnection} from "../config/dbconfig.js";

export const exportExcel = async (req, res) => {
    try {
        const {operatorID, date} = req.query; // from frontend query param
        const conn = await getConnection();

        const result = await conn.execute(`
                    SELECT MUP.ID,
                           MP.OPERATOR_ID,
                           MP.OPERATOR_NAME,
                           MUP.PROJECT_CATEGORY,
                           MUP.PROJECT_NAME,
                           MUP.PLAN_DEV_START,
                           MUP.PLAN_DEV_END,
                           MUP.PLAN_LIVE,
                           MUP.ACTUAL_DEV_START,
                           MUP.ACTUAL_DEV_END,
                           MUP.ACTUAL_LIVE,
                           MUP.LAST_PROGRESS,
                           MUP.THIS_PROGRESS,
                           MUP.PROGRESS_INCREASE,
                           MUP.PROGRESS_STATUS,
                           MUP.PROJECT_TYPE,
                           MUP.PROGRESS_DEV,
                           MUP.PROGRESS_SIT,
                           MUP.PROGRESS_UAT,
                           MUP.PROGRESS_PILOT,
                           MUP.PROJECT_NOTE,
                           MUP.PROJECT_CODE,
                           MUP.PROJECT_STATUS
                    FROM MG_UPDATE_PROGRESS MUP
                             LEFT JOIN MG_OPERATORS MP ON MP.OPERATOR_ID = MUP.OPERATOR_ID
                    WHERE MUP.OPERATOR_ID = :operatorID
                      AND TRUNC(MUP.LAST_UPDATED_DATE) = TO_DATE(:filterDate, 'YYYY-MM-DD')
                    ORDER BY MUP.PROJECT_CATEGORY, MUP.LAST_UPDATED_DATE DESC`,
            {
                operatorID,
                filterDate: date
            }
        );

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No data for download',
            })
        }

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("ProgressData");

        // ✅ Define columns and headers
        worksheet.columns = [
            {header: "Team", key: "Team", width: 6},
            {header: "Nº", key: "ID", width: 6},
            {header: "Staff ID", key: "OPERATOR_ID", width: 15},
            {header: "Developer", key: "OPERATOR_NAME", width: 30},
            {header: "Project Cate", key: "PROJECT_CATEGORY", width: 15},
            {header: "Project Name", key: "PROJECT_NAME", width: 60},
            {header: "Dev\n Start Date", key: "PLAN_DEV_START", width: 15},
            {header: "Dev\n End Date", key: "PLAN_DEV_END", width: 15},
            {header: "Expected\n Go-live Date", key: "PLAN_LIVE", width: 15},
            {header: "Manday", key: "PLAN_MANDAY", width: 10},
            {header: "Dev\n Start Date", key: "ACTUAL_DEV_START", width: 15},
            {header: "Dev\n End Date", key: "ACTUAL_DEV_END", width: 15},
            {header: "Go-live Date", key: "ACTUAL_LIVE", width: 15},
            {header: "Manday", key: "ACTUAL_MANDAY", width: 10},
            {header: "Progress\n Last Month", key: "LAST_PROGRESS", width: 15},
            {header: "Progress\n This Month", key: "THIS_PROGRESS", width: 15},
            {header: "%\n Increased", key: "PROGRESS_INCREASE", width: 15},
            {header: "Status", key: "PROGRESS_STATUS", width: 15},
            {header: "Is Project", key: "PROJECT_TYPE", width: 15},
            {header: "Dev", key: "PROGRESS_DEV", width: 7},
            {header: "SIT", key: "PROGRESS_SIT", width: 7},
            {header: "UAT", key: "PROGRESS_UAT", width: 7},
            {header: "Pilot", key: "PROGRESS_PILOT", width: 7},
            {header: "Note", key: "PROJECT_NOTE", width: 35},
            {header: "Project Code", key: "PROJECT_CODE", width: 20},
            {header: "Project Status", key: "PROJECT_STATUS", width: 15},
        ];

        // ✅ Add rows
        result.rows.forEach((row, index) => {
            const planStartDate = new Date(row[5]);
            const planEndDate = new Date(row[7] || row[6]);
            const actualStartDate = new Date(row[8]);
            const actualEndDate = new Date(row[9] || row[10]);

            const planDiffDays = Math.round(
                (planEndDate - planStartDate) / (1000 * 60 * 60 * 24)
            );

            const actualDiffDays = Math.round(
                (actualEndDate - actualStartDate) / (1000 * 60 * 60 * 24)
            );


            worksheet.addRow({
                Team: "",
                ID: row[0],
                OPERATOR_ID: row[1].substring(3),
                OPERATOR_NAME: row[2],
                PROJECT_CATEGORY: row[3],
                PROJECT_NAME: row[4],
                PLAN_DEV_START: row[5] || '',
                PLAN_DEV_END: row[6] || '',
                PLAN_LIVE: row[7] || '',
                PLAN_MANDAY: planDiffDays < 0 ? 0 : planDiffDays,
                ACTUAL_DEV_START: row[8] || '',
                ACTUAL_DEV_END: row[9] || '',
                ACTUAL_LIVE: row[10] || '',
                ACTUAL_MANDAY: actualDiffDays < 0 ? 0 : actualDiffDays,
                LAST_PROGRESS: row[11] / 100 || 0,
                THIS_PROGRESS: row[12] / 100 || 0,
                PROGRESS_INCREASE: row[13] / 100 || 0,
                PROGRESS_STATUS: row[14],
                PROJECT_TYPE: row[15],
                PROGRESS_DEV: row[16] / 100 || 0,
                PROGRESS_SIT: row[17] / 100 || 0,
                PROGRESS_UAT: row[18] / 100 || 0,
                PROGRESS_PILOT: row[19] / 100 || 0,
                PROJECT_NOTE: row[20],
                PROJECT_CODE: row[21],
                PROJECT_STATUS: row[22],
            });
        });

        // ✅ Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = {bold: true, color: {argb: "FFFFFFFF"}};
        headerRow.alignment = {vertical: "middle", horizontal: "center"};
        headerRow.height = 35;

        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: {argb: "4472C4"}, // nice blue
            };
            cell.alignment = {wrapText: true, vertical: "middle", horizontal: "center"};
            cell.border = {
                top: {style: "thin"},
                left: {style: "thin"},
                bottom: {style: "thin"},
                right: {style: "thin"},
            };
        });

        // ✅ Add borders and alignment for data rows
        worksheet.eachRow({includeEmpty: false}, (row, rowNumber) => {
            if (rowNumber === 1) return; // skip header
            row.alignment = {vertical: "middle", horizontal: "left"};
            row.eachCell((cell, colNumber) => {
                cell.alignment = {vertical: "middle", horizontal: "center"};

                cell.border = {
                    top: {style: "thin"},
                    left: {style: "thin"},
                    bottom: {style: "thin"},
                    right: {style: "thin"},
                };

                if ([1].includes(colNumber)) {
                    cell.border = {
                        left: {style: "thin"},
                        right: {style: "thin"},
                    };

                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {argb: "9BC2E6"},
                    }
                }

                if ([4, 6].includes(colNumber)) {
                    cell.alignment = {vertical: "middle", horizontal: "left"};
                }

                if ([15, 16].includes(colNumber)) {
                    cell.numFmt = '0%';
                    cell.alignment = {vertical: "middle", horizontal: "right"};
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {argb: "FFDBDBDB"},
                    };
                    cell.font = {
                        color: {argb: 'FF0000FF'},
                    };
                }

                if (colNumber === 17) {
                    cell.numFmt = '0%';
                    cell.alignment = {vertical: "middle", horizontal: "right"};
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {argb: "FFED7D31"},
                    };
                    cell.font = {
                        color: {argb: 'FFFFFF'},
                    };
                }

                if ([18, 20, 21, 22, 23].includes(colNumber)) {
                    cell.numFmt = '0%';
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: {argb: "FFFF99"},
                    };
                }

                if ([24, 25, 26].includes(colNumber)) {
                    if (![26].includes(colNumber)) {
                        cell.alignment = {vertical: "middle", horizontal: "left"};
                    }
                    cell.font = {
                        color: {argb: 'FF0000FF'},
                    };
                }
            });
        });

        // ✅ Write the Excel to buffer
        const buffer = await workbook.xlsx.writeBuffer();

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${operatorID.substring(3)} MDC Project Management - ${date}.xlsx`
        );
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.send(Buffer.from(buffer));
    } catch (err) {
        console.error("Excel export error:", err);
        res.status(500).json({error: "Failed to export Excel"});
    }
}