export function getListItemTexts(htmlStr: string): string[] {
    const html = $("<div/>");
    html.html(htmlStr);
    const lis = html.find("ul > li");
    const textElements: string[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < lis.length; i++) {
        textElements.push($(lis[i]).text());
    }
    return textElements;
}
