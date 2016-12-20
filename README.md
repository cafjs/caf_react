# CAF (Cloud Assistant Framework)

Co-design permanent, active, stateful, reliable cloud proxies with your web app.

See http://www.cafjs.com

## CAF React.js background rendering plugin
[![Build Status](http://ci.cafjs.com/api/badges/cafjs/caf_react/status.svg)](http://ci.cafjs.com/cafjs/caf_react)

Reduces latency for React.js applications by server-rendering the UI with a CA.

Rendering could be triggered by a CA's state change, or periodically. The goal is that there is always a reasonably up-to-date version in the (Redis) cache.

To access that pre-rendered page we simply do a http GET using a secret, random cache key in the query:

      http://foo.vcap.me:3000?cacheKey=dfgsraa44ww6632ss

The page is cached by Redis, and any CA can serve this http request, eliminating redirections that increase latency.


## API

See {@link module:caf_react/proxy_react}

## Configuration Example

See {@link module:caf_react/plug_react} and  {@link module:caf_react/plug_ca_react}

### framework.json

        // after "cp"
        {
            "name" : "react",
            "module": "caf_react#plug",
            "description": "React.js background rendering",
            "env": {
                "appFileName" : "index.html",
                "separator" : "<section id=\"content\">",
                "cacheService" : "cp",
                "expiresInSec" : 10
            }
        }

### ca.json

            {
            "module": "caf_react#plug_ca",
            "name": "react",
            "description": "Manages background rendering for this CA.",
            "env" : {
                "maxRetries" : "$._.env.maxRetries",
                "retryDelay" : "$._.env.retryDelay"
                "coinPlayTime" : 900
            },
            "components" : [
                {
                    "module": "caf_react#proxy",
                    "name": "proxy",
                    "description": "Provides the background rendering API.",
                    "env" : {

                    }
                }
            ]
        }
