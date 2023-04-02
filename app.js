const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")
const { argv } = require("process")
var stream = fs.createWriteStream("append.txt", { flags: "a" })

const runCrawl = async (uri) => {
  if (!uri.endsWith("/")) {
    uri = uri + "/"
  }
  const stack = []
  const seen = {}
  const { data, status } = await axios.get(uri)
  const $ = cheerio.load(data)
  $("a").map((i, el) => {
    if (!seen[el.attribs.href] && el.attribs.href) {
      if (el.attribs.href.startsWith(uri)) {
        stack.push(el.attribs.href)
        seen[el.attribs.href] = true
      } else {
        if (!el.attribs.href.startsWith("https") && !el.attribs.href.startsWith("http")) {
          stack.push(uri + el.attribs.href)
          seen[el.attribs.href] = true
        }
      }
    }
  })
  while (stack.length) {
    try {
      const val = stack.pop()
      const { data, status } = await axios.get(val)
      const $ = cheerio.load(data)
      $("a").map((i, el) => {
        if (!seen[el.attribs.href] && el.attribs.href) {
          if (el.attribs.href.startsWith(uri)) {
            stack.push(el.attribs.href)
            seen[el.attribs.href] = true
          } else {
            if (!el.attribs.href.startsWith("https") && !el.attribs.href.startsWith("http")) {
              stack.push(uri + el.attribs.href)
              seen[el.attribs.href] = true
            }
          }
        }
      })
      stream.write(val)
    } catch (error) {}
  }
}
runCrawl(argv[2])
