import express from "express";
import "dotenv/config.js";
import cors from "cors";
import routeTest from "./routes/routeTest.js";
import routeAuth from "./routes/routeAuth.js";
import routeUser from "./routes/routeUser.js";
import routeProgress from "./routes/routeProgress.js";
import routeExport from "./routes/routeExport.js";
import routeMerchantService from "./routes/routeMerchantService.js";
import {writeLog} from "./utils/Logger.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/server-side/api/test", routeTest);
app.use("/server-side/api/auth", routeAuth);
app.use("/server-side/api/users", routeUser);
app.use("/server-side/api/progress", routeProgress);
app.use("/server-side/api/export", routeExport);
app.use("/server-side/api/merchant-detail", routeMerchantService);
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});


app.listen(PORT, () => {
    writeLog("Server running on port: " + PORT);
});


