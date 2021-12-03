const marked = require('marked')

const rule = /\[\[((.*?)(\|(.*?))?)\]\]/

const wikiLink = (sql) => {
    name: 'wikilink',
    level: 'inline',
    start(src) { return src.match(/\[\[/)?.index },
    tokenizer(src, tokens) {
        const match = src.match(rule)
        if (match) {
            return {
                type: 'wikilink',
                raw: this.lexer.inlineTokens(match[0].trim()),
                link: this.lexer.inlineTokens(match[2].trim()),
                title: this.lexer.inlineTokens(match[4].trim()),
            }
        }
    },
    renderer(token) {
        const uuid = sql`SELECT article_id FROM article_rev WHERE title LIKE '%${token.link || token.title}%' AND modification_author = NULL`
        return `<a href="/article/${uuid}">${this.parser.parseInline(token.title)}</a>`
    }
}

module.exports = wikiLink
