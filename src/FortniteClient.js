'use strict';
var fetch = require('node-fetch');
var crypto = require('crypto');
var qs = require('qs');

class FortniteClient {
    constructor(options) {
        this.options = options;

        this.endpoints = {
            auth: 'https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token',
            exchange: 'https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/exchange',
            lookupUsername: username => {
                return `https://persona-public-service-prod06.ol.epicgames.com/persona/api/public/account/lookup?q=${username}`;
            },
            lookupID: accountId => {
                return `https://account-public-service-prod03.ol.epicgames.com/account/api/public/account?accountId=${accountId}`;
            },
            getStats: (id, time) => {
                return `https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/stats/accountId/${id}/bulk/window/${time || 'alltime'}`;
            },
            status: 'https://lightswitch-public-service-prod06.ol.epicgames.com/lightswitch/api/service/bulk/status?serviceId=Fortnite',
            news: 'https://fortnitecontent-website-prod07.ol.epicgames.com/content/api/pages/fortnite-game',
            store: 'https://fortnite-public-service-prod11.ol.epicgames.com/fortnite/api/storefront/v2/catalog'
        };

        this.client = {
            clientToken: this.options.client_token ? this.options.client_token : "MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=",
            fortniteToken: this.options.fortnite_token ? this.options.fortnite_token : "ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ=",
            isAuthorised: false,
            accessToken: undefined,
            refreshExpires: undefined,
            refreshToken: undefined,
            userList: []
        };
    }

    waitForAccess() {
        return this.getPromise('WaitForAccess', (resolve, reject) => {
            if (!this.client.isAuthorised) {
                this.get(this.endpoints.auth, {
                        method: 'POST',
                        headers: this.getHeaders(this.client.clientToken),
                        body: qs.stringify({
                            'includePerms': false,
                            'token_type': 'eg1',
                            'grant_type': 'password',
                            'username': this.options.email,
                            'password': this.options.password
                        })
                    })
                    .then(getToken => {
                        this.get(this.endpoints.exchange, {
                                method: 'GET',
                                headers: this.getHeaders(getToken.access_token, false)
                            })
                            .then(getCode => {
                                this.get(this.endpoints.auth, {
                                        method: 'POST',
                                        headers: this.getHeaders(this.client.fortniteToken),
                                        body: qs.stringify({
                                            'grant_type': 'exchange_code',
                                            'exchange_code': getCode.code,
                                            'includePerms': false,
                                            'token_type': 'eg1'
                                        })
                                    })
                                    .then(getData => {
                                        this.client.accessToken = getData.access_token;
                                        this.client.refreshExpires = getData.refresh_expires;
                                        this.client.refreshToken = getData.refresh_token;
                                        resolve({
                                            accessToken: this.client.accessToken
                                        });
                                        this.client.isAuthorised = true;

                                        setInterval(() => {
                                            if (this.options.debug) {
                                                console.debug(`DEBUG[${new Date()}]: is refreshing.`);
                                            }
                                            this.get(this.endpoints.auth, {
                                                    method: 'POST',
                                                    headers: this.getHeaders(this.client.fortniteToken),
                                                    body: qs.stringify({
                                                        'grant_type': 'refresh_token',
                                                        'refresh_token': this.client.refreshToken,
                                                        'includePerms': true,
                                                    })
                                                })
                                                .then(getData => {
                                                    this.client.accessToken = getData.access_token;
                                                    this.client.refreshExpires = getData.refresh_expires;
                                                    this.client.refreshToken = getData.refresh_token;
                                                })
                                        }, this.client.refreshExpires);
                                    }).catch(e => reject(e));
                            }).catch(e => reject(e));
                    }).catch(e => reject(e));
            } else {
                resolve({
                    accessToken: this.client.accessToken
                });
            }
        })
    }

    getHeaders(Token, isBasic = true) {
        return {
            "User-Agent": "game=UELauncher, engine=UE4, build=7.14.2-4231683+++Portal+Release-Live",
            "Authorization": isBasic == true ? "basic " + Token : "bearer " + Token,
            "Content-Type": "application/x-www-form-urlencoded",
            "EPIC_DEVICE": this.getRandomDeviceID(),
        };
    }

    getRandomDeviceID() {
        return (`${crypto.randomBytes(8).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(12).toString('hex')}`)
    }

    getRandomID() {
        return crypto.randomBytes(8).toString('hex');
    }

    getLastUser(displayName, id, platform) {
        return this.client.userList.find(e => (e.platform == platform && e.displayName == displayName && e.id == id));
    }

    pushUser(stats) {
        this.client.userList.push(stats);
    }

    getPromise(name, task) {
        var label = `@${name}-${this.getRandomID()}`;
        if (this.options.debug) {
            console.debug(`DEBUG[${new Date()}]: invoke function => ${name}.`);
            console.time(label);
        }

        return new Promise((resolve, reject) => {
            task((value) => {
                if (this.options.debug) {
                    console.debug(`DEBUG[${new Date()}]: end function => ${name}.`);
                    console.timeEnd(label);
                }
                resolve(value);
            }, reject);
        })
    }

    get(input, init) {
        return fetch(input, init)
            .then(response => response.json());
    }

    parseStats(result, stats, platform) {
        for (let i = 0; i < stats.length; i++) {
            let e = (stats[i].name).split('_'),
                v = (stats[i].value);
            if (e[2] == platform) {
                result[(e[4] == 'p2' ? 'solo' : e[4] == 'p10' ? 'duo' : 'squad')][e[1]] = v;
            }
        }

        ['solo', 'duo', 'squad'].forEach(modes => ((result) => {
            result['kd'] = parseFloat(parseInt(result.matchesplayed - result.placetop1) === 0 ? 0 : (parseInt(result.kills) / parseInt(result.matchesplayed - result.placetop1)).toFixed(2));
            result['winrate'] = parseFloat(parseInt(result.matchesplayed) === 0 ? 0 : (parseInt(result.placetop1) / parseInt(result.matchesplayed) * 100).toFixed(2));
            result['kpm'] = parseFloat(parseInt(result.matchesplayed) === 0 ? 0 : (parseInt(result.kills) / parseInt(result.matchesplayed)).toFixed(2));
            result['spm'] = parseFloat(parseInt(result.matchesplayed) === 0 ? 0 : (parseInt(result.score) / parseInt(result.matchesplayed)).toFixed(2));
        })(result[modes]))
    }
}

module.exports = FortniteClient;