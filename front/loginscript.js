const baseUrl = "https://media2.edu.metropolia.fi/restaurant";

const authForm = document.getElementById("auth-form");
const loginModeBtn = document.getElementById("login-mode");
const registerModeBtn = document.getElementById("register-mode");
const authSubmit = document.getElementById("auth-submit");
const message = document.getElementById("auth-message");
const availabilityMessage = document.getElementById("username-availability");
const confirmWrapper = document.getElementById("confirm-wrapper");
const emailWrapper = document.getElementById("email-wrapper");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirm-password");
const emailInput = document.getElementById("email");
const authHeaderLink = document.getElementById("auth-header-link");
const mainTitle = document.getElementById("maintext");
const mainSubtitle = document.querySelector(".main p");
const authCard = document.querySelector(".auth-card");
const userPanel = document.getElementById("user-panel");

let currentMode = "login";
let usernameAvailable = true;
let authToken = localStorage.getItem("authToken") || null;

const setMode = async (mode) => {
	currentMode = mode;
	loginModeBtn.classList.toggle("active", mode === "login");
	registerModeBtn.classList.toggle("active", mode === "register");
	authSubmit.textContent = mode === "login" ? "Login" : "Create account";
	emailWrapper.classList.toggle("hidden", mode !== "register");
	confirmWrapper.classList.toggle("hidden", mode !== "register");
	message.textContent = "";
	showAvailability("", "");
	usernameAvailable = mode !== "register";

	if (mode === "register" && usernameInput.value.trim()) {
		await checkUsernameAvailability();
	}
};

const setAuthToken = (token) => {
	authToken = token;
	if (token) {
		localStorage.setItem("authToken", token);
	} else {
		localStorage.removeItem("authToken");
	}
	setHeaderLinkText(!!token);
};

const setHeaderLinkText = (loggedIn) => {
	if (!authHeaderLink) return;
	authHeaderLink.textContent = loggedIn ? "Tiedot" : "Kirjaudu";
	authHeaderLink.href = "./login.html";
};

const getAuthTokenFromData = (data) => {
	if (!data) return null;
	if (typeof data === "string") return data;
	return data.token || data.accessToken || data.authToken || null;
};

const resetToAuthView = () => {
	setHeaderLinkText(false);
	mainTitle.textContent = "Login";
	mainSubtitle.textContent = "Kirjaudu sisään tai luo uusi tili.";
	authCard.classList.remove("hidden");
	userPanel.classList.add("hidden");
	setMode("login");
};

const renderUserView = async (user) => {
	setHeaderLinkText(true);
	mainTitle.textContent = "Omat tiedot";
	mainSubtitle.textContent = "Tässä ovat käyttäjätietosi.";
	authCard.classList.add("hidden");
	userPanel.classList.remove("hidden");

	let favoriteName = "Ei suosikkia";
	if (user.favouriteRestaurant) {
		favoriteName = await fetchRestaurantById(user.favouriteRestaurant);
	}

	userPanel.innerHTML = `
		<h3>${user.username || "Käyttäjä"}</h3>
		<p><strong>Email:</strong> ${user.email || "Ei sähköpostia"}</p>
		<p><strong>Role:</strong> ${user.role || "Ei roolia"}</p>
		<p><strong>Username:</strong> ${user.username || "--"}</p>
		<p><strong>ID:</strong> ${user._id || user.id || "--"}</p>
		<p><strong>Suosikkiravintola:</strong> ${favoriteName}</p>
		<button type="button" id="logout-btn" class="auth-submit">Kirjaudu ulos</button>
	`;
	const logoutBtn = document.getElementById("logout-btn");
	logoutBtn.addEventListener("click", () => {
		setAuthToken(null);
		resetToAuthView();
	});
};

const fetchUserData = async () => {
	if (!authToken) return null;
	try {
		const response = await fetch(`${baseUrl}/api/v1/users/token`, {
			headers: {
				Authorization: `Bearer ${authToken}`,
			},
		});
		if (!response.ok) {
			return null;
		}
		return await response.json();
	} catch {
		return null;
	}
};

