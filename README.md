# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Library for React.js background rendering

[![Build Status](https://github.com/cafjs/caf_react/actions/workflows/push.yml/badge.svg)](https://github.com/cafjs/caf_react/actions/workflows/push.yml)


Reduces latency for React.js applications by server-rendering the UI with a CA.

Rendering could be triggered by a CA's state change, or periodically. The goal is that there is always a reasonably up-to-date version in the (Redis) cache.

To access that pre-rendered page we simply do a http GET using an unguessable cache key in the query:
```
      http://foo.localtest.me:3000?cacheKey=dfgsraa44ww6632ss
```
The page is cached by `Redis`, and any CA can serve this http request, eliminating redirections that increase latency.


## API

See {@link module:caf_react/proxy_react}

## Configuration Example

See {@link module:caf_react/plug_react} and  {@link module:caf_react/plug_ca_react}

### framework.json
```
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
```
### ca.json
```
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
```
