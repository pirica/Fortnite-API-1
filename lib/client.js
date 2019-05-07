'use strict';

var fetch = require('node-fetch');
var crypto = require('crypto');
var qs = require('qs');

class Client {
    constructor(options) {
        this.options = options;

        this.Client_Token = this.options.client_token ? this.options.client_token : "MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=";
        this.Fortnite_Token = this.options.fortnite_token ? this.options.fortnite_token : "ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ=";

        this.is_ready = false;
        this.access_token1 = undefined;
        this.access_token2 = undefined;
        this.refresh_expires = undefined;
        this.code = undefined;
        this.refresh_token = undefined;

        if(this.options.fastFetching) {
            this.last_user = [];

            this.last_user_clear = setInterval(() =>  {
            console.debug(`DEBUG[${new Date()}]: `, "clear all last fetched user.");
            this.last_user = [];
        }, this.options.fastFetching.refresh_time ? this.options.fastFetching.refresh_time : 300000)
        }
    }

    waitForAccess() {
        return new Promise((_res, _err) => {
            if (this.is_ready == false) {
                this.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token', {
                    'includePerms': false,
                    'token_type': 'eg1',
                    'grant_type': 'password',
                    'username': this.options.email,
                    'password': this.options.password
                }, this.Client_Token).then(a => {
                    this.access_token1 = a.access_token;

                    this.get('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/exchange', this.access_token1, false)
                        .then(b => {
                            this.code = b.code;
                            this.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token', {
                                    'grant_type': 'exchange_code',
                                    'exchange_code': this.code,
                                    'includePerms': false,
                                    'token_type': 'eg1'
                                }, this.Fortnite_Token)
                                .then(c => {
                                    this.access_token2 = c.access_token;
                                    this.refresh_token = c.refresh_token;
                                    this.refresh_expires = c.refresh_expires;

                                    this.is_ready = true;

                                    this.Token_Task = setInterval(() => {
                                        if (this.options.debug) {
                                            console.debug(`DEBUG[${new Date()}]: `, "is refresh now.");
                                        }

                                        this.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token', {
                                                'grant_type': 'refresh_token',
                                                'refresh_token': this.refresh_token,
                                                'includePerms': true,
                                            }, this.Fortnite_Token)
                                            .then(d => {
                                                this.access_token2 = d.access_token;
                                                this.refresh_token = d.refresh_token;
                                                this.refresh_expires = d.refresh_expires;
                                            }).catch(err => _err(err));
                                    }, parseInt(this.refresh_expires));

                                    _res({
                                        access_token1: this.access_token1,
                                        access_token2: this.access_token2
                                    });
                                }).catch(err => _err(err));

                        }).catch(err => _err(err));

                }).catch(err => _err(err));
            } else {
                _res({
                    access_token1: this.access_token1,
                    access_token2: this.access_token2
                });
            }
        });

    }

    post(url, body, Token, isClient = true) {
        return new Promise((result, error) => {
            fetch(url, {
                    headers: {
                        "User-Agent": "game=UELauncher, engine=UE4, build=7.14.2-4231683+++Portal+Release-Live",
                        "Authorization": isClient == true ? "basic " + Token : "bearer " + Token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "EPIC_DEVICE": this.generateDeviceId(),
                    },
                    method: 'POST',
                    body: qs.stringify(body)
                })
                .then(res => res.json())
                .then(val => {
                    if (this.options.debug) {
                        console.debug(`DEBUG[${new Date()}]: `, JSON.stringify(val));
                    }
                    result(val);
                })
                .catch(err => {
                    if (this.options.debug) {
                        console.debug(`DEBUG[${new Date()}]: `, err);
                    }
                    error(err);
                });
        });
    }

    get(url, Token, isClient = true) {
        return new Promise((result, error) => {
            fetch(url, {
                    headers: {
                        "User-Agent": "game=UELauncher, engine=UE4, build=7.14.2-4231683+++Portal+Release-Live",
                        "Authorization": isClient == true ? "basic " + Token : "bearer " + Token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "EPIC_DEVICE": this.generateDeviceId(),
                    },
                    method: 'GET'
                })
                .then(res => res.json())
                .then(val => {
                    if (this.options.debug) {
                        console.debug(`DEBUG[${new Date()}]: `, JSON.stringify(val));
                    }
                    result(val);
                })
                .catch(err => {
                    if (this.options.debug) {
                        console.debug(`DEBUG[${new Date()}]: `, err);
                    }
                    error(err);
                });
        });
    }

    delete(url, Token, isClient = true) {
        return new Promise((result, error) => {
            fetch(url, {
                    headers: {
                        "User-Agent": "game=UELauncher, engine=UE4, build=7.14.2-4231683+++Portal+Release-Live",
                        "Authorization": isClient == true ? "basic " + Token : "bearer " + Token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "EPIC_DEVICE": this.generateDeviceId(),
                    },
                    method: 'DELETE'
                })
                .then(res => res.json())
                .then(val => {
                    if (this.options.debug) {
                        console.debug(`DEBUG[${new Date()}]: `, JSON.stringify(val));
                    }
                    result(val);
                })
                .catch(err => {
                    if (this.options.debug) {
                        console.debug(`DEBUG[${new Date()}]: `, err);
                    }
                    error(err);
                });
        });
    }

    generateDeviceId() {
        return (`${crypto.randomBytes(8).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(12).toString('hex')}`)
    }

    randomID() {
        return crypto.randomBytes(8).toString('hex');
    }

    parseStats(result, stats, platform) {
        for (let i = 0; i < stats.length; i++) {
            let e = (stats[i].name).split('_'),
                v = (stats[i].value);
            if (e[2] == platform) {
                result[(e[4] == 'p2' ? 'solo' : e[4] == 'p10' ? 'duo' : 'squad')][e[1]] = v;
            }
        }

        ['solo', 'duo', 'squad'].forEach(modes => this.setStats(result[modes]))
    }

    setStats(result) {
        result['kd'] = parseFloat(parseInt(result.matchesplayed - result.placetop1) === 0 ? 0 : (parseInt(result.kills) / parseInt(result.matchesplayed - result.placetop1)).toFixed(2));
        result['winrate'] = parseFloat(parseInt(result.matchesplayed) === 0 ? 0 : (parseInt(result.placetop1) / parseInt(result.matchesplayed) * 100).toFixed(2));
        result['kpm'] = parseFloat(parseInt(result.matchesplayed) === 0 ? 0 : (parseInt(result.kills) / parseInt(result.matchesplayed)).toFixed(2));
        result['spm'] = parseFloat(parseInt(result.matchesplayed) === 0 ? 0 : (parseInt(result.score) / parseInt(result.matchesplayed)).toFixed(2));
    }

    isLastUser(displayName, id, platform) {
        let user = this.last_user.find(e => (e.platform == platform && e.displayName == displayName && e.id == id) );
        return user ? user : false;
    }

    pushUser(result) {
        if(this.options.fastFetching)
            this.last_user.push(result);
    }
}

module.exports = Client;