const axios = require("axios")
const cheerio = require("cheerio")
const fs = require("fs")
const { argv } = require("process")
var originalSite = fs.createWriteStream("originalSite.txt", { flags: "a" })
var otherSite = fs.createWriteStream("otherSite.txt", { flags: "a" })
const LinkedList = require("./linkedlist")
const runCrawl = async (uri) => {
  if (!uri.endsWith("/")) {
    uri = uri + "/"
  }
  const queue = new LinkedList()
  const seen = {}
  const { data, status } = await axios.get(uri, {
    withCredentials: true,
  })
  const $ = cheerio.load(data)
  $("a").map((i, el) => {
    if (!seen[el.attribs.href] && el.attribs.href) {
      seen[el.attribs.href] = true
      if (el.attribs.href.startsWith(uri)) {
        originalSite.write(el.attribs.href + "\n")
        queue.push(el.attribs.href)
      } else {
        if (!el.attribs.href.startsWith("https") && !el.attribs.href.startsWith("http")) {
          seen[el.attribs.href] = true
          if (el.attribs.href.startsWith("/")) {
            el.attribs.href = el.attribs.href.substring(1)
          }
          originalSite.write(uri + el.attribs.href + "\n")
          queue.push(uri + el.attribs.href)
        } else {
          seen[el.attribs.href] = true
          otherSite.write(el.attribs.href + "\n")
        }
      }
    }
  })
  while (queue.length) {
    try {
      const { val } = queue.unshift()
      const { data, status } = await axios.get(val, {
        withCredentials: true,
      })
      const $ = cheerio.load(data)
      $("a").map((i, el) => {
        if (!seen[el.attribs.href] && el.attribs.href) {
          if (el.attribs.href.startsWith(uri)) {
            seen[el.attribs.href] = true
            originalSite.write(el.attribs.href + "\n")
            queue.push(el.attribs.href)
          } else {
            if (!el.attribs.href.startsWith("https") && !el.attribs.href.startsWith("http")) {
              seen[el.attribs.href] = true
              if (el.attribs.href.startsWith("/")) {
                el.attribs.href = el.attribs.href.substring(1)
              }
              originalSite.write(uri + el.attribs.href + "\n")
              queue.push(uri + el.attribs.href)
            } else {
              seen[el.attribs.href] = true
              otherSite.write(el.attribs.href + "\n")
            }
          }
        }
      })
    } catch (error) {}
  }
}
runCrawl(argv[2])
