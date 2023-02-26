let page = document.querySelector("body").dataset.page;
switch (page) {
  case "index":
    require("./home").default();
}
