// document
//     .getElementById("calendarButton")
//     .addEventListener("submit", function (e) {
//         e.preventDefault();
//         let days = parseInt(document.getElementById("calendarLength").value);
//         let daysGenerated = 0;
//         let weeksGenerated = 0;
//         if (days >= 7 && days <= 31) {
//             while (daysGenerated != days) {
//                 if (daysGenerated % 7 == 0) {
//                     weeksGenerated++;
//                     let week = document.createElement("tr");
//                     week.id = "week" + weeksGenerated;
//                     document.getElementById("schedule-body").appendChild(week);
//                 }
//                 daysGenerated++;
//                 let day = document.createElement("td");
//                 day.id = "day" + daysGenerated;
//                 day.textContent = "Day " + daysGenerated;
//                 document
//                     .getElementById("week" + weeksGenerated)
//                     .appendChild(day);
//             }
//         }
//     });
