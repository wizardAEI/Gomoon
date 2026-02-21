export function decorateContent(c, max = 50) {
    if (c.length > max) {
        return c.slice(0, max) + ' ......';
    }
    return c;
}
