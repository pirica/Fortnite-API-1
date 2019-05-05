'use strict';

var fetch = require('node-fetch');
var crypto = require('crypto');
var qs = require('qs');

class Client {
    constructor(auth) {
        this.auth = auth;

        this.Client_Token = this.auth.client_token ? this.auth.client_token : "MzQ0NmNkNzI2OTRjNGE0NDg1ZDgxYjc3YWRiYjIxNDE6OTIwOWQ0YTVlMjVhNDU3ZmI5YjA3NDg5ZDMxM2I0MWE=";
        this.Fortnite_Token = this.auth.fortnite_token ? this.auth.fortnite_token : "ZWM2ODRiOGM2ODdmNDc5ZmFkZWEzY2IyYWQ4M2Y1YzY6ZTFmMzFjMjExZjI4NDEzMTg2MjYyZDM3YTEzZmM4NGQ=";

        this.is_ready = false;        
        this.access_token1 = undefined;
        this.access_token2 = undefined;
        this.expires_at = undefined;
        this.code = undefined;
        this.refresh_token = undefined;
    }

    waitForAccess() {


        return new Promise((_res, _err) => {
            if (this.is_ready == false) {
                this.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token', {
                    'includePerms': false,
                    'token_type': 'eg1',
                    'grant_type': 'password',
                    'username': this.auth.email,
                    'password': this.auth.password
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
                                    this.expires_at = c.expires_at;
                                    

                                    _res({
                                        access_token1: this.access_token1,
                                        access_token2: this.access_token2
                                    });
                                    
                                    this.is_ready = true;

                                    this.Token_Task = setInterval(() => {
                                        console.log('now refresh');

                                        this.post('https://account-public-service-prod03.ol.epicgames.com/account/api/oauth/token', {
                                                'includePerms': true,
                                                'refresh_token': this.refresh_token,
                                                'grant_type': 'refresh_token',
                                            }, this.Client_Token)
                                            .then(d => {
                                                this.access_token2 = d.access_token;
                                                this.refresh_token = d.refresh_token;
                                                this.expires_at = d.expires_at;
                                            }).catch(err => _err(err));
                                    }, 30000);
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
                        "Cache-Control": 'no-cache',
                        "EPIC_DEVICE": this.generateDeviceId(),
                    },
                    method: 'POST',
                    body: qs.stringify(body)
                })
                .then(res => res.json())
                .then(val => {
                    result(val);
                })
                .catch(err => error(err));
        });
    }

    get(url, Token, isClient = true) {
        return new Promise((result, error) => {
            fetch(url, {
                    headers: {
                        "User-Agent": "game=UELauncher, engine=UE4, build=7.14.2-4231683+++Portal+Release-Live",
                        "Authorization": isClient == true ? "basic " + Token : "bearer " + Token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Cache-Control": 'no-cache',
                        "EPIC_DEVICE": this.generateDeviceId(),
                    },
                    method: 'GET'
                })
                .then(res => res.json())
                .then(val => {
                    result(val);
                })
                .catch(err => error(err));
        });
    }

    generateDeviceId() {
        return (`${crypto.randomBytes(8).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(4).toString('hex')}-${crypto.randomBytes(12).toString('hex')}`)
    }

    parseStats(result, stats, platform) {
        for (let i = 0; i < stats.length; i++) {
            let e = (stats[i].name).split('_'),
                v = (stats[i].value);
            if (v === 0) continue;
            if (e[2] == platform) {
                result[(e[4] == 'p2' ? 'solo' : e[4] == 'p10' ? 'duo' : 'squad')][e[1]] = v;
            }
        }
    }
}

module.exports = Client;