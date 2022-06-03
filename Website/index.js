// Skip intro button on click
$(document).ready(function () {
    $('#skipIntro').on('click', function () {
			startIntro.classList.add("hide");
      intro_text1.classList.add("fast_show");
			intro_text2.classList.add("fast_show");
			intro_text3.classList.add("fast_show");
			intro_video.classList.add("fast_show");
  });
});

// Start intro button on click
$(document).ready(function () {
    $('#startIntro').on('click', function () {
			startIntro.classList.add("hide");
      intro_text1.classList.add("show");
			intro_text2.classList.add("show");
			intro_text3.classList.add("show");
			intro_video.classList.add("show");
  });
});
