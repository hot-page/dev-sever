import * as http from 'http'
import https from 'https'
import cheerio from 'cheerio'

interface HotPageDevelopmentServerOptions {
  port?: number
  site: string
  replaceAssets: { [source: string]: string }
}

module.exports = function makeHotPageDevelopmentServer(options: HotPageDevelopmentServerOptions) {
  const { site, replaceAssets, port = 8000 } = options

  if (!site) throw "Site is required"

  const server = http.createServer(function(req, res) {
    console.log(req.url)

    const options = {
      host: site.includes('.') ? site : `${ site }.hot.page`,
      path: req.url,
    }

    https.request(options, (proxyRes: http.IncomingMessage) => {
      let html = ''
      proxyRes.on('data', chunk => html += chunk)
      // proxyRes.on('error', error => ... )
      proxyRes.on('end', () => {
        const $ = cheerio.load(html)
        Object.keys(replaceAssets).forEach((source: string) => {
          const addAsset = () => {
            if (replaceAssets[source].endsWith('.js')) {
              $(`head`).append(
                `<script src="${ replaceAssets[source]}"></script>`,
              )
            } else if (replaceAssets[source].endsWith('.css')) {
              $(`head`).append(
                `<link rel=stylesheet href="${ replaceAssets[source]}">`,
              )
            }
          }

          if (source.endsWith('.js')) {
            if ($(`script[src="${ source }"]`).length > 0) {
              $(`script[src="${ source }"]`).remove()
              addAsset()
            }
          } else if (source.endsWith('.css')) {
            if ($(`link[href="${ source }"]`).length > 0) {
              $(`link[href="${ source }"]`).remove()
              addAsset()
            }
          }
        })
        res.end($.html())
      })
    }).end()
  })

  server.listen(port, () => console.log('Listening on port', port))
}
