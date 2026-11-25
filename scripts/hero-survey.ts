const pages = [
  '/', '/about', '/tours', '/hotels', '/places', '/places/kashmir',
  '/contact', '/faqs', '/make-my-trip', '/terms', '/privacy',
  '/tours/skardu-expedition', '/hotels/serena-hotel-gilgit',
  '/destinations/neelum-valley', '/cart', '/bookings', '/profile',
]

function strip(s: string) {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

async function main() {
  for (const p of pages) {
    let html = ''
    try {
      const res = await fetch('http://localhost:3000' + p, { redirect: 'manual' })
      if (res.status !== 200) {
        console.log(`${p.padEnd(30)} HTTP ${res.status}`)
        continue
      }
      html = await res.text()
    } catch (e: any) {
      console.log(`${p.padEnd(30)} FETCH ERR ${e.message}`)
      continue
    }

    // Grab hero region: from first <h1 to the next heading or section close
    const m = html.match(/<h1[^>]*>([\s\S]{0,600}?)<\/h1>/i)
    if (!m) {
      console.log(`${p.padEnd(30)} <no h1>`)
      continue
    }
    const h1 = strip(m[1])
    const after = html.slice(m.index! + m[0].length, m.index! + m[0].length + 700)
    const m2 = after.match(/<(p|h2)[^>]*>([\s\S]{0,500}?)<\/\1>/i)
    const second = m2 ? strip(m2[2]) : '(no second line)'
    const tag = m2 ? '<' + m2[1] + '>' : '-'
    const endsDot = /[.!?:]$/.test(second)
    console.log(`\n${p}   [second: ${tag}] endsWithPunct=${endsDot}`)
    console.log(`   h1 : ${h1}`)
    console.log(`   2nd: ${second}`)
  }
}
main()
