import { findUserByUsername } from "./model.js";
import pool from "../util/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mysql from "mysql2";
import "dotenv/config";

const signin = async (req, res) => {
	const user = await findUserByUsername(req.body.username);

	if (user) {
		return res.status(409).send("Username taken");
	}

	bcrypt.hash(req.body.password, 10, function (err, hash) {
		pool.execute("INSERT INTO user (username, password) VALUES (?, ?)", [
			req.body.username,
			hash,
		]);
	});
};

const getme = async (req, res) => {
	console.log("getMe", res.locals.user);
	if (res.locals.user) {
		res.json({ message: "token ok", user: res.locals.user });
	} else {
		res.sendStatus(401);
	}
};

const login = async (req, res) => {
	console.log("postLogin", req.body);
	const user = await findUserByUsername(req.body.username);
	if (!user) {
		res.sendStatus(401);
		return;
	}

	console.log(user);
	const passwordMatch = await bcrypt.compare(
		req.body.password,
		user.password,
	);

	if (!passwordMatch) {
		res.sendStatus(401);
		return;
	}

	const userWithNoPassword = {
		user_id: user.user_id,
		name: user.name,
		username: user.username,
		email: user.email,
		role: user.role,
	};

	const token = jwt.sign(userWithNoPassword, process.env.JWT_SECRET, {
		expiresIn: "24h", // token expiration time, e.g. 24 hours, can be configured in .env too
	});
	res.json({ user: userWithNoPassword, token });
};

export { signin, getme, login };
