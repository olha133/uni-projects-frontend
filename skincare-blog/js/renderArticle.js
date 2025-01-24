import renderArticleComments from "./renderArticleComments.js";

export default (targetElm, id, articlePage, commentsPage, forEdit = false) => {
    commentsPage = parseInt(commentsPage);
    let apiUrl = new URL(`${TUKE_API}/api/article/${id}`);

    fetch(apiUrl)
        .then((data) => data.json())
        .then((data) => {
            if (forEdit) {
                const template = document.querySelector("#article-input-template").innerHTML;

                document.getElementById(targetElm).innerHTML = Mustache.render(template, {
                    ...data,
                    backLink: `#article/${id}/${articlePage}/${commentsPage}`,
                    submitBtTitle: "Update article",
                });

                setTimeout(() => window.articlesHandler.setFormObserver("articleForm1", id, articlePage, false, commentsPage));
            } else {
                const template = document.querySelector("#template-article").innerHTML;

                document.getElementById(targetElm).innerHTML = Mustache.render(template, {
                    ...data,
                    backLink: `#articles/${articlePage}`,
                    articleEditLink: `#articleEdit/${id}/${articlePage}/${commentsPage}`,
                    articleDeleteLink: `#artDelete/${id}/${articlePage}`,
                });

                renderArticleComments(`${TUKE_API}/api/article/${id}`, `#article/${id}/${articlePage}`, commentsPage);

                setTimeout(() => {
                    window.commentsHandler.setFormObserver("commentsForm", id, articlePage, commentsPage);
                    window.commentsHandler.bindAddCallback(() => {
                        renderArticleComments(`${TUKE_API}/api/article/${id}`, `#article/${id}/${articlePage}`, commentsPage);
                    });
                });
            }
        });
};
