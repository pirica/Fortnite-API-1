# :fire: Fortnite-API
[![npm version](https://badge.fury.io/js/%40fnite%2Fbattle-royale.svg)](https://badge.fury.io/js/%40fnite%2Fbattle-royale)


A simple asynchronous fortnite api written in nodejs.

## Install
use npm to install this project.

Before installing, download and install Node.js. Node.js 0.10 or higher is required.
``` 
$ npm i @fnite/battle-royale 
```
## Functions
__getUser( < Username >, < Platform >, < Time > ):__ *return user stats by id or username.*

__getStatus():__ *return true when server are up otherwise false.*

## Simple usage

#### initalize the instance and gives the access to the api:
```js
const FortniteClient = require('@fnite/battle-royale');

var Fortnite = new FortniteClient({
    email: ' < email > ',
    password: ' < password > '
});
```

#### Retrieve user statistics by username:
```js
Fortnite.getUser('SavageHaxor', 'ps4')
    .then(result => {
        console.log(result)
    })
    .catch(error => {
        console.error(error);
    })
```

#### Retrieve user statistics by id:
```js
Fortnite.getUser('15bdae81a9b549bc98bbaad2502b0834', 'ps4')
    .then(result => {
        console.log(result)
    })
    .catch(error => {
        console.error(error);
    })
```

#### Get server status:
```js
Fortnite.getStatus()
    .then(status => console.log(status));
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
