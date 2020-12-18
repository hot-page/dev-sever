import * as http from 'http'
import https from 'https'
import cheerio from 'cheerio'

interface UnnamedDevelopmentServerOptions {
  port?: number
  site: string
  replaceAssets: { [source: string]: string }
}

module.exports = function makeUnnamedDevelopmentServer(options: UnnamedDevelopmentServerOptions) {
  const { site, replaceAssets, port = 8000 } = options

  if (!site) throw "Site is required"

  const server = http.createServer(function(req, res) {
    console.log(req.url)

    const options = {
      host: `${ site }.unnamed-user-content.squids.online`,
      path: req.url,
    }

    https.request(options, (proxyRes: http.IncomingMessage) => {
      let html = ''
      proxyRes.on('data', chunk => html += chunk)
      // proxyRes.on('error', error => ... )
      proxyRes.on('end', () => {
        const $ = cheerio.load(html)
        Object.keys(replaceAssets).forEach((source: string) => {
          if (source.endsWith('.js')) {
            $(`script[src="${ source }"]`).remove()
          } else if (source.endsWith('.css')) {
           $(`link[href="${ source }"]`).remove()
          }
          if (replaceAssets[source].endsWith('.js')) {
            $(`head`).append(`<script src="${ replaceAssets[source]}"></script>`)
          } else if (replaceAssets[source].endsWith('.css')) {
            $(`head`).append(`<link rel=stylesheet href="${ replaceAssets[source]}">`)
          }
        })
        res.end($.html())
      })
    }).end()
  })

  server.listen(port, () => console.log('Listening on port', port))
}
