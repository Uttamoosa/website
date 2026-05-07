import express from "express";
import userRouter from "./user/router.js";

const app = express();
const port = 3000;
const hostname = "127.0.0.1";

app.use(express.json());

app.use("/user", userRouter);

app.listen(port, hostname, () => {
	console.log(`Listening on port ${port}`);
});
