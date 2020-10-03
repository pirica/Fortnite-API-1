'use strict';

/*
 *  Project: Fortnite-API
 *  API Access: https://erwinkulasic.com/api
 *  Author: Erwin Kulasic (VerTical)
 */
const fetch = require('node-fetch');

module.exports = (apiKey) => {
    const getData = async (action) => {
        let response = await fetch("https://api.erwinkulasic.com/v1/fortnite/" + action,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiKey })
            });
        let data = await response.json();
        return data;
    }

    return {
        shop: async () => {
            return await getData("shop");
        },
        playlist: async () => {
            return await getData("playlist");
        },
        news: async () => {
            return await getData("news");
        },
        upcoming: async () => {
            return await getData("upcoming");
        }
    }
}