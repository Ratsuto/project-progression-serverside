import {getConnection} from "../config/dbconfig.js";
import oracledb from "oracledb";


function toDate(val) {
    return val ? new Date(val) : null;
}

export const addNewProgress = async (req, res) => {
    try {
        const {projectCode, projectName, projectCate, projectType, projectStatus, projectNote, planDevStart, planDevEnd, planLive, actualDevStart, actualDevEnd, actualLive, progressDEV, progressSIT, progressUAT, progressPILOT, progressStatus, lastProgress, increase, thisProgress, operatorID} = req.body;
        const conn = await getConnection();

        if (projectCode === '' || projectName === '' || projectCate === '' || projectType === '' || projectStatus === '') {
            return res.status(400).json({
                success: false,
                message: "Each field must not be empty.",
            });
        }

        const checkDuplicate = await conn.execute(
            `SELECT *
             FROM MG_UPDATE_PROGRESS
             WHERE PROJECT_CODE = :projectCode`,
            {projectCode},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        if (checkDuplicate.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Project ID already exists.",
            });
        }


        const result = await conn.execute(`
                    INSERT INTO MG_UPDATE_PROGRESS
                    (PROJECT_CODE, PROJECT_NAME, PROJECT_CATEGORY, PROJECT_TYPE, PROJECT_STATUS, PROJECT_NOTE, PLAN_DEV_START, PLAN_DEV_END, PLAN_LIVE, ACTUAL_DEV_START, ACTUAL_DEV_END, ACTUAL_LIVE, PROGRESS_DEV, PROGRESS_SIT, PROGRESS_UAT, PROGRESS_PILOT, PROGRESS_STATUS, PROGRESS_INCREASE, LAST_PROGRESS, THIS_PROGRESS, OPERATOR_ID, LAST_UPDATED_DATE)
                    VALUES (:projectCode, :projectName, :projectCate, :projectType, :projectStatus, :projectNote, :planDevStart, :planDevEnd, :planLive, :actualDevStart, :actualDevEnd, :actualLive, :progressDEV, :progressSIT, :progressUAT, :progressPILOT, :progressStatus, :increase, :lastProgress, :thisProgress, :operatorID, SYSDATE)`,
            {
                projectCode,
                projectName,
                projectCate,
                projectType,
                projectStatus,
                projectNote,
                planDevStart: toDate(planDevStart),
                planDevEnd: toDate(planDevEnd),
                planLive: toDate(planLive),
                actualDevStart: toDate(actualDevStart),
                actualDevEnd: toDate(actualDevEnd),
                actualLive: toDate(actualLive),
                progressDEV,
                progressSIT,
                progressUAT,
                progressPILOT,
                progressStatus,
                increase,
                lastProgress,
                thisProgress,
                operatorID
            },
            {autoCommit: true}
        );

        if (result.rowsAffected && result.rowsAffected > 0) {
            return res.status(200).json({
                success: true,
                message: "Submit Progress successful",
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Failed to submit. No rows affected.",
            });
        }

    } catch (err) {
        console.error("Error Exception:", err);

        if (err.errorNum === 1) {
            return res.status(409).json({
                success: false,
                message: "Project ID already exists.",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
            error: err.message,
        });
    }
}

