
var that = this;
that.center = new google.maps.LatLng(38.9055751, -77.0611825);
that.map = new google.maps.Map(document.getElementById('map-canvas'),
    {
        center: that.center,
        zoom: 15
    });

function getData(url)
{
    $.getJSON(url)

        .done(function(data)
        {
            alert(data)
        })
        .fail(function()
        {
            alert("Ajax failed to fetch data")
        })
}

function placeMarkers()
{
    var url = document.getElementById("dataURL").value;
    var data = getData(url);
    var markers = [];


    for(var x = 0; x < data.length; x++)
    {
        var current = data[x];

        var marker = new google.maps.Marker
        (
            {
                map: that.map,
                title: x,
                position: getLatLng(current)
            }
        );

        markers.push(marker);
    }



    function getLatLng(data)
    {

    }
}
