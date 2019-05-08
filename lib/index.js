'use strict';

var Client = require('./client');

class Fortnite extends Client {
    constructor(options) {
        if (options && options.email && options.password) {
            super(options);
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
        } else {
            throw new Error('Incorrect or no access data, please enter the options correctly.');
        }
    }

    getUser(username, platform = 'pc', time = 'alltime') {
        let last_label;
        if (this.options.debug) {
            last_label = `#getUser-@${this.randomID()}`
            console.debug(`DEBUG[${new Date()}]: `, 'start fetching user stats.');
            console.time(last_label);
        }

        return new Promise((final, error) => {
            if (username.length < 3) {
                error("username is too short.");
            }

            this.waitForAccess().then(e => {
                this.get(username.length < 16 ? `https://persona-public-service-prod06.ol.epicgames.com/persona/api/public/account/lookup?q=${username}` :
                        `https://account-public-service-prod03.ol.epicgames.com/account/api/public/account?accountId=${username}`, e.access_token, false)
                    .then(result => {
                        result = (username.length < 16 ? result : result[0]);

                        if (result.displayName == undefined || result.id == undefined) {
                            error("this user does not exist.");
                        }

                        if (this.options.fastFetching) {
                            let user = this.isLastUser(result.displayName, result.id, platform);
                            if (user) {
                                final(user);
                            }
                        }

                        this.get(`https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/stats/accountId/${result.id}/bulk/window/${time}`, e.access_token, false)
                            .then(stats => {
                                this.result.displayName = result.displayName;
                                this.result.id = result.id;
                                this.result.platform = platform;
                                this.parseStats(this.result, stats, platform);
                                this.pushUser(this.result);
                                final(this.result);
                            })

                        if (this.options.debug) {
                            console.debug(`DEBUG[${new Date()}]: `, 'stop fetching user stats.');
                            console.timeEnd(last_label);
                        }
                    }).catch(err => error(err));
            })
        });
    }

    getStatus() {
        let last_label;
        if (this.options.debug) {
            last_label = `#getStatus-@${this.randomID()}`
            console.debug(`DEBUG[${new Date()}]: `, 'start fetching server status.');
            console.time(last_label);
        }

        return new Promise((result, error) => {
            this.get('https://lightswitch-public-service-prod06.ol.epicgames.com/lightswitch/api/service/bulk/status?serviceId=Fortnite')
                .then(status => {
                    if (this.options.debug) {
                        console.debug(`DEBUG[${new Date()}]: `, 'stop fetching server status.');
                        console.timeEnd(last_label);
                    }
                    result(status[0].status == 'UP' ? true : false);
                })
                .catch(e => error(e));
        });
    }

    getNews() {
        let last_label;
        if (this.options.debug) {
            last_label = `#getNews-@${this.randomID()}`
            console.debug(`DEBUG[${new Date()}]: `, 'start fetching news.');
            console.time(last_label);
        }

        return new Promise((result, error) => {
            this.get('https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game')
                .then(news => {
                    result(news);
                    if (this.options.debug) {
                        console.debug(`DEBUG[${new Date()}]: `, 'stop fetching news.');
                        console.timeEnd(last_label);
                    }
                })
                .catch(e => error(e));
        });
    }
}

module.exports = Fortnite;