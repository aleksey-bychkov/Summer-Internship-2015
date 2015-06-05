
var that = this;
that.center = new google.maps.LatLng(38.9055751, -77.0611825);
that.map = new google.maps.Map(document.getElementById('map-canvas'),
    {
        center: that.center,
        zoom: 15
    });

//returns an array
function getData(url)
{
    $.ajax(
        {
            url: url,
            jsonp: "callback",
            dataType: "jsonp",
            success: function(data)
            {
                return data;
            },
            error: function ()
            {
                alert("Failed to retrieve data!");
            }
        });
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
                color: red,
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