export const listProgress = async (req, res) => {
    try {
        const {operatorID} = req.body;
        const conn = await getConnection();

        const result = await conn.execute(
            `SELECT MUP.*, MP.OPERATOR_NAME
             FROM MG_UPDATE_PROGRESS MUP
                      LEFT JOIN MG_OPERATORS MP ON MP.OPERATOR_ID = MUP.OPERATOR_ID
             WHERE (:operatorID IS NULL OR MUP.OPERATOR_ID = :operatorID)
             ORDER BY MUP.PROJECT_CATEGORY DESC, MUP.LAST_UPDATED_DATE DESC`,
            {operatorID},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        return res.status(200).json({
            success: true,
            progress: result.rows,
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

export const updateProgress = async (req, res) => {
    try {
        const {Id, projectCode, projectName, projectCate, projectType, projectStatus, projectNote, planDevStart, planDevEnd, planLive, actualDevStart, actualDevEnd, actualLive, progressDEV, progressSIT, progressUAT, progressPILOT, progressStatus, increase, lastProgress, thisProgress, operatorID} = req.body;
        const conn = await getConnection();

        const result = await conn.execute(`
                    UPDATE MG_UPDATE_PROGRESS
                    SET PROJECT_CODE=:projectCode,
                        PROJECT_NAME=:projectName,
                        PROJECT_CATEGORY=:projectCate,
                        PROJECT_TYPE=:projectType,
                        PROJECT_STATUS=:projectStatus,
                        PROJECT_NOTE=:projectNote,
                        PLAN_DEV_START=:planDevStart,
                        PLAN_DEV_END=:planDevEnd,
                        PLAN_LIVE=:planLive,
                        ACTUAL_DEV_START=:actualDevStart,
                        ACTUAL_DEV_END=:actualDevEnd,
                        ACTUAL_LIVE=:actualLive,
                        PROGRESS_DEV=:progressDEV,
                        PROGRESS_SIT=:progressSIT,
                        PROGRESS_UAT=:progressUAT,
                        PROGRESS_PILOT=:progressPILOT,
                        PROGRESS_STATUS=:progressStatus,
                        PROGRESS_INCREASE=:increase,
                        LAST_PROGRESS=:lastProgress,
                        THIS_PROGRESS=:thisProgress,
                        OPERATOR_ID=:operatorID,
                        LAST_UPDATED_DATE=SYSDATE
                    WHERE OPERATOR_ID = :operatorID
                      AND ID = :Id`,
            {
                Id,
                projectCode,
                projectName,
                projectCate,
                projectType,
                projectStatus,
                projectNote,
                planDevStart: toDate(planDevStart),
                planDevEnd: toDate(planDevEnd),
                planLive: toDate(planLive),
                actualDevStart: toDate(actualDevStart),
                actualDevEnd: toDate(actualDevEnd),
                actualLive: toDate(actualLive),
                progressDEV,
                progressSIT,
                progressUAT,
                progressPILOT,
                progressStatus,
                increase,
                lastProgress,
                thisProgress,
                operatorID
            },
            {autoCommit: true}
        );

        if (result.rowsAffected && result.rowsAffected > 0) {
            return res.status(200).json({
                success: true,
                message: "Update Progress successful",
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Failed to update. No rows affected.",
            });
        }

    } catch (err) {
        console.error("Error Exception:", err);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
            error: err.message,
        });
    }
}

export const removeProgress = async (req, res) => {
    try {
        const {Id, operatorID} = req.body;
        const conn = await getConnection();

        const result = await conn.execute(
            `DELETE
             FROM MG_UPDATE_PROGRESS
             WHERE OPERATOR_ID = :operatorID
               AND ID = :Id`,
            {
                Id,
                operatorID
            },
            {autoCommit: true}
        );

        if (result.rowsAffected && result.rowsAffected > 0) {
            return res.status(200).json({
                success: true,
                message: "Delete successful",
            });
        } else {
            return res.status(500).json({
                success: false,
                message: "Failed to remove. No rows affected.",
            });
        }

    } catch (err) {
        console.error("Error Exception:", err);
        return res.status(500).json({
            success: false,
            message: "Server error. Please try again later.",
            error: err.message,
        });
    }
}

export const countAllProgress = async (req, res) => {
    try {
        const {operatorID} = req.body;
        const conn = await getConnection();

        const result = await conn.execute(
            `SELECT COUNT(*) AS TOTAL
             FROM MG_UPDATE_PROGRESS
             WHERE OPERATOR_ID = :operatorID`,
            {operatorID},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        return res.status(200).json({
            success: true,
            count: result.rows[0]?.TOTAL || 0,
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

export const countFinishedProgress = async (req, res) => {
    try {
        const {operatorID} = req.body;
        const conn = await getConnection();

        const result = await conn.execute(
            `SELECT COUNT(*) AS TOTAL
             FROM MG_UPDATE_PROGRESS
             WHERE OPERATOR_ID = :operatorID
               AND LOWER(PROGRESS_STATUS) = LOWER('Lived')`,
            {operatorID},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        return res.status(200).json({
            success: true,
            count: result.rows[0]?.TOTAL || 0,
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

export const countUnfinishedProgress = async (req, res) => {
    try {
        const {operatorID} = req.body;
        const conn = await getConnection();

        const result = await conn.execute(
            `SELECT COUNT(*) AS TOTAL
             FROM MG_UPDATE_PROGRESS
             WHERE OPERATOR_ID = :operatorID
               AND LOWER(PROGRESS_STATUS) != LOWER('Lived')`,
            {operatorID},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        return res.status(200).json({
            success: true,
            count: result.rows[0]?.TOTAL || 0,
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

export const countProgressByMonth = async (req, res) => {
    try {
        const {operatorID} = req.body;
        const conn = await getConnection();

        const result = await conn.execute(
            `SELECT COUNT(*)                              AS TOTAL,
                    TO_CHAR(LAST_UPDATED_DATE, 'YYYY-MM') AS LAST_UPDATED_DATE,
                    PROGRESS_STATUS
             FROM MG_UPDATE_PROGRESS
             WHERE OPERATOR_ID = :operatorID
             GROUP BY TO_CHAR(LAST_UPDATED_DATE, 'YYYY-MM'), PROGRESS_STATUS`,
            {operatorID},
            {outFormat: oracledb.OUT_FORMAT_OBJECT}
        );

        return res.status(200).json({
            success: true,
            count: result.rows,
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