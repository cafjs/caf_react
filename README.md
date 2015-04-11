# CAF (Cloud Assistant Framework)

Co-design permanent, active, stateful, reliable cloud proxies with your web app.

See http://www.cafjs.com 

## CAF React.js background rendering plugin

Reduces latency for React.js applications by rendering them in the cloud with a CA. 

Rendering could be triggered by a CA's state change, or periodically, so that requests always find a reasonably up-to-date version in the (Redis) cache.

To access that pre-rendered page we simply can do a GET using a secret, random cache key in the query:

      http://foo.vcap.me:3000/?cache=dfgsraa44ww6632ss

The page gets cached by Redis so that any CA can serve this http request, eliminating redirections that affect latency.


## API

    lib/proxy_react.js
 
## Configuration Example

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

where `separator` is a token to highlight an insertion point in the template for the rendered content, i.e., it splits the template in two.

`expiresInSec` enables grabage collection of the cache by expiring entries.

`appFileName` is a file path relative to the location of `ca_methods.js`. Optionally, an absolute directory path can be specified with property `appDir`.

`cacheService` is the name of plug used for remote caching of rendered entries, i.e., $._.$[`cacheService`]


### ca.json

            {
            "module": "caf_react#plug_ca",
            "name": "react",
            "description": "Manages background rendering for this CA.",
            "env" : {
                "maxRetries" : "$._.env.maxRetries",
                "retryDelay" : "$._.env.retryDelay"
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
