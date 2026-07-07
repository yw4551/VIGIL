import { readFile, writeFile } from "../fileHandler.js";
import { sendResponse, parseBody } from "../response.js";

const FILE_PATH = "heroes.json";
let newId = 0;

export async function getAllHeroes(req, res) {
    return sendResponse(res, 200, await readFile(FILE_PATH));
}

export function getHeroById(req, res) {}

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
            treatLevel: body.threatLevel,
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

export function updateHero(req, res) {}

export function deleteHero(req, res) {}

export function searchHero(req, res) {}