const updateUser = async (updates) => {
	if (!authToken) return null;
	try {
		const response = await fetch(`${baseUrl}/api/v1/users`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${authToken}`,
			},
			body: JSON.stringify(updates),
		});
		if (!response.ok) {
			return null;
		}
		return await response.json();
	} catch {
		return null;
	}
};

const fetchRestaurantById = async (id) => {
	try {
		const response = await fetch(`${baseUrl}/api/v1/restaurants/${id}`);
		if (!response.ok) return "Unknown";
		const data = await response.json();
		return data.name || "Unknown";
	} catch {
		return "Unknown";
	}
};

const showLoggedInUser = async () => {
	const userData = await fetchUserData();
	if (userData) {
		await renderUserView(userData);
	} else {
		setAuthToken(null);
		resetToAuthView();
		showMessage("Session expired. Please log in again.", "error");
	}
};

const showMessage = (text, type = "error") => {
	message.textContent = text;
	message.className = `auth-message ${type}`;
};

const showAvailability = (text, type = "") => {
	availabilityMessage.textContent = text;
	availabilityMessage.className = `auth-message ${type}`;
};

const checkUsernameAvailability = async () => {
	if (currentMode !== "register") {
		return;
	}

	const username = usernameInput.value.trim();
	if (!username) {
		usernameAvailable = false;
		showAvailability("", "");
		return;
	}

	try {
		const response = await fetch(
			`${baseUrl}/api/v1/users/available/${encodeURIComponent(username)}`,
		);
		if (!response.ok) {
			usernameAvailable = false;
			showAvailability("Unable to check username.", "error");
			return;
		}

		const data = await response.json();

		if (data?.available) {
			usernameAvailable = true;
			showAvailability("Username is available.", "success");
		} else {
			usernameAvailable = false;
			showAvailability("Username is not available.", "error");
		}
	} catch (error) {
		usernameAvailable = false;
		showAvailability("Unable to check username.", "error");
	}
};

const postJson = async (url, payload) => {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	let data;
	try {
		data = await response.json();
	} catch {
		data = null;
	}

	return {
		ok: response.ok,
		status: response.status,
		data,
		statusText: response.statusText,
	};
};

const submitAuth = async (event) => {
	event.preventDefault();

	const username = usernameInput.value.trim();
	const password = passwordInput.value;
	const confirmPassword = confirmInput.value;

	if (!username || !password) {
		showMessage("Username and password are required.", "error");
		return;
	}

	let email = emailInput.value.trim();

	if (currentMode === "register") {
		if (!email) {
			showMessage("Email is required for account creation.", "error");
			return;
		}

		if (password !== confirmPassword) {
			showMessage("Passwords do not match.", "error");
			return;
		}

		await checkUsernameAvailability();
		if (!usernameAvailable) {
			showMessage("Choose a different username.", "error");
			return;
		}
	}

	showMessage("Sending request...", "");

	const payload = {
		username,
		password,
		...(currentMode === "register" ? { email } : {}),
	};

	const endpoint =
		currentMode === "login"
			? `${baseUrl}/api/v1/auth/login`
			: `${baseUrl}/api/v1/users`;

	const result = await postJson(endpoint, payload);
	if (result.ok) {
		const token = getAuthTokenFromData(result.data);
		if (token) {
			setAuthToken(token);
			await showLoggedInUser();
			return;
		}

		showMessage(
			currentMode === "login"
				? "Logged in successfully."
				: "Account created successfully.",
			"success",
		);
		if (currentMode === "login") {
			await showLoggedInUser();
		}
		return;
	}

	const errorText =
		result.data?.message || result.statusText || "Request failed.";
	showMessage(errorText, "error");
};

loginModeBtn.addEventListener("click", () => setMode("login"));
registerModeBtn.addEventListener("click", () => setMode("register"));
usernameInput.addEventListener("blur", checkUsernameAvailability);
authForm.addEventListener("submit", submitAuth);

if (authToken) {
	setHeaderLinkText(true);
	showLoggedInUser();
} else {
	setHeaderLinkText(false);
	setMode("login");
}
