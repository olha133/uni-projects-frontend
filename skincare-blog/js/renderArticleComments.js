const COMMENTS_MAX = 10;

export default (apiUrl, workingUrl, commentsPage) => {
    const template = document.getElementById("comments-template").innerHTML;
    const renderElement = document.getElementById("article-comments-container");
    const reqUrl = new URL(`${apiUrl}/comment?offset=${(commentsPage - 1) * COMMENTS_MAX}&max=${COMMENTS_MAX}`);

    fetch(reqUrl.href)
        .then((data) => data.json())
        .then((res) => {
            const pages = Math.ceil(res.meta.totalCount / COMMENTS_MAX);
            const nextPage = commentsPage + 1 <= pages ? `${workingUrl}/${commentsPage + 1}` : null;
            const prevPage = commentsPage - 1 >= 1 ? `${workingUrl}/${commentsPage - 1}` : null;

            renderElement.innerHTML = Mustache.render(template, {
                commentsPerPage: COMMENTS_MAX,
                comments: res.comments,
                nextPage,
                prevPage,
            });
        });
};