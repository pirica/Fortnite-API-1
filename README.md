# Fortnite-API
[![Build Status](https://travis-ci.org/Tusta/Fortnite-API.svg?branch=master)](https://travis-ci.org/Tusta/Fortnite-API)
[![npm version](https://badge.fury.io/js/%40fnite%2Fbattle-royale.svg)](https://badge.fury.io/js/%40fnite%2Fbattle-royale)

A simple asynchronous Fortnite api for Node.

## Install
use npm to install this project.

Before installing, download and install Node.js. Node.js 0.10 or higher is required.
``` 
$ npm i @fnite/battle-royale 
```

## API

Go to [API Access](https://erwinkulasic.com/api) and create a new account after that you can copy your api token and paste into your project file.

```js
const Fortnite = require('@fnite/battle-royale')(<access_token>)
```

## Usage

#### initalize the instance and gives the access to the api:
```js
const Fortnite = require('@fnite/battle-royale')("2ba1efe...");

Fortnite.upcoming().then(e => console.log(e));

Fortnite.shop().then(e => console.log(e));

Fortnite.playlist().then(e => console.log(e));

Fortnite.news().then(e => console.log(e));

//more is comming soon...
```


## License
MIT License

Copyright (c) 2019 VerTical

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

