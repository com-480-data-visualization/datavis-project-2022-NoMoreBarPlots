/* When the user clicks on the button,
toggle between hiding and showing the dropdown content
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

function filterFunction() {
  var input, filter, ul, li, a, i;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  div = document.getElementById("myDropdown");
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    txtValue = a[i].textContent || a[i].innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}
*/


var energyObject = {
  "Hydro-1": ["Electricity - total hydro production", "Operators", "Functions", "Conditions"],
  "Back-end": ["SELECT", "UPDATE", "DELETE"]
}
window.onload = function() {
  var energy = document.getElementById("EnergySelect");
  var transaction = document.getElementById("TransactionSelect");
  for (var x in energyObject) {
    energy.options[energy.options.length] = new Option(x, x);
  }
  energy.onchange = function() {
    transaction.length = 1;
    var z = energyObject[energy.value];
    for (var i = 0; i < z.length; i++) {
      transaction.options[transaction.options.length] = new Option(z[i], z[i]);
    };
  };
};


// Start Viz button
$(document).ready(function () {
    $('#StartViz2').on('click', function () {
			let energy = document.getElementById("EnergySelect").value;
			if (energy == 'None') {alert("Select energy")}
      let transaction = document.getElementById("TransactionSelect").value;
			let continentsSelected = $.map($('input:checkbox:checked'), function(e, i) {return e.value;});
			bubblesChart(energy, transaction, continentsSelected);
  });
});
