
# Hot Page Development Server

Serve pages from Hot Page with assets from localhost (or wherever).

```
const makeHotDevServer = require('hot-dev-server')

makeHotDevServer({
  site: 'first',
  port: 8080,
  replaceAssets: {
    'https://unpkg.com/XXX.css': 'http://localhost:8000/YYY.js'
  }
})
```

With this configuration, the dev server will load at port 8080 and serve web
pages from `first.hot.page`. If the stylesheet `https://unpkg.com/XXX.css` is 
present on the page, it will be removed and the script
`http://localhost:8000/YYY.js` will be added.

