export default class CommentsHandler {
    constructor() {
        this.addCallback = null;
    }

    setFormObserver(formElemId, id, articlePage) {
        const form = document.getElementById(formElemId);

        let googleData = localStorage.getItem(window.GOOGLE_OAUTH);

        if (googleData) {
            googleData = JSON.parse(googleData);
            form.elements.namedItem("login").value = googleData.name;
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            const author = form.elements.namedItem("login").value.trim();
            const text = form.elements.namedItem("message").value.trim();
            let apiUrl = new URL(`${TUKE_API}/api/article/${id}/comment`);

            fetch(apiUrl, {
                method: "POST",
                body: JSON.stringify({ text, author }),
                headers: { "Content-Type": "application/json;charset=utf-8" },
            }).then(() => {
                if (this.addCallback) {
                    this.addCallback();
                    form.elements.namedItem("message").value = "";
                }
            });
        });
    }

    bindAddCallback(callback) {
        this.addCallback = callback;
    }

    resetData() {
        for (const key of Object.keys(this)) this[key] = null;
    }
}