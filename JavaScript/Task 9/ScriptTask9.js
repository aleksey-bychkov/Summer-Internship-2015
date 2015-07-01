function makePage()
{
    var publicAPI =
    {
        clearMap: clearMap,
        replaceBusList: replaceBusList,
        updateShowingOnlyNextBus: updateShowingOnlyNextBus,
        setServerAddress: setServerAddress,
        setMap: setMap,
        setNextBusImage: setNextBusImage,
        setTransitIQImage: setTransitIQImage,
        setTime: setTime,
        setProgressBar: setProgressBar
    };

    var map;
    var showingOnlyNextBus = false;
    var transitIQImage = 'transitIQ.png';
    var nextBusImage = 'nextBus.png';
    var allMarkers = [];
    var buses = [];
    var infoWindow;
    var endDate = new Date();
    var startDate = new Date(endDate.getTime() - (60 * 60 * 1000));
    var $progressbar;

    var url =
    {
        markerList: "http://transitiqdatareceiver.cloudapp.net/DataReceiver.svc/GetRawCoords",
        busList: "http://transitiqapi.cloudapp.net/Service.svc/VehiclesListForServiceDate",
        key: "DcCi",
        markerURL: function markerURL(fromUTC, toUTC, vehicleId)
        {
            return url.markerList + "?vehicleId=" + vehicleId + "&key=" + url.key + "&toUtc=" + (toUTC.toJSON()).substr(0,19) + "&fromUtc=" + (fromUTC.toJSON()).substr(0,19) + "&format=json";
        },
        busListURL: function busListURL(date)
        {
            return url.busList + "?orgId=" + url.key + "&serviceDate=" + date.toJSON().substr(0,10) + "&inServiceOnly=true&activeDevicesOnly=true&format=json";
        }
    };

    return publicAPI;

    //updates the location of the from where the location is retrived
    function setServerAddress(pmarkerList, pkey, pbusList)
    {
        url.markerList = pmarkerList;
        url.busList = pbusList;
        url.key = pkey;
    }

    //sets the time for the
    function setTime(pendTime, pstartTime)
    {
        endDate = pendTime;
        startDate = pstartTime;

        clearMap()
    }

    //sets up the $progressbar veariable to the paramater
    function setProgressBar(pProgressBarID)
    {
        $progressbar = $("#" + pProgressBarID);
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

    //when calles changes ShowingOnlyNextBus calls shows and returns the new ShowingOnlyNextBus value
    function updateShowingOnlyNextBus(checkBox)
    {
        showingOnlyNextBus = checkBox.checked;
        show();
    }

    //adds a list of all the active buses to the elementToReplaceID
    function replaceBusList(elementToReplaceID)
    {
        $.ajax(
            {
                url: url.busListURL((new Date())),
                jsonp: "callback",
                dataType: "jsonp",
                success: function(data)
                {
                    $("#" + elementToReplaceID).replaceWith(makeBusList(data));
                },
                error: function ()
                {
                    alert("Failed to retrieve info!");
                }
            });

        //adds all the data to to the element with the ID of "addElementID"
        function makeBusList(data)
        {
            var $BusList = $("<ul>",
            {
                id: "BusList" + (new Date()).toJSON()
            });

            for(var index = 0; index < data.length; index++)
            {
                (function addBus()
                {
                    var current = data[index];

                    //List element added to the page
                    var $bus = $("<li>",
                    {
                        id: current.VehicleId
                    });

                    //checkbox for the page
                    var $checkbox= $(document.createElement('input')).attr(
                    {
                        id:    "cb" + current.VehicleId,
                        type:  'checkbox'
                    });

                    //adds the checkbox to the element along with the mane of the element
                    $bus.append($checkbox);
                    $bus.append(current.VehicleType+ " " + current.VehicleId);

                    //element added to buses array
                    var toAdd =
                    {
                        busNumber: current.VehicleId,
                        bounds: new google.maps.LatLngBounds(),
                        markers: [],
                        made: false
                    };

                    $bus.click(function onClick()
                    {

                        //if the markers have already been made turns them on
                        if(!toAdd.made && $(toAdd.checkBox).is(":checked"))
                        {
                            //places the markers
                            var temp = placeLotsOfMarkers(startDate, endDate, 900000, current.VehicleId);

                            //updates toAdd's markers and bounds
                            toAdd.markers = temp.markers;
                            toAdd.bounds = temp.bounds;

                            toAdd.made = true;
                        }
                        else
                        {
                            infoWindow = undefined;

                            //iterates throught the markers and applies and sets the visavility on the status of the checkboxs checked status
                            for (var markerIndex = 0; markerIndex < toAdd.markers.length; markerIndex++)
                            {
                                (function ()
                                {
                                    if(showingOnlyNextBus)
                                    {
                                        if(toAdd.markers[markerIndex].icon.url === transitIQImage)
                                            toAdd.markers[markerIndex].setVisible(false);
                                        else
                                            toAdd.markers[markerIndex].setVisible($(toAdd.checkBox).is(":checked"));
                                    }
                                    else
                                    {
                                        toAdd.markers[markerIndex].setVisible($(toAdd.checkBox).is(":checked"));
                                    }
                                }());
                            }

                            updateBounds();
                        }


                    });

                    //adds the current bus to the array of buses
                    buses.push(toAdd);

                    toAdd.checkBox = $checkbox;

                    //adds the list item to the $BusList
                    $BusList.append($bus);
                })();
            }

            return $BusList
        }
    }

    //places markers from pStartDate to pEndDate with the VehicleId of pVehicleId on the map getting stuff from the server with interval(in milisecounds)
    function placeLotsOfMarkers(pstartDate, pendDate, interval, vehicleId)
    {
        var bounds = new google.maps.LatLngBounds();
        var numIntervals = (pendDate.getTime() - pstartDate.getTime()) / interval;
        var currentInterval = 0;
        var markers = [];

        $progressbar.progressbar("value", 0);


        placeIncrementOfMarkers(interval, pstartDate, new Date(pstartDate.getTime() + interval));

        return {
            bounds: bounds,
            markers: markers
        };

        function placeIncrementOfMarkers(pinterval, pstartTime, pendTime)
        {
            if(pendTime.getTime() <= endDate.getTime())
            {
                $.ajax(
                    {
                        url: url.markerURL(pstartTime, pendTime, vehicleId),
                        jsonp: "callback",
                        dataType: "jsonp",
                        success: function (info)
                        {
                            placeInformation(info, (25 * currentInterval) / numIntervals);


                            $progressbar.progressbar("value", (($progressbar.progressbar("value")) + 100/numIntervals));

                            pstartTime = pendTime;
                            pendTime = new Date(pstartTime.getTime() + pinterval);
                            currentInterval++;

                            updateBounds();

                            placeIncrementOfMarkers(pinterval, pstartTime, pendTime);
                        },
                        error: function ()
                        {
                            alert("Failed to retrieve info!");
                        }
                    });
            }

            function placeInformation(information, size)
            {
                var latlng;

                //iterates through the array of information
                for (var index = information.length - 1; index >= 0; index--) {
                    (function makeMarkers() {

                        //makes a local variable of data that is being used
                        var current = information[index];

                        //grabs the location for the marker from current and adds it to the bounds of the map
                        latlng = new google.maps.LatLng(current.Lat, current.Lon);
                        bounds.extend(latlng);

                        //calculates the size diffrence between every data point
                        var mSize = ((index * size) / information.length) + 10;

                        //makes the marker
                        var marker = new google.maps.Marker
                        (
                            {
                                visible: true,
                                map: map,
                                title: allMarkers.length + "",
                                position: latlng,
                                information: current,
                                zIndex: 5,
                                icon: {
                                    url: transitIQImage,
                                    size: new google.maps.Size(mSize, mSize),
                                    origin: new google.maps.Point(mSize / 2, mSize / 2)
                                }
                            }
                        );

                        //checks if its a nextbus ping or a transit IQ ping
                        if(current.DeviceId == null)
                        {
                            marker.zIndex = 10;
                            marker.icon.url = nextBusImage;
                        }

                        //if its showing only nextBus then turns the visabilty of transit IQ pins to false
                        if(showingOnlyNextBus)
                            if(current.DeviceId != null)
                                marker.visible = false;

                        //makes the info window
                        var time = current.ReportDateUtc;
                        time = time.substring(time.indexOf("(") + 1, time.indexOf(")"));
                        time = new Date(parseInt(time));

                        //infoWindow contect for the current marker
                        var content = '<div id="content">' +
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

                        //makes the infoWindow operatable
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

                            //binds the infoWindow to the marker & the map
                            infoWindow.open(map, marker);
                        });

                        //adds the markers to the total markers on the map and the array of markers added
                        markers.push(marker);
                        allMarkers.push(marker);
                    })();
                }
            }
        }
    }

    //updates the bounds of the map according to all the checked buses
    function updateBounds()
    {
        //makes the bounds work
        var bounds = new google.maps.LatLngBounds();

        //goes through all the buses and extends the bounds of the map to include them IF they aren't the default bounds
        for(var x = 0; x < buses.length; x++)
        {
            if(buses[x].made && $(buses[x].checkBox).is(":checked"))
            {
                if (!buses[x].bounds.equals(new google.maps.LatLngBounds()))
                    bounds.union(buses[x].bounds);
            }
        }

        //resets the bounds
        map.fitBounds(new google.maps.LatLngBounds(null));

        //set the bounds on the bounds of the markers OR on the whitehouse if default bounds
        if(!bounds.equals(new google.maps.LatLngBounds()))
            map.fitBounds(bounds);
        else
        {
            map.panTo(new google.maps.LatLng(38.8977, -77.0366));
            map.setZoom(15);
        }
    }

    //Makers sure the visible markers are corresponding to the status of showingOnlyNextBus
    function show()
    {
        //checks the buses first
        for(var index=0; index < buses.length; index++)
        {
            //if the bus is checked checks for next bus markers
            if($(buses[index].checkBox).is(":checked"))
            {
                for(var x = 0; x < buses[index].markers.length; x++)
                {
                    (function()
                    {
                        var current =  buses[index].markers[x];

                        //if showingOnlyNextBus then makes sure only the markers that are supposed to be shown are shown
                        //otherwise shows all markers
                        if(showingOnlyNextBus)
                        {
                            if(current.icon.url === transitIQImage)
                                current.setVisible(false);
                            else
                                current.setVisible(true);
                        }
                        else
                        {
                            current.setVisible(true);
                        }
                    }());
                }
            }
        }
    }

    //clears the map of all allMarkers
    function clearMap()
    {
        //destroys all association between markers and the map
        for(var i = 0; i < allMarkers.length; i++)
        {
            allMarkers[i].setMap(null);
        }

        //destroys all association between markers and the map from there secondary location
        for(var index=0; index < buses.length; index++)
        {
            for(var x = 0; x < buses[index].markers.length; x++)
            {
                (function()
                {
                    buses[index].markers[x].setMap(null);
                }());
            }

            buses[index].markers = [];
            $(buses[index].checkBox).prop('checked', false);
            buses[index].made = false;
        }

        allMarkers = [];
        infoWindow = undefined;
    }
}