const marked = require('marked')

const rule = /\[\[((.*?)(\|(.*?))?)\]\]/
const parseRec = async (sql, md) => {
    if (md === undefined) return ''
    const match = md.match(rule)
    if (match) {
        const link = match[2]
        const title = match[4]
        const end = match.index + match[0].length
        const uuid = await sql`SELECT article_id FROM article_rev WHERE title = ${'%' + (link || title) + '%'} AND modification_author = NULL`
        const fullLink = `/article/${uuid}`
        const mdLink = `[${title || link}](${fullLink})`
        const next = await parseRec(md.substr(end, md.length))
        return md.substr(0, match.index) + mdLink + next
    } else {
        return md
    }
}

module.exports = async (sql, md) => marked.parse(await parseRec(sql, md))
