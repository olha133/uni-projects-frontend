export default class ArticlesHandler {
    constructor() {
        this.file = null;
        this.image = null;
        this.noImageError = null;
        this.imageUrlInput = null;
        this.defaultImage = null;
        this.chooseImageButton = null;
        this.imgFileInput = null;
        this.formElements = null;
        this.form = null;
        this.articlePage = null;
        this.id = null;
        this.forCreation = false;
        this.commentsPage = null;
    }

    createImg() {
        const img = document.createElement("img");
        img.alt = "Image Preview";
        img.classList.add("preview-image");

        this.image = img;
    }

    resetImg(resetFully = false) {
        this.image.parentElement.removeChild(this.image);
        this.image = null;

        if (this.defaultImage && !resetFully) {
            this.createImg();
            this.insertImage(this.defaultImage, this.chooseImageButton);
            this.imageUrlInput.value = this.defaultImage;
        }
    }

    insertImage(data, element) {
        this.image.src = data;
        element.parentElement.insertBefore(this.image, element.nextSibling);
    }

    resetData() {
        for (const key of Object.keys(this)) this[key] = null;
    }

    setFormObserver(opinionsFormElmId, id, articlePage, creation = false, commentsPage) {
        this.resetData();

        this.imgFileInput = document.querySelector("#imgFileInput");
        this.chooseImageButton = document.querySelector("#chooseImageButton");
        this.noImageError = document.querySelector("#noImageError");
        this.imageUrlInput = document.querySelector("#imageLink1");
        this.id = id;
        this.articlePage = articlePage;
        this.forCreation = creation;
        // this.commentsPage = commentsPage;

        this.form = document.getElementById(opinionsFormElmId);
        this.formElements = this.form.elements;
        let googleData = localStorage.getItem(window.GOOGLE_OAUTH);

        if (googleData) {
            googleData = JSON.parse(googleData);
            this.formElements.namedItem("author").value = googleData.name;
        }
        if (this.imageUrlInput.value.length) {
            this.defaultImage = this.imageUrlInput.value;

            this.createImg();
            this.insertImage(this.imageUrlInput.value, this.chooseImageButton);
        }

        // events
        this.form.addEventListener("submit", (event) => this.processOpnFrmData(event));

        this.imgFileInput.addEventListener("change", (e) => {
            this.file = e.target.files[0];

            if (this.file) {
                const reader = new FileReader();

                if (this.image) this.resetImg(true);

                reader.addEventListener("load", () => {
                    this.noImageError.style.display = "none";

                    this.createImg();
                    this.insertImage(reader.result, this.chooseImageButton);
                });

                reader.readAsDataURL(this.file);
            }
        });

        document.querySelector("#btCancelFileUpload1").addEventListener("click", (e) => {
            this.resetImg();
            this.file = null;
        });

        document.querySelector("#btFileUpload1").addEventListener("click", (e) => {
            if (this.image == null || this.image.src === this.defaultImage || this.file == null) {
                this.noImageError.style.display = "block";
                return;
            }

            const formData = new FormData();
            formData.append("file", this.file);
            const apiUrl = new URL(`${TUKE_API}/api/fileUpload`);

            fetch(apiUrl, {
                method: "POST",
                body: formData,
            })
                .then((response) => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`));
                    }
                })
                .then((data) => {
                    if (data.fullFileUrl) {
                        this.imageUrlInput.value = data.fullFileUrl;
                    }
                });
        });

        document.querySelector("#btShowFileUpload1").addEventListener("click", (e) => {
            if (!this.imageUrlInput.checkValidity() || !this.imageUrlInput.value.length) return;

            const url = new URL(this.imageUrlInput.value);

            if (!url || url.href.length > 100) {
                alert("Image link must exist and must be less than 100!");
                return;
            }

            if (this.image) this.resetImg();
            this.createImg();
            this.insertImage(url.href, this.chooseImageButton);
        });
    }

    processOpnFrmData(event) {
        event.preventDefault();

        if (!this.form.checkValidity()) return;

        const articleData = {
            title: this.formElements.namedItem("title").value.trim(),
            content: this.formElements.namedItem("content").value.trim(),
            author: this.formElements.namedItem("author").value.trim(),
            imageLink: this.formElements.namedItem("imageLink").value.trim(),
            tags: this.formElements.namedItem("tags").value.trim(),
        };

        if (!(articleData.title && articleData.content)) {
            window.alert("Please, enter article title and content");
            return;
        }

        if (!articleData.author) {
            articleData.author = "Anonymous";
        }

        if (!articleData.imageLink) {
            delete articleData.imageLink;
        }

        articleData.tags = articleData.tags.split(",");
        articleData.tags = articleData.tags.filter((tag) => tag);
        articleData.tags = articleData.tags.map((tag) => tag.trim());

        if (!articleData.tags.includes(window.SITE_TAG)) articleData.tags = [window.SITE_TAG, ...articleData.tags];

        if (this.forCreation) {
            fetch(`${TUKE_API}/api/article`, {
                method: "POST",
                headers: { "Content-Type": "application/json;charset=utf-8" },
                body: JSON.stringify(articleData),
            })
                .then((data) => data.json())
                .then((data) => {
                    window.location.hash = `#articles`;
                })
                .catch(() => alert("Server error!"));
        } else {
            fetch(`${TUKE_API}/api/article/${this.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json;charset=utf-8" },
                body: JSON.stringify(articleData),
            })
                .then((data) => {
                    if (data.ok) alert(`You have successfully updated post with id ${this.id}`);
                    console.log("great");
                    window.location.hash = `#article/${this.id}/${this.articlePage}/${this.commentsPage}`;
                })
                .catch(() => alert("Server error!"));
        }
    }
}
