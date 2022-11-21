import playwright from 'playwright'

const pageURL = 'https://store-jp.nintendo.com/customize/switch-oled/'
const timeout = 1000
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


async function main() {
  const browser = await playwright.chromium.launch()

  setInterval(async () => {
    const page = await browser.newPage()

    await page.goto(pageURL)

    const el = await page.locator('label[for="switch-type-customize"] > span:last-child > span:last-child > span > em').elementHandle({ timeout }).catch(() => null)
    if (el) {
      const maybeSoltOutText = await el.textContent()
      if (maybeSoltOutText !== '品切れ') {
        logger.alert('入荷した可能性があります (TEXT IS NOT 品切れ)')
      } else {
        logger.log(`品切れ中`)
      }
    } else {
      logger.alert('入荷した可能性があります (DOM NOT FOUND)')
    }

    await page.close()
  }, 1000 * 120)
}

main().catch((err) => {
  logger.alert(err).then(() => {
    console.error(err)
    process.exit(1)
  })
})

