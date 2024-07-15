// document.getElementById("calendarButton").addEventListener("click", (e) => {
//     e.preventDefault();
//     let weeks = parseInt(document.getElementById("calendarLength").value);
//     let daysGenerated = 0;
//     let weeksGenerated = 0;
//     if (weeks >= 1 && weeks <= 10 && !document.getElementById("day1")) {
//         while (daysGenerated != weeks * 7) {
//             if (daysGenerated % 7 == 0) {
//                 weeksGenerated++;
//                 let week = document.createElement("tr");
//                 week.id = "week" + weeksGenerated;
//                 document.getElementById("schedule-body").appendChild(week);
//             }
//             daysGenerated++;
//             let day = document.createElement("td");
//             day.id = "day" + daysGenerated;
//             day.classList = "day-style";
//             let dayHeader = document.createElement("div");
//             dayHeader.classList = "day-header";
//             dayHeader.id = "day" + daysGenerated + "-header";
//             dayHeader.textContent = "Day " + daysGenerated;
//             day.appendChild(dayHeader);
//             let dayContent = document.createElement("div");
//             dayContent.classList = "day-content";
//             dayContent.id = "day" + daysGenerated + "-content";
//             day.appendChild(dayContent);
//             document.getElementById("week" + weeksGenerated).appendChild(day);
//         }
//         for (let i = 1; i < weeks * 7; i++) {
//             let day = document.getElementById("day" + i);
//             day.addEventListener("click", (e) => {
//                 e.preventDefault();
//                 let input = prompt("Plan your run for today!");
//                 while (input === "") input = prompt("Plan your run for today!");
//                 if (input) {
//                     console.log(input);
//                     day.children[1].textContent = input;
//                 }
//             });
//         }
//     }
// });
// document.getElementById("resetButton").addEventListener("click", (e) => {
//     e.preventDefault();
//     document.getElementById("schedule-body").innerHTML = "";
// });
// document.getElementById("saveButton").addEventListener("click", (e) => {
//     e.preventDefault();
//     navigator.sendBeacon(
//         "/save-calendar",
//         new Blob(
//             [
//                 JSON.stringify({
//                     calendar:
//                         document.getElementById("schedule-body").innerHTML,
//                 }),
//             ],
//             { type: "application/json" }
//         )
//     );
// });
// window.addEventListener("beforeunload", () => {
//     navigator.sendBeacon(
//         "/preserve-calendar",
//         new Blob(
//             [
//                 JSON.stringify({
//                     calendar:
//                         document.getElementById("schedule-body").innerHTML,
//                 }),
//             ],
//             { type: "application/json" }
//         )
//     );
// });
// document.addEventListener("DOMContentLoaded", () => {
//     let i = 1;
//     let day = document.getElementById("day" + i);
//     while (day) {
//         console.log(day);
//         day.addEventListener("click", (e) => {
//             e.preventDefault();
//             let input = prompt("Plan your run for today!");
//             while (input === "") input = prompt("Plan your run for today!");
//             if (input) {
//                 console.log(input);
//                 e.currentTarget.children[1].textContent = input;
//             }
//         });
//         i++;
//         day = document.getElementById("day" + i);
//     }
// });
