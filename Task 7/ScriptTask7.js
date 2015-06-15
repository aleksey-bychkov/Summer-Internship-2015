function doThings()
{
    var publicAPI =
    {
        placeMarkers: placeMarkers,
        clearMarkers: clearMap,
        addListToElement: addListToElement,
        updateTime: updateTime,
        updateDate: updateDate,
        updateVehicleId: updateVehicleId,
        updateShowingOnlyNextBus: updateShowingOnlyNextBus,
        setBase: setBase,
        setMap: setMap,
        setNextBusImage: setNextBusImage,
        setTransitIQImage: setTransitIQImage
    };

    var map;
    var showingOnlyNextBus = false;
    var transitIQImage = 'transitIQ.png';
    var nextBusImage = 'nextBus.png';
    var markers = [];
    var url =
    {
        markers: "http://transitiqdatareceiver.cloudapp.net/DataReceiver.svc/GetRawCoords",
        busList: "http://transitiqapi.cloudapp.net/Service.svc/VehiclesListForServiceDate",
        vehicleId: "",
        key: "DcCi",
        currentDate: (new Date()).toJSON().substr(0,10),
        toUTC: new Date(),
        fromUTC: new Date(),
        markerURL: function markerURL()
        {
            return this.markers + "?vehicleId=" + this.vehicleId + "&key=" + this.key + "&toUtc=" + (this.toUTC.toJSON()).substr(0,19) + "&fromUtc=" + (this.fromUTC.toJSON()).substr(0,19) + "&format=json";
        },
        busListURL: function busListURL()
        {
            return this.busList + "?orgId=" + this.key + "&serviceDate=" + this.currentDate + "&inServiceOnly=true&activeDevicesOnly=true&format=json";
        }
    };

    return publicAPI;

    //updates the variables inside.
    function setBase(pmarkers, pkey, pbusList)
    {
        url.markers = pmarkers;
        url.key = pkey;
        url.busList = pbusList;
    }

    //sets the map the the paramater map
    function setMap(pmap)
    {
        map = pmap;
    }

    //sets the image for the marker that show that the DeviceID is null
    function setNextBusImage(pmarkerImage)
    {
        nextBusImage = pmarkerImage;
    }

    //sets the image for the marker that show that the DeviceID isn't null
    function setTransitIQImage(pmarkerImage)
    {
        transitIQImage = pmarkerImage;
    }

    //sets the VehicleId to the paramater
    function updateVehicleId(pvehicleId)
    {
        url.vehicleId = pvehicleId;
    }

    //updates the date to the current date
    function updateDate()
    {
        this.currentDate = (new Date()).toJSON().substr(0,10);
    }

    //updates the time you want to grab things from
    function updateTime(ptoUTC, pfromUTC)
    {

        url.toUTC = ptoUTC;
        url.fromUTC = pfromUTC;
    }

    //when calles changes ShowingOnlyNextBus calls shows and returns the new ShowingOnlyNextBus value
    function updateShowingOnlyNextBus()
    {
        showingOnlyNextBus = !showingOnlyNextBus;
        show();
        return showingOnlyNextBus;
    }

    //adds a list of all the active buses to the toAddToElementID
    function addListToElement(toAddToElementID, timeElementID)
    {
        $.ajax(
            {
                url: url.busListURL(),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    if(data.length >= 1)
                        addAll(toAddToElementID, timeElementID, data);
                    else
                    {
                        alert("No buses");
                    }

                },
                error: function ()
                {
                    alert("Failed to retrieve info!");
                }
            });


        function addAll(addElementID, timeID, data)
        {
            for(var index = 0; index < data.length; index++)
            {
                (function addBuses()
                {
                    var current = data[index];
                    var busListNode = document.createElement("li");
                    busListNode.id = current.VehicleType + ":" + current.VehicleId;

                    var bus = document.createTextNode(current.VehicleType+ " " + current.VehicleId);
                    busListNode.className = "notSelected";

                    busListNode.appendChild(bus);

                    busListNode.onclick = function onClick()
                    {

                        var old = $(document.getElementById(addElementID)).find(".selected");
                        for(var x=0; x<old.length; x++)
                        {
                            old[x].className = "notSelected";
                        }

                        busListNode.className = "selected";

                        updateVehicleId(current.VehicleId);
                        updateTime((new Date()), new Date((new Date()).getTime() - (document.getElementById(timeID).value) * 60000));
                        placeMarkers();
                    };

                    document.getElementById(addElementID).appendChild(busListNode);
                })();
            }
        }
    }

    //if showingOnlyNextBus is true then only shows showingOnlyNextBus
    function show()
    {
        if(showingOnlyNextBus)
        {
            showWhat(nextBusImage);
        }
        else
        {
            showWhat();
        }

        //if image is undefined shows all images. Otherwise only shows the paramater
        function showWhat(image)
        {
            for(var index = 0; index < markers.length; index++)
            {
                var current = markers[index];

                if(image == undefined)
                    current.setMap(map);
                else
                {
                    if(current.icon.url === image)
                        current.setMap(map);
                    else
                        current.setMap(null);
                }

            }
        }
    }

    //public method that places markers on the map using the information it has
    function placeMarkers()
    {
        clearMap();

        $.ajax(
            {
                url: url.markerURL(),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    if(data.length >= 1)
                        place(data);
                    else
                    {
                        alert("Data was empty");
                    }

                },
                error: function ()
                {
                    alert("Failed to retrieve info!");
                }
            });

        //takes in an array of JSON objects and adds makers on a map based off of the array
        function place(information)
        {
            markers = [];
            map.fitBounds(new google.maps.LatLngBounds(null));

            var infoWindow;
            var size = 30;
            var bounds = new google.maps.LatLngBounds(null);
            var latlng;

            for(var index = information.length-1; index >= 0; index--)
            {
                (function makeMarkers()
                {
                    var current = information[index];
                    var markerImage = transitIQImage;

                    latlng = new google.maps.LatLng(current.Lat, current.Lon);

                    bounds.extend(latlng);

                    var mSize = (index * size)/information.length;

                    if(current.DeviceId == null)
                        markerImage= nextBusImage;

                    var image = {
                        url: markerImage,
                        // This marker is 20 pixels wide by 32 pixels tall.
                        size: new google.maps.Size(mSize, mSize),
                        // The origin for this image is 0,0.
                        origin: new google.maps.Point(mSize/2,mSize/2)
                    };

                    //makes the markers
                    var marker = new google.maps.Marker
                    (
                        {
                            map: map,
                            icon: image,
                            title: index+"",
                            position: latlng
                        }
                    );

                    var time = current.ReportDateUtc;
                    time = time.substring(time.indexOf("(")+1, time.indexOf(")"));
                    time = new Date(parseInt(time));

                    var content = '<div id="content">' +
                        '<div id="siteNotice">' +
                        '</div>' +
                        '<h1 id="firstHeading" class="firstHeading"></h1>' +
                        '<div id="bodyContent">' +
                        '<table>' +
                        '<tr>' +
                        '<th>Agency Id</th><td>' + current.AgencyId + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Device Id</th><td>' + current.DeviceId + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Is Standing</th><td>' + current.IsStanding + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Location</th><td>' + latlng.toString() + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Vehicle Id</th><td>' + current.VehicleId + '</td>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Time</th><td>' + time + '</td>' +
                        '</tr>' +
                        '</table>' +
                        '</div>' +
                        '</div>';

                    google.maps.event.addListener(marker, 'click', function makeWindows()
                    {
                        //closes infoWindow if one exists
                        if (infoWindow)
                            infoWindow.close();

                        //makes and opens a new infoWindow for the current marker
                        infoWindow = new google.maps.InfoWindow
                        (
                            {
                                content: content
                            }
                        );

                        //binds the infoWindow to the marker&map
                        infoWindow.open(map, marker);
                    });

                    //adds the markers
                    markers.push(marker);
                })();
            }

            map.fitBounds(bounds);
            show();
        }
    }

    //clears the map of all markers
    function clearMap()
    {
        for(var i = 0; i < markers.length; i++)
        {
            markers[i].setMap(null);
        }

        markers = [];
    }
}