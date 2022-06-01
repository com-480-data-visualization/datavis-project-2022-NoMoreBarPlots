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

// Start Viz button
$(document).ready(function () {
    $('#StartViz2').on('click', function () {
			let Energy1 = document.getElementById("EnergySelect1").value;
			if (Energy1 == 'None') {alert("Select energy")}
			let Energy2 = document.getElementById("EnergySelect2").value;
			let Operation = document.getElementById("OperationSelect").value;
			let ContinentsSelected = $.map($('input:checkbox:checked'), function(e, i) {return e.value;});
			let highlight = document.getElementById("HighlightSelect").value;
      let Date = document.getElementById("myRange").value;
      
      PlotBubbleChart();
			bubblesChart(Energy1, Energy2, Operation, ContinentsSelected, highlight, Date);
  });
});
