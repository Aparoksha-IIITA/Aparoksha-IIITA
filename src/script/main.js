let page = document.querySelector("body").dataset.page;
switch (page) {
  case "index":
    require("./home").default();
    break;
  case "events":
    require("./events").default();
    break;
  case "gallery":
    require("./gallery").default();
    break;
}
