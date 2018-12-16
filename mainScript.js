/* mainScript.js
   Project 2 (ISTE 754)
   Created by Sankarsh Vittal
*/

var url = "https://people.rit.edu/dmgics/754/23/proxy.php";
var MYAPP = MYAPP || {};  // For incorporating the modular pattern
MYAPP.mainScript = (function() {

/* function used to return a dropdown list containing all the organization types*/
  getOrgTypes = function() {
    $.ajax({
        type: "GET",
        async: true,
        cache: false,
        url: url,
        data: {
            path: "/OrgTypes"
        },
        dataType: "xml",
        success: function(data) {
        var opts = "";
          if(!($(this).checkErrors(data))){ //makes use of the plugin to check for errors
                opts += "<option value=''>All Organization Types</option>";
                $("row", data).each(function() {
                    opts += "<option value='" + $("type", this).text() + "'>" + $("type", this).text() + "</option>";
                });

                $("#orgType").html(opts);
          }
        }

    });
};

/*function used to return a dropdown list of cities based on the state.*/
showResults = function() {
    $.ajax({
        url: url,
        data: {
            path: "/Organizations?" + $('#search-form').serialize()
        },
        success: function(data) {
            var output = "";
            $("#tableOutput").html(" ");
              if(($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                output += "<h4> No matches found !</h4>";
                $("#tableOutput").html(output);
           } else {
                output += `<table id="results-table" class="display" style="width:100%">
                              <thead>
                                  <tr>
                                      <th>Type</th>
                                      <th>Name</th>
                                      <th>Email</th>
                                      <th>City</th>
                                      <th>State</th>
                                      <th>County</th>
                                      <th>Zip</th>
                                  </tr>
                              </thead>`;

                $("row", data).each(function() {
                    output += `<tr>
                                     <td>` + $(this).find("type").text() + `</td>
                                     <td id='ajax'>` + "<a href='javascript:getTabs(" + $(this).find('OrganizationID').text() + ")'>" + $("Name", this).text() + "</a>" + `</td>
                                     <td>` + $("Email", this).text() + `</td>
                                     <td>` + $("city", this).text() + `</td>
                                     <td>` + $("State", this).text() + `</td>
                                     <td>` + $("CountyName", this).text() + `</td>
                                     <td>` + $("zip", this).text() + `</td>
                                </tr>`;
                });

                output += "</table>";
                $("#tableOutput").html(output);
                $('#results-table').dataTable(); // Makes use of the datatables plugin
            }
        }
    });
};


/* function returns all the Tabs information for a particular organization name selected. General details are  called and populated initially */
getTabs = function(orgId) {
    $.ajax({
        type: "GET",
        async: true,
        cache: false,
        url: url,
        data: {
            path: "/Application/Tabs?orgId=" + orgId
        },
        dataType: "xml",
        success: function(data) {
            var x = "";
            var y = "";
                if(!($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                var x = '<div id="tabs">';
                x += '<ul>';
                $("Tab", data).each(function() {
                    x += '<li><a href="#' + $(this).text() + '" onclick="get' + $(this).text() + '(' + orgId + ');">' + $(this).text() + '</a></li>';
                    y += '<div id="' + $(this).text() + '"></div>';
                });
                $('#dialog-modal').html(x + '</ul>' + y + '</div>');
                $('#tabs').responsiveTabs();// Makes use of responsivetabs plugin to display the tabs
                getGeneral(orgId);
                $('#dialog-modal').dialog({
                    minHeight: 400,
                    minWidth: 800,
                    buttons: {
                        Cancel: function() {
                            $(this).dialog("close");
                        }
                    }

                });
            }
        }
    });
}

/*This function returns the General information based on the seleted organization*/
getGeneral = function(orgId) {
    $.ajax({
        type: "GET",
        async: true,
        cache: false,
        url: url,
        data: {
            path: "/" + orgId + "/General"
        },
        dataType: "xml",
        success: function(data) {
            var output = "";
              if(!($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                output += '<h3>General Information</h3>';
                output += "<p>" + '<span id="para">' + 'Name:' + '</span>' + $(data).find("name").text() + "</p>";
                output += "<p>" + '<span id="para">' + 'Website:' + '</span>' + $(data).find("website").text() + "</p>";
                output += "<p>" + '<span id="para">' + 'Email:' + '</span>' + $(data).find("email").text() + "</p>";
                output += "<p>" + '<span id="para">' + 'Description:' + '</span>' + $(data).find("description").text() + "</p>";
                output += "<p>" + '<span id="para">' + 'Number of Members:' + '</span>' + $(data).find("nummembers").text() + "</p>";
                output += "<p>" + '<span id="para">' + 'No. of calls last year:' + '</span>' + $(data).find("numcalls").text() + '</p>';
                $('#General').html(output);
            }
        },
    });
}

/*This function returns the location information and also populates the map based on the address or latitude and longitute information*/
getLocations = function(orgId) {
    $.ajax({
        type: 'get',
        data: {
            path: '/' + orgId + '/Locations'
        },
        url: url,
        success: function(data) {
            if(($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                $('#Locations').html("Location details are not available");
            } else {
                var output = '<h3>Location Information</h3><select id="locations" onchange="locationDisplay(this.value)">';
                $('location', data).each(function() {
                    output += '<option value="' + $(this).find('siteId').text() + '"> Location: ' + $(this).find('type').text() + '</option>';
                });
                output += '</select><br />';
                $('location', data).each(function() {
                    output += '<table class="loc" id="site' + $(this).find('siteId').text() + '">';
                    output += '<tr><td>Type: </td><td>' + $(this).find('type').text() + '</td></tr>';
                    output += '<tr><td>Address: </td><td>' + $(this).find('address1').text() + '</td></tr>';
                    output += '<tr><td>city: </td><td>' + $(this).find('city').text() + '</td></tr>';
                    output += '<tr><td>state: </td><td>' + $(this).find('state').text() + '</td></tr>';
                    output += '<tr><td>Zip: </td><td>' + $(this).find('zip').text() + '</td></tr>';
                    output += '<tr><td>Fax: </td><td>' + $(this).find('fax').text() + '</td></tr>';
                    output += '<tr><td>TtyPhone: </td><td>' + $(this).find('ttyPhone').text() + '</td></tr>';
                    output += '<tr><td>Phone: </td><td>' + $(this).find('phone').text() + '</td></tr>';
                    output += '<tr><td>County: </td><td>' + $(this).find('countyName').text() + '</td></tr>';
                    output += '<tr><td>longitude: </td><td>' + $(this).find('longitude').text() + '</td></tr>';
                    output += '<tr><td>latitude: </td><td>' + $(this).find('latitude').text() + '</td></tr>';
                    output += '</table>';
                });
                output += '<div id="mapHolder">';
                $('location', data).each(function() {
                    output += '<div id="map_canvas' + $(this).find('siteId').text() + '" class="maps"></div>';
                });
                output += '</div><div style="clear:both"></div>';
                $('#Locations').html(output);
                $('location', data).each(function() {
                    var siteId = $(this).find('siteId').text();
                    // Makes use of the gmap3 plugin ton display the map based on the location address or latitude and longitude. It requires google maps API
                    $('#map_canvas' + siteId).width("500px").height("250px").css("float", "right").css("top", "-220px").css("left", "5px").gmap3({
                            address: $(this).find('address1').text() + "," + $(this).find('countyName').text(),
                            zoom: 11,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        })
                        .marker([{
                            position: [$(this).find('longitude').text(), $(this).find('longitude').text()]
                        }, {
                            address: $(this).find('address1').text() + "," + $(this).find('countyName').text()
                        }]);
                });
            }
            locationDisplay('1');
        }
    });
}

locationDisplay = function(value) {
    $('.loc').hide();
    $('.maps').hide();
    $('#site' + value).show();
    $('#map_canvas' + value).show();
}

/*Function used to display the treatment information*/
getTreatment = function(orgId) {
    $.ajax({
        url: url,
        data: {
            path: "/" + orgId + "/Treatments"
        },
        success: function(data) {
            var output = "";
            if(!($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                output += '<h3>Treatments</h3>';
                output += "<table id='treatment-table'>";
                output += "<thead>";
                output += "<tr>";
                output += "<th>Type</th>";
                output += "<th>Abbreviation</th>";
                output += "</tr>";
                output += "</thead>";
                output += "<tbody>";
                $('treatment', data).each(function() {
                    output += "<tr>";
                    output += "<td>" + $('type', this).text() + "</td>";
                    output += "<td>" + $('abbreviation', this).text() + "</td>";
                    output += "</tr>";
                });
                output += "</tbody>";
                output += "</table>";
                $("#Treatment").html(output);
                $('#treatment-table').dataTable();// Makes use of the datatables plugin
            }
        },
    })
}

/*function used to return  training information for the organization name selected*/
getTraining = function(orgId) {
    $.ajax({
        url: url,
        data: {
            path: "/" + orgId + "/Training"
        },
        success: function(data) {
            var output = "";
            if(($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                console.log("Can't display");
            } else {
                output += '<h3>Services / Training</h3>';
                output += "<table id='training-table'>";
                output += "<thead>";
                output += "<tr>";
                output += "<th>Type</th>";
                output += "<th>Abbreviation</th>";
                output += "</tr>";
                output += "</thead>";
                output += "<tbody>";
                $('training', data).each(function() {
                    output += "<tr>";
                    output += "<td>" + $('type', this).text() + "</td>";
                    output += "<td>" + $('abbreviation', this).text() + "</td>";
                    output += "</tr>";
                });
                output += "</tbody>";
                output += "</table>";
                $("#Training").html(output);
                $('#training-table').dataTable();// Makes use of the datatables plugin
            }
        },
    })
}

/*function used to return the Equipment information for the organization selected. */
getEquipment = function(orgId) {
    $.ajax({
        url: url,
        data: {
            path: "/" + orgId + "/Equipment"
        },
        success: function(data) {
            var output = "";
            if(($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                console.log("Can't display");
            } else {
                output += "<h3>Equipment</h3>";
                output += "<table id='equipment-table'>";
                output += "<thead>";
                output += "<tr>";
                output += "<th>Name</th>";
                output += "<th>Quantity</th>";
                output += "<th>Description</th>"
                output += "</tr>";
                output += "</thead>";
                output += "<tbody>";
                $('equipment', data).each(function() {
                    output += "<tr>";
                    output += "<td>" + $('type', this).text() + "</td>";
                    output += "<td>" + $('quantity', this).text() + "</td>";
                    output += "<td>" + $('description', this).text() + "</td>";
                    output += "</tr>";
                });
                output += "</tbody>";
                output += "</table>";
                $("#Equipment").html(output);
                $('#equipment-table').dataTable();// Makes use of the datatables plugin
            }
        },
    })
}

/*This function used to return the people information nased on the organization listed in the location.*/
getPeople = function(orgId) {
    $.ajax({
        type: 'get',
        data: {
            path: '/' + orgId + '/People'
        },
        url: url,
        success: function(data) {
            var output = '';
            output += '<h3>People</h3><select onchange="showPeople(this.value)">';
            $('site', data).each(function() {
                output += '<option value="' + $(this).attr('siteId') + '">' + $(this).attr('address') + '</option>';
            });
            output += '</select><br />';
            if ($(data).find('personCount').text() == 0) {
                output += '<div id="peopleDiv' + $(this).attr('siteId') + '"><table class="ppl" id="peopleTable' + $(this).attr('siteId') + '">';
                output += '<thead><tr><th>No People Available</th></tr></thead><tbody>';
                output += '</tbody></table></div>';
                $('#People').html(output);
            } else {
                $('site', data).each(function() {
                    if ($(this).attr('address') != 'null') {
                        output += '<div class="pplDiv" id="peopleDiv' + $(this).attr('siteId') + '"><table class="ppl" id="peopleTable' + $(this).attr('siteId') + '">';
                        output += '<thead><tr><th>Name</th><th>Role</th></tr></thead><tbody>';
                        var currentPeople = $(this).find('person');
                        $(currentPeople, data).each(function() {
                            var name = $(this).find('lName').text();
                            output += '<tr><td>' + name + '</td>';
                            output += '<td>' + $(this).find('role').text() + '</td></tr>';
                        });
                        output += '</tbody></table></div>';
                        $('#People').html(output);
                    }
                });
            }
            $('.ppl').dataTable();// Makes use of the datatables plugin
            showPeople("1");
        }
    });
}

showPeople = function(which) {
    $('.pplDiv').hide();
    $('#peopleDiv' + which).show();
}

getFacilities = function(orgId) {
    $.ajax({
        url: url,
        data: {
            path: "/" + orgId + "/Facilities"
        },
        success: function(data) {
            var output = "";
            if(!($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                output += "<h3>Facilities</h3>";
                output += "<table id='facilities-table'>";
                output += "<thead>";
                output += "<tr>";
                output += "<th>Name</th>";
                output += "<th>Quantity</th>";
                output += "<th>Description</th>"
                output += "</tr>";
                output += "</thead>";
                output += "<tbody>";
                $('facility', data).each(function() {
                    output += "<tr>";
                    output += "<td>" + $('type', this).text() + "</td>";
                    output += "<td>" + $('quantity', this).text() + "</td>";
                    output += "<td>" + $('description', this).text() + "</td>";
                    output += "</tr>";
                });
                output += "</tbody>";
                output += "</table>";
                $("#Facilities").html(output);
                $('#facilities-table').dataTable();// Makes use of the datatables plugin
            }
        },
    })
}


/*Function used to return the Physicians info if there are phusicians in the selected organization*/
getPhysicians = function(orgId) {
    $.ajax({
        url: url,
        data: {
            path: "/" + orgId + "/Physicians"
        },
        success: function(data) {
            var output = "";
            if(!($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                output += "<h3>Physicians with Admitting Privileges</h3>"
                output += "<table id='physician-table'>";
                output += "<thead>";
                output += "<tr>";
                output += "<th>Name</th>";
                output += "<th>License</th>";
                output += "<th>Contact</th>"
                output += "</tr>";
                output += "</thead>";
                output += "<tbody>";
                $('physician', data).each(function() {
                    output += "<tr>";
                    output += "<td>" + $('fName', this).text() + " " + $('mName', this).text() + " " + $('lName', this).text() + "</td>";
                    output += "<td>" + $('license', this).text() + "</td>";
                    output += "<td>" + $('phone', this).text() + "</td>";
                    output += "</tr>";
                });
                output += "</tbody>";
                output += "</table>";
                $("#Physicians").html(output);
                $('#physician-table').dataTable();// Makes use of the datatables plugin
            }
        },
    })
}

/*Function used to return the cities information based on the state */
getCities = function(_arg) {
    $.ajax({
        type: "GET",
        async: true,
        cache: false,
        url: url,
        data: {
            path: "/Cities?state=" + _arg.value
        },
        dataType: "xml",
        success: function(data) {
            var x = "";
            if(!($(this).checkErrors(data))){  //makes use of the plugin to check for errors
                x = "<option value=''>--City--</option>";
                $("row", data).each(function() {
                    x += "<option>" + $("city", this).text() + "</option>";
                });
                $('#citiesDiv').html(x);
                $('#orgCitySearch').append($('#citiesDiv'));
            }
        }
    });
}

//returning the public methods
return {
   showResults: showResults ,
   getOrgTypes: getOrgTypes ,
   getCities: getCities
  };
}());


/*Immediately Invoked Function*/
$(function() {
//Populates all the organization types on load
    MYAPP.mainScript.getOrgTypes();

//Populates the cities by taking NY as the initial value on load
    var initState = {
        'value': "NY"
    };
    MYAPP.mainScript.getCities(initState);

//makes use of the plugin to change font size
    $("#fontChange").change(function() {
        $(this).font(this.value);
    });

//makes use of the plugin to change background color
    $("#backColor").change(function() {
        $(this).backColor(this.value);
    });
});
