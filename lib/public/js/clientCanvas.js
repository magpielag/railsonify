
$('.stationForm').submit(function(event) {
  event.preventDefault(); // Stop the form from refreshing the page.
  // Post, THEN get.
  var formContents = $(this).val();
  function() {
    $.ajax({
      type: "POST",
      contentType: 'application/json',
      data: JSON.stringify(formContents),
      dataType: 'json',
      url: (window.location + '/')
    })
  }
  .then(function() {
    // Post to database -> Access database -> Make sure the data is received on the get?
    $.get((window.location + '/route'), function(data) {
      // Return route coordinates to be drawn here.
    });
  });
});

$('#playButton').click(function () {
  $('#playButton').attr('disabled', true) // Set the button to be disabled/off until playback is finished.
  $.get((window.location +  '/play'), function(data) {
    console.log(data)
    var data = JSON.parse(data)
    playJSON(data)
  })
})

$.ajax({
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(userCoords),
      dataType: 'json',
      url: (window.location + '/submit')
    })

// Solution:
var xhr = new XMLHttpRequest() xhr.open("POST", "myscript.php"); xhr.onload=function(event){ alert("The server says: " + event.target.response); }; var formData = new FormData(document.getElementById("myForm")); xhr.send(formData);
