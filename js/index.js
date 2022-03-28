window.addEventListener("load", () => {
  const form = document.querySelector("form");
  const name1 = document.querySelector("#name1");
  const cost = document.querySelector("#cost");
  const error = document.querySelector("#error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    error.textContent = "";

    if (name1.value && cost.value) {
      const item = {
        name: name1.value,
        cost: parseInt(cost.value),
      };
      db.collection("expenses")
        .add(item)
        .then((res) => {
          name1.value = "";
          cost.value = "";
        });
    } else {
      error.textContent = "Please Enter values before submitting";
    }
  });
});
