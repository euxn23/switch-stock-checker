import { JSDOM } from 'jsdom'

const pageURL = 'https://store-jp.nintendo.com/customize/switch-oled/'
const webhookURL = 'https://hooks.slack.com/services/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'

const log = (text: string) => {
  const now = new Date()
  console.log(`${text} ${now.toLocaleTimeString()}`)
}

const logger = {
  log,
  alert: async (text_: string) => {
    const text = `${text_}\n${pageURL}`
    log(text)

    return fetch(webhookURL, { method: 'POST', body: JSON.stringify({ text }) })
  }
}


async function crawl () {
  const page = await fetch(pageURL).then((res) => res.text())

  const dom = new JSDOM(page)
  const el = dom.window.document.querySelector('label[for="switch-type-customize"] > span:last-child > span:last-child > span > em')
  if (el) {
    const maybeSoltOutText = el.textContent
    if (maybeSoltOutText !== '品切れ') {
      logger.alert('入荷した可能性があります (TEXT IS NOT 品切れ)')
    } else {
      logger.log(`品切れ中`)
    }
  } else {
    logger.alert('入荷した可能性があります (DOM NOT FOUND)')
  }
}


async function main() {
  setInterval(crawl, 1000 * 120)
  // crawl()
}

main().catch((err) => {
  logger.alert(err).then(() => {
    console.error(err)
    process.exit(1)
  })
})

