import { checkServerHealth } from "./controllers/healthController.js";
import * as heroFuncs from "./controllers/heroesController.js";
import { getHeroesStat } from "./controllers/statController.js";

export const routes = [
    {
        method: "GET",
        path: "/health",
        handler: checkServerHealth,
    },
    {
        method: "GET",
        path: "/heroes",
        handler: heroFuncs.getAllHeroes,
    },
    {
        method: "GET",
        path: "/heroes/:id",
        handler: heroFuncs.getHeroById,
    },
    {
        method: "POST",
        path: "/heroes",
        handler: heroFuncs.createHero,
    },
    {
        method: "PATCH",
        path: "/heroes/:id",
        handler: heroFuncs.updateHero,
    },
    {
        method: "DELETE",
        path: "/heroes/:id",
        handler: heroFuncs.deleteHero,
    },
    {
        method: "POST",
        path: "/heroes/search",
        handler: heroFuncs.searchHero,
    },
    {
        method: "GET",
        path: "/stat",
        handler: getHeroesStat,
    },
];
