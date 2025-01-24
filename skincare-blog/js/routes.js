/*
 * routes definition and handling for paramHashRouter
 */
// import renderArticleComments from "./renderArticleComments.js";
import processOpnFrmData from "./addOpinion.js";
import renderArticle from "./renderArticle.js";

const TUKE_API = "https://wt.kpi.fei.tuke.sk";
const POSTS_PER_PAGE = 10;
window.TUKE_API = TUKE_API;
//an array, defining the routes
export default [

    {
        //the part after '#' in the url (so-called fragment):
        hash: "welcome",
        ///id of the target html element:
        target: "router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) => {
        const template = document.getElementById("template-welcome").innerHTML;
        let userData = localStorage.getItem(window.GOOGLE_OAUTH);

        if (userData) {
            userData = JSON.parse(userData);

            document.getElementById(targetElm).innerHTML = Mustache.render(template, {
                name: userData.name,
            });
        } else {
            document.getElementById(targetElm).innerHTML = Mustache.render(template, {
                name: null,
            });
        }
    },
    },
    {
        hash: "articles",
        target: "router-view",
        getTemplate(targetElm, currentPage = 1) {
            currentPage = parseInt(currentPage);

            document.getElementById(targetElm).innerHTML = document.getElementById("template-articles").innerHTML;

            const apiUrl = new URL(`${TUKE_API}/api/article?tag=${window.SITE_TAG}`);
            apiUrl.searchParams.append("offset", (currentPage - 1) * POSTS_PER_PAGE);
            apiUrl.searchParams.append("max", POSTS_PER_PAGE);

            fetch(apiUrl.href)
                .then((response) => response.json())
                .then((data) => {
                    const articles = data.articles;
                    const template = document.querySelector("#mustache-articles-template").innerHTML;
                    const maxPages = Math.ceil(data.meta.totalCount / POSTS_PER_PAGE);
                    for (let i = 0; i < articles.length; i++) {
                        let url = new URL(`${TUKE_API}/api/article/${articles[i].id}`);
                        articles[i].detailLink = `#article/${articles[i].id}/${currentPage}/1`;
                        fetch(url.href)
                            .then((data) => data.json())
                            .then((data) => {
                                articles[i].content = data.content;
                                if (i + 1 === articles.length) {
                                    document.querySelector("#articles-render-container").innerHTML = Mustache.render(template, {
                                        articles,
                                        currentPage,
                                        maxPages,
                                        prevPage: currentPage - 1 < 0 ? null : currentPage - 1,
                                        nextPage: currentPage + 1 > maxPages ? null : currentPage + 1,

                                    });

                                }
                            });
                    }
                });
        },
    },
    {
        hash: "artInsert",
        target: "router-view",
        getTemplate(targetElm, id, articlePage) {
            const template = document.querySelector("#article-input-template").innerHTML;

            document.getElementById(targetElm).innerHTML = Mustache.render(template, {
                backLink: "#welcome",
                submitBtTitle: "Create article",
            });

            setTimeout(() => window.articlesHandler.setFormObserver("articleForm1", id, articlePage, true));
        },
    },
    {
        hash: "opinions",
        target: "router-view",
        getTemplate: createHtml4opinions
    },
    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addOpinion").innerHTML;
            document.getElementById("opnFrm").onsubmit = processOpnFrmData;
        }
    },
    {
        hash: "article",
        target: "router-view",
        getTemplate(targetElm, id, articlePage) {
            renderArticle(...arguments, false);
        },
    },
    {
        hash: "articleEdit",
        target: "router-view",
        getTemplate(targetElm, id, articlePage, commentsPage) {
            renderArticle(...arguments, true);
        },
    },
    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle
    }

];

const urlBase = "https://wt.kpi.fei.tuke.sk/api";

function createHtml4opinions(targetElm) {
    const opinionsFromStorage = localStorage.myFeedback;
    let opinions = [];

    if (opinionsFromStorage) {
        opinions = JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            opinion.created = (new Date(opinion.created)).toDateString();
            opinion.willReturn =
                opinion.willReturn ? "I will return to this page." : "Sorry, one visit was enough.";
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );
}
function deleteArticle(targetElm, artIdFromHash, offsetFromHash, totalCountFromHash) {
    const URL = `${urlBase}/article/${artIdFromHash}`;
    const postReqSettings = //an object wih settings of the request
        {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
        };
    fetch(URL, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
        .then(response => {      //fetch promise fullfilled (operation completed successfully)
            if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                return response.json(); //we return a new promise with the response data in JSON to be processed
            } else { //if we get server error
                return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
            }
        })
        .catch(error => { ////here we process all the failed promises
            const errMsgObj = {errMessage: error};
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles-error").innerHTML,
                    errMsgObj
                );
        })
        .finally(() => window.location.href = `#articles/${offsetFromHash}/${totalCountFromHash}`);
}
