import pool from "../util/database.js";

const findUserByUsername = async (username) => {
	if (username == null) {
		return null;
	}
	const [result] = await pool.execute(
		"SELECT * FROM user WHERE username = ?",
		[username],
	);

	if (result.length == 0) {
		return null;
	}

	return result[0];
};

export { findUserByUsername };
