import { readFile, writeFile } from "../fileHandler.js";
import { sendResponse, parseBody } from "../response.js";

const FILE_PATH = "heroes.json";
let newId = 0;

export async function getHeroes(req, res) {
    try {
        let heroes = await readFile(FILE_PATH);
        const {
            status,
            power,
            minLevel,
            maxLevel,
            search,
            sortBy,
            order = "desc",
            page = 1,
            limit = 20,
        } = req.query;

        if (status) {
            heroes = heroes.filter((h) => h.status === status);
        }

        if (power) {
            heroes = heroes.filter((h) => h.powers.includes(power));
        }

        if (maxLevel) {
            heroes = heroes.filter((h) => h.threatLevel <= maxLevel);
        }

        if (minLevel) {
            heroes = heroes.filter((h) => h.threatLevel >= minLevel);
        }

        if (search) {
            const lowString = search.toLowerCase();
            heroes = heroes.filter(
                (h) =>
                    h.codeName.toLowerCase().includes(lowString) ||
                    (h.notes && h.notes.toLowerCase().includes(lowString)),
            );
        }

        if (sortBy) {
            heroes.sort((a, b) => {
                let valA = a[sortBy];
                let valB = b[sortBy];
                if (typeof valA === "string") valA = valA.toLowerCase();
                if (typeof valB === "string") valB = valB.toLowerCase();

                if (valA < valB) return order === "asc" ? -1 : 1;
                if (valA > valB) return order === "asc" ? 1 : -1;
                return 0;
            });
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = pageNum * limitNum;
        const paginatedHeroes = heroes.slice(startIndex, endIndex);

        const responseData = {
            data: paginatedHeroes,
            meta: {
                total: heroes.length,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(heroes.length / limitNum),
            },
        };
        sendResponse(res, 200, responseData);
    } catch (error) {
        sendResponse(res, 500, "Internal Server Error", false);
    }
}

export async function getHeroById(req, res) {
    try {
        const { id } = req.params;
        const idNum = parseInt(id, 10);

        if (isNaN(idNum)) {
            return sendResponse(res, 400, "Invalid ID format", false);
        }

        const heroes = await readFile(FILE_PATH);
        const hero = heroes.find((h) => h.id === idNum);

        if (!hero) {
            return sendResponse(res, 404, "Hero not found.", false);
        }

        return sendResponse(res, 200, hero, true);
    } catch (error) {
        return sendResponse(res, 500, "Internal Server Error", false);
    }
}

export async function createHero(req, res) {
    try {
        const body = await parseBody(req);
        const heroes = await readFile(FILE_PATH);

        if (
            !body.codeName ||
            typeof body.codeName !== "string" ||
            body.codeName.trim() === ""
        ) {
            return sendResponse(res, 400, "Invalid codeName", false);
        }

        if (heroes.some((h) => h.codeName === body.codeName)) {
            return sendResponse(res, 409, "codeName already exists", false);
        }

        if (
            !body.powers ||
            body.powers.length === 0 ||
            !Array.isArray(body.powers)
        ) {
            return sendResponse(res, 400, "powers cant be empty", false);
        }

        if (!body.powers.every((p) => typeof p === "string")) {
            return sendResponse(
                res,
                400,
                "All powers must be a string.",
                false,
            );
        }

        if (
            typeof body.threatLevel != "number" ||
            body.threatLevel < 0 ||
            body.threatLevel > 10
        ) {
            return sendResponse(
                res,
                400,
                "threatLevel must be a number between 1 and 10",
                false,
            );
        }

        body.status = body.status || "active";
        const validStatuses = ["active", "retired", "missing", "deceased"];
        if (!validStatuses.includes(body.status)) {
            return sendResponse(
                res,
                400,
                `status must be one of the following options ${validStatuses}`,
                false,
            );
        }

        body.affiliations = body.affiliations || [];
        if (!Array.isArray(body.affiliations)) {
            return sendResponse(
                res,
                400,
                "affiliations must be an array.",
                false,
            );
        }

        const maxId =
            heroes.length > 0 ? Math.max(...heroes.map((h) => h.id)) : 0;

        const newHero = {
            id: maxId + 1,
            codeName: body.codeName,
            powers: body.powers,
            threatLevel: body.threatLevel,
            status: body.status,
            origin: body.origin || "",
            affiliations: body.affiliations,
            firstSighting: body.firstSighting || new Date().toISOString(),
            notes: body.notes || [],
            createdAt: new Date().toISOString(),
            updatedAt: null,
        };

        heroes.push(newHero);
        await writeFile(FILE_PATH, heroes);
        sendResponse(res, 201, newHero);
    } catch (error) {
        if (error instanceof SyntaxError) {
            return sendResponse(res, 400, "Invalid JSON", false);
        }
        sendResponse(res, 500, "Internal Server Error", false);
    }
}

export async function updateHero(req, res) {
    try {
        const { id } = req.params;
        const idNum = parseInt(id, 10);

        if (isNaN(idNum)) {
            return sendResponse(res, 400, "Invalid ID format", false);
        }

        const body = await parseBody(req);
        const heroes = await readFile(FILE_PATH);
        const heroIndex = heroes.findIndex((h) => h.id === idNum);

        if (heroIndex === -1) {
            return sendResponse(res, 404, "Hero not found.", false);
        }

        const hero = heroes[heroIndex];

        if (body.codeName !== undefined) {
            if (
                typeof body.codeName !== "string" ||
                body.codeName.trim() === ""
            ) {
                return sendResponse(res, 400, "Invalid codeName", false);
            }
            if (
                heroes.some(
                    (h) => h.codeName === body.codeName && h.id !== idNum,
                )
            ) {
                return sendResponse(res, 409, "codeName already exists", false);
            }
            hero.codeName = body.codeName;
        }

        if (body.powers !== undefined) {
            if (!Array.isArray(body.powers) || body.powers.length === 0) {
                return sendResponse(res, 400, "powers cant be empty", false);
            }
            if (!body.powers.every((p) => typeof p === "string")) {
                return sendResponse(
                    res,
                    400,
                    "All powers must be a string.",
                    false,
                );
            }
            hero.powers = body.powers;
        }

        if (body.threatLevel !== undefined) {
            if (
                typeof body.threatLevel !== "number" ||
                body.threatLevel < 0 ||
                body.threatLevel > 10
            ) {
                return sendResponse(
                    res,
                    400,
                    "threatLevel must be a number between 1 and 10",
                    false,
                );
            }
            hero.threatLevel = body.threatLevel;
        }

        if (body.status !== undefined) {
            const validStatuses = ["active", "retired", "missing", "deceased"];
            if (!validStatuses.includes(body.status)) {
                return sendResponse(
                    res,
                    400,
                    `status must be one of the following options ${validStatuses}`,
                    false,
                );
            }
            hero.status = body.status;
        }

        if (body.affiliations !== undefined) {
            if (!Array.isArray(body.affiliations)) {
                return sendResponse(
                    res,
                    400,
                    "affiliations must be an array.",
                    false,
                );
            }
            hero.affiliations = body.affiliations;
        }

        if (body.origin !== undefined) {
            hero.origin = body.origin;
        }

        if (body.notes !== undefined) {
            hero.notes = body.notes;
        }

        hero.updatedAt = new Date().toISOString();
        heroes[heroIndex] = hero;

        await writeFile(FILE_PATH, heroes);
        sendResponse(res, 200, hero);
    } catch (error) {
        if (error instanceof SyntaxError) {
            return sendResponse(res, 400, "Invalid JSON", false);
        }
        sendResponse(res, 500, "Internal Server Error", false);
    }
}

export async function deleteHero(req, res) {}

export async function searchHero(req, res) {}
