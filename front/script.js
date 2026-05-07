const http = (type, url, body, callback) => {
	try {
		const xml = new XMLHttpRequest();
		xml.onreadystatechange = () => {
			if (xml.readyState == 4 && xml.status == 200) {
				callback(xml.responseText);
			}
		};
		xml.open(type, url, true);
		xml.send(body);
	} catch (err) {
		console.error(err);
	}
};

const baseUrl = "https://media2.edu.metropolia.fi/restaurant";
const restaurant = "/api/v1/restaurants";

const dialog = document.getElementById("restaurant-dialog");
const dialogName = document.getElementById("name");
const dialogAddress = document.getElementById("address");
const dialogPostalCode = document.getElementById("pcode");
const dialogPhone = document.getElementById("phone");
const menuList = document.getElementById("menu-list");
const dailyBtn = document.getElementById("daily-btn");
const weeklyBtn = document.getElementById("weekly-btn");

let currentRestaurantId = null;

const loadMenu = (restaurantId, menuType) => {
	const endpoint = `/api/v1/restaurants/${menuType}/${restaurantId}/fi`;

	http("GET", baseUrl + endpoint, null, (res) => {
		const data = JSON.parse(res);
		menuList.innerHTML = "";
		console.log(res);

		if (menuType === "daily") {
			if (data.courses && data.courses.length > 0) {
				data.courses.forEach((course) => {
					const menuItem = document.createElement("div");
					menuItem.className = "menu-item";

					const name = document.createElement("h4");
					name.textContent = course.name || "Menu";

					const price = document.createElement("p");
					price.textContent = course.price || "";

					const diets = document.createElement("p");
					diets.textContent = `Diets: ${course.diets || ""}`;
					diets.style.fontSize = "0.9em";
					diets.style.color = "#666";

					menuItem.appendChild(name);
					menuItem.appendChild(price);
					menuItem.appendChild(diets);
					menuList.appendChild(menuItem);
				});
			} else {
				const noFood = document.createElement("p");
				noFood.textContent = "No food :(";
				noFood.style.textAlign = "center";
				noFood.style.padding = "1rem";
				menuList.appendChild(noFood);
			}
		} else if (menuType === "weekly") {
			if (data.days && data.days.length > 0) {
				data.days.forEach((day) => {
					const dayHeader = document.createElement("h5");
					dayHeader.textContent = day.date;
					dayHeader.style.marginTop = "1rem";
					dayHeader.style.fontSize = "1.3em";
					dayHeader.style.fontWeight = "bold";
					menuList.appendChild(dayHeader);

					if (day.courses && day.courses.length > 0) {
						day.courses.forEach((course) => {
							const menuItem = document.createElement("div");
							menuItem.className = "menu-item";

							const name = document.createElement("p");
							name.textContent = course.name || "Menu";

							const price = document.createElement("p");
							price.textContent = course.price || "";

							const diets = document.createElement("p");
							diets.textContent = `Diets: ${course.diets || ""}`;
							diets.style.fontSize = "0.9em";
							diets.style.color = "#666";

							menuItem.appendChild(name);
							menuItem.appendChild(price);
							menuItem.appendChild(diets);
							menuList.appendChild(menuItem);
						});
					}
				});
			} else {
				const noFood = document.createElement("p");
				noFood.textContent = "No food :(";
				noFood.style.textAlign = "center";
				noFood.style.padding = "1rem";
				menuList.appendChild(noFood);
			}
		}
	});
};

dailyBtn.addEventListener("click", () => {
	dailyBtn.style.fontWeight = "bold";
	weeklyBtn.style.fontWeight = "normal";
	loadMenu(currentRestaurantId, "daily");
});

weeklyBtn.addEventListener("click", () => {
	weeklyBtn.style.fontWeight = "bold";
	dailyBtn.style.fontWeight = "normal";
	loadMenu(currentRestaurantId, "weekly");
});

http("GET", baseUrl + restaurant, null, (res) => {
	try {
		const data = JSON.parse(res);
		const container = document.getElementById("ravintolat");

		data.forEach((item) => {
			const box = document.createElement("div");
			box.className = "box";

			const title = document.createElement("h3");
			title.textContent = item.name;

			const p = document.createElement("p");
			p.textContent = item.address;

			box.appendChild(title);
			box.appendChild(p);
			container.appendChild(box);

			box.addEventListener("click", () => {
				currentRestaurantId = item._id;
				dialogName.textContent = item.name;
				dialogAddress.textContent = `Osoite: ${item.address || "Ei osoitetta"}`;
				dialogPostalCode.textContent = `Postinumero: ${item.postalCode || "Ei osoitetta"}`;
				dialogPhone.textContent = `Puhelin: ${item.phone || "Ei puhelinta"}`;

				dailyBtn.style.fontWeight = "bold";
				weeklyBtn.style.fontWeight = "normal";
				loadMenu(item._id, "daily");

				dialog.showModal();
			});
		});
	} catch (err) {
		console.error(err);
	}
});
