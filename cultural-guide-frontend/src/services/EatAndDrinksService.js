// services/EatAndDrinksService.js
import defaultImage from "../images/ImageWithFallback.jpg";

export const fetchEatAndDrinks = async (municipality, language = "it") => {
    if (!municipality) {
        throw new Error("Municipality is required");
    }

    try {
        const response = await fetch(
            `http://localhost:5203/api/eppoiapi/eat-and-drinks?municipality=${encodeURIComponent(municipality)}&language=${encodeURIComponent(language)}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // let's read the body only once and overwrite data with mapping
        let data = await response.json().catch(() => []);

        // Transform backend data to the expected template
        data = data.map((eatAndDrinks) => ({
            id: eatAndDrinks.entityId,
            type: eatAndDrinks.badgeText,
            image: eatAndDrinks.imagePath
                ? `https://eppoi.io${eatAndDrinks.imagePath}`
                : defaultImage,
            title: eatAndDrinks.entityName,
            description: eatAndDrinks.badgeText || "",
            location: eatAndDrinks.address || "Unknown address",
            openingHours: "N/A",
        }));

        return data;
    } catch (err) {
        console.error(err);
        throw new Error("Network error while fetching eatAndDrinks");
    }
};