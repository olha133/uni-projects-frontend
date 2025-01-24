import Router from "./paramHashRouter.js";
import Routes from "./routes.js";
import ArticlesHandler from "./articlesHandler.js";
import DropdownMenuControl from "./dropdownMenuControl.js";
import CommentsHandler from "./commentsHandler.js";

window.SITE_TAG = "skincare";
window.GOOGLE_OAUTH = "google-auth";

window.drMenuCntrl = new DropdownMenuControl("menuIts", "menuTitle", "mnShow");
// window.router = new Router(Routes,"welcome");
window.addEventListener("load", () => {
    window.router = new Router(Routes, "welcome");
    window.articlesHandler = new ArticlesHandler();
    window.commentsHandler = new CommentsHandler();
    const logOutButton = document.querySelector("#log-out-button");

    logOutButton.addEventListener("click", () => {
        localStorage.removeItem(window.GOOGLE_OAUTH);
        logOutButton.style.display = "none";

        google.accounts.id.renderButton(document.getElementById("google_auth_button"), { theme: "outline", size: "large" });
    });
});
