'use strict';
class FortniteAPI extends require('./FortniteClient') {
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
                    lastmodified: 0,
                    kpm: 0,
                    spm: 0,
                    kd: 0,
                    winrate: 0
                },
                duo: {
                    score: 0,
                    kills: 0,
                    matchesplayed: 0,
                    placetop1: 0,
                    placetop5: 0,
                    placetop12: 0,
                    minutesplayed: 0,
                    lastmodified: 0,
                    kpm: 0,
                    spm: 0,
                    kd: 0,
                    winrate: 0
                },
                squad: {
                    score: 0,
                    kills: 0,
                    matchesplayed: 0,
                    placetop1: 0,
                    placetop3: 0,
                    placetop6: 0,
                    minutesplayed: 0,
                    lastmodified: 0,
                    kpm: 0,
                    spm: 0,
                    kd: 0,
                    winrate: 0
                }
            };
        } else {
            throw new Error('Incorrect or no access data, please enter the options correctly.');
        }
    }

    clearResult() {
         ['solo', 'duo', 'squad'].forEach(modes => {
            this.result[modes] = {
                score: 0,
                kills: 0,
                matchesplayed: 0,
                placetop1: 0,
                placetop3: 0,
                placetop6: 0,
                minutesplayed: 0,
                lastmodified: 0,
                kpm: 0,
                spm: 0,
                kd: 0,
                winrate: 0
            }
         });
    }

    getUser(username, platform = 'pc', time = 'alltime') {
        return this.getPromise('getUser', (resolve, reject) => {
            if (username.length < 3) {
                reject("username is too short.");
            }
            this.waitForAccess().then(getToken => {
                this.get(username.length < 16 ? this.endpoints.lookupUsername(username) : this.endpoints.lookupID(username), {
                    method: 'GET',
                    headers: this.getHeaders(getToken.accessToken, false)
                }).then(getLookup => {
                    getLookup = (username.length < 16 ? getLookup : getLookup[0]);
                    if (getLookup.displayName == undefined || getLookup.id == undefined) {
                        reject("this user does not exist.");
                    }
                    
                    let user = this.getLastUser(getLookup.displayName, getLookup.id, platform);

                    if(user && this.options.fastFetching) {
                        resolve(user);
                    }

                    this.get(this.endpoints.getStats(getLookup.id, time), {
                            method: 'GET',
                            headers: this.getHeaders(getToken.accessToken, false)
                        })
                        .then(getStats => {
                            this.result.displayName = getLookup.displayName;
                            this.result.id = getLookup.id;
                            this.result.platform = platform;
                            this.clearResult();
                            this.parseStats(this.result, getStats, platform);
                            if (this.options.fastFetching)
                                this.pushUser(this.result);
                            
                            if((user == undefined && this.options.fastFetching) || !this.options.fastFetching)
                                resolve(this.result);
                        })
                }).catch(e => reject(e));

            }).catch(e => reject(e));
        });
    }

    getStatus() {
        return this.getPromise('getStatus', (resolve, reject) => {
            this.get(this.endpoints.status)
                .then(getStatus => {
                    resolve(getStatus[0].status == 'UP' ? true : false);
                })
                .catch(e => reject(e));
        })
    }

    getNews() {
        return this.getPromise('getNews', (resolve, reject) => {
            this.get(this.endpoints.news)
                .then(getNews => {
                    resolve(getNews);
                })
                .catch(e => reject(e));
        })
    }
}

module.exports = FortniteAPI;