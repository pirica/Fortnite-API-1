'use strict';

var Client = require('./client');

class Fortnite extends Client {
    constructor(auth) {
        if (auth && auth.email && auth.password) {
            super(auth);
            this.result = {
                displayName: '',
                id: '',
                platform: '',
                solo: {
                    score: 0,
                    kills: 0,
                    matchesplayed: 0,
                    placetop1: 0,
                    placetop10: 0,
                    placetop25: 0,
                    minutesplayed: 0,
                    lastmodified: 0
                },
                duo: {
                    score: 0,
                    kills: 0,
                    matchesplayed: 0,
                    placetop1: 0,
                    placetop5: 0,
                    placetop12: 0,
                    minutesplayed: 0,
                    lastmodified: 0
                },
                squad: {
                    score: 0,
                    kills: 0,
                    matchesplayed: 0,
                    placetop1: 0,
                    placetop3: 0,
                    placetop6: 0,
                    minutesplayed: 0,
                    lastmodified: 0
                }
            };
        }
    }

    getUser(username, platform = 'pc', time = 'alltime') {
        return new Promise((final, error) => {

            if (username.length < 3)
                error("username is too short.")

            this.waitForAccess().then(e => {
                this.get(username.length < 16 ? `https://persona-public-service-prod06.ol.epicgames.com/persona/api/public/account/lookup?q=${username}` :
                        `https://account-public-service-prod03.ol.epicgames.com/account/api/public/account?accountId=${username}`, e.access_token1, false)
                    .then(result => {
                        result = (username.length < 16 ? result : result[0]);

                        if (result.displayName == undefined || result.id == undefined)
                            error("this user does not exist.")

                        this.get(`https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/stats/accountId/${result.id}/bulk/window/${time}`, e.access_token2, false)
                            .then(stats => {
                                this.result.displayName = result.displayName;
                                this.result.id = result.id;
                                this.result.platform = platform;
                                this.parseStats(this.result, stats, platform);
                                final(this.result);
                            })
                    }).catch(err => error(err));
            })
        });
    }

    getStatus() {
        return new Promise((result, error) => {
            this.get('https://lightswitch-public-service-prod06.ol.epicgames.com/lightswitch/api/service/bulk/status?serviceId=Fortnite')
                .then(status => {
                    result(status[0].status == 'UP' ? true : false);
                })
                .catch(error => error(error));
        });
    }
}

module.exports = Fortnite;