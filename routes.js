export const routes = [
    {
        method: "GET",
        path: "/health",
        handler: checkServerHealth,
    },
    {
        method: "GET",
        path: "/heroes",
        handler: getAllHeroes,
    },
    {
        method: "GET",
        path: "/heroes/:id",
        handler: getHeroById,
    },
    {
        method: "POST",
        path: "/heroes",
        handler: createHero,
    },
    {
        method: "PATCH",
        path: "/heroes/:id",
        handler: updateHero,
    },
    {
        method: "DELETE",
        path: "/heroes/:id",
        handler: deleteHero,
    },
    {
        method: "POST",
        path: "/heroes/search",
        handler: searchHero,
    },
    {
        method: "GET",
        path: "/stat",
        handler: getHeroesStat,
    },
];
