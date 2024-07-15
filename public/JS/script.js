document.getElementById("calendarButton").addEventListener("click", (e) => {
    e.preventDefault();
    let weeks = parseInt(document.getElementById("calendarLength").value);
    let daysGenerated = 0;
    let weeksGenerated = 0;
    if (weeks >= 1 && weeks <= 10 && !document.getElementById("day1")) {
        while (daysGenerated != weeks * 7) {
            if (daysGenerated % 7 == 0) {
                weeksGenerated++;
                let week = document.createElement("tr");
                week.id = "week" + weeksGenerated;
                document.getElementById("schedule-body").appendChild(week);
            }
            daysGenerated++;
            let day = document.createElement("td");
            day.id = "day" + daysGenerated;
            day.textContent = "Day " + daysGenerated;
            day.classList = "day-style";
            document.getElementById("week" + weeksGenerated).appendChild(day);
        }
        for (let i = 1; i < weeks * 7; i++) {
            let day = document.getElementById("day" + i);
            day.addEventListener("click", (e) => {
                e.preventDefault();
                let input = prompt("Plan your run for today!");
                if (day.children.length == 1 && input)
                    day.removeChild(day.children[0]);
                describedDay = document.createElement("div");
                describedDay.textContent = input;
                day.appendChild(describedDay);
            });
        }
    }
});
document.getElementById("resetButton").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("schedule-body").innerHTML = "";
});
document.getElementById("saveButton").addEventListener("click", (e) => {
    e.preventDefault();
    navigator.sendBeacon(
        "/save-calendar",
        new Blob(
            [
                JSON.stringify({
                    calendar:
                        document.getElementById("schedule-body").innerHTML,
                }),
            ],
            { type: "application/json" }
        )
    );
});
window.addEventListener("beforeunload", () => {
    navigator.sendBeacon(
        "/preserve-calendar",
        new Blob(
            [
                JSON.stringify({
                    calendar:
                        document.getElementById("schedule-body").innerHTML,
                }),
            ],
            { type: "application/json" }
        )
    );
});
document.addEventListener("DOMContentLoaded", () => {
    let i = 1;
    let day = document.getElementById("day" + i);
    while (day) {
        console.log(day);
        day.addEventListener("click", (e) => {
            console.log(e.currentTarget);
            e.preventDefault();
            let input = prompt("Plan your run for today!");
            if (e.currentTarget.children.length == 1 && input)
                e.currentTarget.removeChild(e.currentTarget.children[0]);
            describedDay = document.createElement("div");
            describedDay.textContent = input;
            e.currentTarget.appendChild(describedDay);
        });
        i++;
        day = document.getElementById("day" + i);
    }
});
