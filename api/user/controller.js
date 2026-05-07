import { findUserByUsername } from "./model.js";
import pool from "../util/database.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mysql from "mysql2";
import "dotenv/config";

const signin = async (req, res) => {
	try {
		const user = await findUserByUsername(req.body.username);
		console.log(user);
		if (user) {
			return res.status(409).send("Username taken");
		}

		bcrypt.hash(req.body.password, 10, function (err, hash) {
			pool.execute(
				"INSERT INTO user (username, password) VALUES (?, ?)",
				[req.body.username, hash],
			);
		});
		res.status(200).send("User registered");
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
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
	try {
		const user = await findUserByUsername(req.body.username);
		if (!user) {
			res.sendStatus(401);
			return;
		}

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
			username: user.username,
		};

		const token = jwt.sign(userWithNoPassword, process.env.JWT_SECRET, {
			expiresIn: "24h", // token expiration time, e.g. 24 hours, can be configured in .env too
		});
		res.status(200).json({ user: userWithNoPassword, token });
	} catch (err) {
		console.error(err);
		res.status(500).json(err);
	}
};

export { signin, getme, login };
