document.addEventListener("change", () => {
    let msg = document.getElementById("errorMsg");
    msg.style.display = "none";
    if (
        document.getElementById("password").value ===
        document.getElementById("confirmPassword").value
    )
        msg.style.display = "none";
    else msg.style.display = "block";
});
