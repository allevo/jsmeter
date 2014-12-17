JS Tuning
=======

[![Build Status](https://travis-ci.org/allevo/jstuning.svg)](https://travis-ci.org/allevo/jstuning)

Inspect your code to track its performance


Are you looking for a tool to track your code performance?

This is the project made for you!


With only 2 line, you can track all main issuer like db or http queries.


## How


In first, you should create your handler. The handler is a function that will be invoked when a metric is calculated.
For instance we'll use console.log function.
```javascript
var myhandler = console.log.bind(null, 'Metric:');
```

You can send this metric to somewhere, where you prefer.

Please note: in the following example, we use the packages of the app beacuse this tool wrap all methods we need.


### Mongodb
```javascript

var mongodb = require('mongodb');

// pass same instance you use
require('jstuning').mongodb(mongodb, myhandler);

```


### Mongoose
```javascript

var mongoose = require('mongoose');

// pass same instance you use
require('jstuning').mongoose(mongoose, myhandler);

```

So difficult, right?


## Why?

In my experience, nodejs is a great language. My idea starts from a real problem: how my code performs?
So I haven't found a tool that permits me to track all elapsed time. This tool aimed to give you a canche to give all elapsed time and send them to some tool like Gathering or StatsD.

This project is free and has a very low integration cost. So, why not?


## TODO

I've started but there're lot of things do to. I'd like to integrate major packages.

 * async
 * underscore / lodash
 * ~~Mongodb native driver~~
 * Mongoose (partially)
 * request
 * connect / expressjs middelware
 * sequelizejs
 * ...

So all your contributes are accepted and welcomed!

I'm started from packages I'm used to.
