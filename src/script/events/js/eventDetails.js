import eventData from "../eventData.json";

const eventList = [...document.querySelectorAll("li")];

const eventName = document.querySelector("#event-heading");
const eventDescription = document.querySelector("#event-description");
console.log(eventName.innerText);
eventList.forEach((link, idx) => {
  link.addEventListener("mouseenter", () => {
    // console.log(eventData.data);
    eventName.innerText = eventData.data[idx].eventName;
    eventDescription.innerText = eventData.data[idx].eventDescription;
  });
});
