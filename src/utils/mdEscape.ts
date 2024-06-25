import markdownEscape from 'markdown-escape';
export const mdEscape = (input: string | undefined) => {
    return markdownEscape(input ?? 'undefined');
}