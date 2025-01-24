function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

window.onGoogleLibraryLoad = () => {
  google.accounts.id.initialize({
    client_id: "240063849149-a6svl8g1s5urm8o52738gjsc7p3gcakr.apps.googleusercontent.com",
    callback: (response) => {
      localStorage.setItem(window.GOOGLE_OAUTH, JSON.stringify(parseJwt(response.credential)));
      document.querySelector("#log-out-button").style.display = "flex";
      document.getElementById("google_auth_button").innerHTML = "";
    },
  });

  if (localStorage.getItem(window.GOOGLE_OAUTH)) {
    document.querySelector("#log-out-button").style.display = "flex";
  } else {
    google.accounts.id.renderButton(document.getElementById("google_auth_button"), { theme: "outline", size: "large" });
  }
};
