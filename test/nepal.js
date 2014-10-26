/*global d3, topojson, console, $*/
var nepal = (function () {
    'use strict';

    function addTitle(title, svgId, admLevelType, svgWidth, svgHeight) {
        var svg,
            titleContainer;

        svg = d3.select(svgId);

        titleContainer = svg.append("g")
            .attr("class", "nj-" + admLevelType + "-title");

        titleContainer.append("text")
            .attr("class", "nj-svg-title")
            .attr("x", svgWidth / 2)
            .attr("y", 15)
            .text(title);
    }

    function addChoroplethLegend(legendTitle, svgId, admLevelType, svgWidth, svgHeight, quantitativeScale, range, position) {
        var svg,
            legendContainer,
            maxRange;

        svg = d3.select(svgId);

        maxRange = d3.max(d3.values(range));

        legendContainer = svg.append("g")
            .attr("class", "nj-" + admLevelType + "-legend");

        var boxX,
            boxY,
            boxHeight;

        if (position === "top-left") {
            boxX = 10;
            boxY = 5;
            boxHeight = (maxRange + 1) * 28 - 10;
        } else if (position === "top-right") {
            boxX = svgWidth - 120;
            boxY = 5;
            boxHeight = (maxRange + 1) * 28 - 10;
        } else if (position === "bottom-left") {
            boxX = 10;
            boxY = svgHeight - (maxRange + 1) * 28;
            boxHeight = svgHeight - boxY - 5;
        } else if (position === "bottom-right") {
            boxX = svgWidth - 120;
            boxY = svgHeight - (maxRange + 1) * 28;
            boxHeight = svgHeight - boxY - 5;
        }

        legendContainer.append("rect")
            .attr("class", "nj-legend-box")
            .attr("x", boxX)
            .attr("y", boxY)
            .attr("width", 115)
            .attr("height", boxHeight);

        legendContainer.selectAll("g")
            .data(range)
            .enter().append("g")
            .each(function (d, i) {

                var g = d3.select(this),
                    rectX,
                    rectY,
                    textX,
                    textY,
                    titleX,
                    titleY;

                if (position === "top-left") {
                    rectX = 15;
                    rectY = (maxRange - i + 2) * 20 - 10;
                    textX = 40;
                    textY = (maxRange - i + 2) * 20;
                    titleX = 15;
                    titleY = 20;
                } else if (position === "top-right") {
                    rectX = svgWidth - 115;
                    rectY = (maxRange - i + 2) * 20 - 10;
                    textX = svgWidth - 90;
                    textY = (maxRange - i + 2) * 20;
                    titleX = svgWidth - 115;
                    titleY = 20;
                } else if (position === "bottom-left") {
                    rectX = 15;
                    rectY = svgHeight - ((i + 1) * 20) - 10;
                    textX = 40;
                    textY = svgHeight - ((i + 1) * 20);
                    titleX = 15;
                    titleY = svgHeight - ((maxRange + 2) * 20);
                } else if (position === "bottom-right") {
                    rectX = svgWidth - 115;
                    rectY = svgHeight - ((i + 1) * 20) - 10;
                    textX = svgWidth - 90;
                    textY = svgHeight - ((i + 1) * 20);
                    titleX = svgWidth - 115;
                    titleY = svgHeight - ((maxRange + 2) * 20);
                }

                g.append("rect")
                    .attr("class", "nj-legend-rect q" + d + "-" + (maxRange + 1))
                    .attr("x", rectX)
                    .attr("y", rectY)
                    .attr("width", 15)
                    .attr("height", 15);

                g.append("text")
                    .attr("class", "nj-legend-text")
                    .attr("x", textX)
                    .attr("y", textY)
                    .attr("height", 15)
                    .attr("width", 100)
                    .text(i === 0 ? "< " + Math.round(quantitativeScale[i]) : ((i === maxRange) ? Math.round(quantitativeScale[i - 1]) + " + " : Math.round(quantitativeScale[i - 1]) + " - " + Math.round(quantitativeScale[i])));

                if (i === maxRange) {
                    legendContainer.append("text")
                        .attr("class", "nj-legend-title")
                        .attr("x", titleX)
                        .attr("y", titleY)
                        .attr("height", 15)
                        .attr("width", 100)
                        .text(legendTitle);

                }
            });
    }

    function addBubbleLegend(legendTitle, svgId, admLevelType, svgWidth, svgHeight, radius, position) {
        var svg = d3.select(svgId);

        var legendContainer = svg.append("g")
            .attr("class", "nj-" + admLevelType + "-legend");

        var quantile = d3.scale.quantile()
            .domain(radius.domain())
            .range(d3.range(5));

        var maxRange = d3.max(d3.values(radius.range()));

        legendContainer.selectAll("g")
            .data(quantile.quantiles())
            .enter().append("g")
            .each(function (d, i) {
                var g = d3.select(this);

                var x,
                    y,
                    titleX,
                    titleY;

                if (position == "top-right") {
                    x = svgWidth - maxRange - 20;
                    y = 2 * maxRange + 20;
                    titleX = x;
                    titleY = 20;
                } else if (position == "top-left") {
                    x = maxRange + 20;
                    y = 2 * maxRange + 20;
                    titleX = x;
                    titleY = 20;
                } else if (position == "bottom-left") {
                    x = maxRange + 15;
                    y = svgHeight - 15;
                    titleX = x;
                    titleY = svgHeight - 2 * maxRange - 15;
                } else if (position == "bottom-right") {
                    x = svgWidth - maxRange - 15;
                    y = svgHeight - 15;
                    titleX = x;
                    titleY = svgHeight - 2 * maxRange - 15;
                }

                g.append("circle")
                    .attr("transform", "translate(" + x + "," + y + ")")
                    .attr("class", "nj-legend-circle")
                    .attr("cy", function (d) {
                        return -radius(d);
                    })
                    .attr("r", radius);

                g.append("text")
                    .attr("transform", "translate(" + x + "," + y + ")")
                    .attr("class", "nj-legend-circle-text")
                    .attr("y", function (d) {
                        return -2 * radius(d);
                    })
                    .attr("dy", "0.8em")
                    .text(d3.format(".1s"));

                if (d == d3.max(d3.values(quantile.quantiles()))) {
                    g.append("text")
                        .attr("class", "nj-legend-title")
                        .style("text-anchor", "middle")
                        .attr("x", titleX)
                        .attr("y", titleY)
                        .text(legendTitle);
                }
            });
    }

    var createMap = function (args) {

        var svgId = args.svgId,
            nepalTopojson = args.nepalTopojson,
            data = args.data,
            admLevel = args.admLevel,
            subdivisionIds = args.subdivisionIds,
            map = args.map,
            title = args.title,
            showToolbar = args.showToolbar;

        var width = $(svgId).parent().width(),
            height = $(svgId).parent().height();

        var svg = d3.select(svgId)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", "0 0 " + width + " " + height)
            .attr("preserveAspectRatio", "xMinXyMinY meet");

        var projection = d3.geo.mercator();

        var path = d3.geo.path()
            .projection(projection);

        var twoPi = 2 * Math.PI,
            progress = 0,
            total = 1308573,
            formatPercent = d3.format(".0%");

        var arc = d3.svg.arc()
            .startAngle(0)
            .innerRadius(18)
            .outerRadius(24);

        var meter = svg.append("g")
            .attr("class", "nj-map-progress-meter")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        meter.append("path")
            .attr("class", "background")
            .attr("d", arc.endAngle(twoPi));

        var foreground = meter.append("path")
            .attr("class", "foreground");

        var text = meter.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", ".15em");

        // load nepal topojson file
        d3.json(nepalTopojson)
            .on("progress", function () {
                var i = d3.interpolate(progress, d3.event.loaded / total);

                d3.transition().tween("progress", function() {
                    return function(t) {
                        progress = i(t);
                        foreground.attr("d", arc.endAngle(twoPi * progress));
                        text.text(formatPercent(progress));
                    };
                });
            })
            .get(function (error, npl) {
                if (error) return console.error(error);

                var admLevelFeature,
                    admLevelMesh;

                switch (admLevel) {
                    case "devregion":
                        admLevelFeature = topojson.feature(npl, npl.objects.regions);
                        break;

                    case "zone":
                        if (!subdivisionIds) {
                            admLevelFeature = topojson.feature(npl, npl.objects.zones);

                            admLevelMesh = topojson.mesh(npl, npl.objects.regions, function (a, b) {
                                return a !== b;
                            });
                        } else {
                            admLevelFeature = topojson.feature(npl, {
                                type: "GeometryCollection",
                                geometries: npl.objects.zones.geometries.filter(function (d) {
                                    return subdivisionIds.indexOf(d.id.substring(0, 1)) > -1;
                                })
                            });

                            admLevelMesh = topojson.mesh(npl, {
                                type: "GeometryCollection",
                                geometries: npl.objects.regions.geometries.filter(function (d) {
                                    return subdivisionIds.indexOf(d.id) > -1;
                                })
                            }, function (a, b) {
                                return a !== b;
                            });
                        }
                        break;

                    case "district":
                        if (!subdivisionIds) {
                            admLevelFeature = topojson.feature(npl, npl.objects.districts);
                        } else {
                            admLevelFeature = topojson.feature(npl, {
                                type: "GeometryCollection",
                                geometries: npl.objects.districts.geometries.filter(function (d) {
                                    return subdivisionIds.indexOf(d.id.substring(0, 3)) > -1;
                                })
                            });

                            admLevelMesh = topojson.mesh(npl, npl.objects.zones, function (a, b) {
                                return a !== b;
                            });

                            admLevelMesh = topojson.mesh(npl, {
                                type: "GeometryCollection",
                                geometries: npl.objects.zones.geometries.filter(function (d) {
                                    return subdivisionIds.indexOf(d.id) > -1;
                                })
                            }, function (a, b) {
                                return a !== b;
                            });
                        }
                        break;

                    case "vdc":
                        if (!subdivisionIds) {
                            admLevelFeature = topojson.feature(npl, npl.objects.vdcs);

                            admLevelMesh = topojson.mesh(npl, npl.objects.districts, function (a, b) {
                                return a !== b;
                            });
                        } else {
                            admLevelFeature = topojson.feature(npl, {
                                type: "GeometryCollection",
                                geometries: npl.objects.vdcs.geometries.filter(function (d) {
                                    return subdivisionIds.indexOf(d.id.substring(0, 5)) > -1;
                                })
                            });

                            admLevelMesh = topojson.mesh(npl, {
                                type: "GeometryCollection",
                                geometries: npl.objects.districts.geometries.filter(function (d) {
                                    return subdivisionIds.indexOf(d.id) > -1;
                                })
                            }, function (a, b) {
                                return a !== b;
                            });
                        }

                        break;

                    default:
                        if (!subdivisionIds) {
                            console.log("Valid Administrative Level Types: devregion, zone, district, and vdc.");
                        } else {
                            console.log("Valid Administrative Level Types: zone, district, and vdc.");
                        }

                        break;
                }

                // set projection to unit scale and translate to (0, 0)
                projection
                    .scale(1)
                    .translate([0, 0]);

                var bounds = path.bounds(admLevelFeature),
                    scale = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height),
                    translation = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

                // set calculated scale and translation of the projection
                projection
                    .scale(scale)
                    .translate(translation);

                var currentDragPosition = [0, 0];

                var drag = d3.behavior.drag()
                    .origin(function () {
                        return {x: currentDragPosition[0], y: currentDragPosition[1]};
                    })
                    .on("drag", function () {
                        currentDragPosition = [d3.event.x, d3.event.y];

                        d3.select(svgId).select(".nj-" + admLevel + "-container")
                            .attr("transform", "translate(" + currentDragPosition + ")");

                        d3.select(svgId).select(".nj-" + admLevel + "-boundary")
                            .attr("transform", "translate(" + currentDragPosition + ")");

                        d3.select(svgId).select(".nj-" + admLevel + "-bubble-container")
                            .attr("transform", "translate(" + currentDragPosition + ")");
                    });

                svg.call(drag);

                // the g element that contains the paths of administrative features
                var container = svg.append("g")
                    .attr("class", "nj-" + admLevel + "-container")
                    .selectAll(".nj-" + admLevel)
                    .data(admLevelFeature.features)
                    .enter().append("path")
                    .attr("id", function (d) {
                        return admLevel + "-" + d.id;
                    })
                    .attr("d", path)
                    .style("stroke", "#fff")
                    .style("stroke-width", "0.25px");

                svg.append("g")
                    .attr("class", "nj-" + admLevel + "-boundary")
                    .append("path")
                    .datum(admLevelMesh)
                    .attr("d", path);

                var type = map.type,
                    range = map.range,
                    showTooltip = map.showTooltip,
                    legendTitle = map.legendTitle,
                    legendPosition = map.legendPosition;

                var values = {},
                    min,
                    max,
                    radius;

                d3.json(data, function (error, jsonData) {
                    if (error) return console.error(error);

                    jsonData.forEach(function (d) {
                        values[d.id] = +d.value;
                    });

                    max = d3.max(d3.values(values));
                    min = d3.min(d3.values(values));

                    switch (type) {
                        case "choropleth":
                            var quantitativeScaleType = map.quantitativeScaleType,
                                colorScheme = map.colorScheme,
                                quantitativeScale;

                            switch (quantitativeScaleType) {
                                case "quantile":

                                    quantitativeScale = d3.scale.quantile()
                                        .domain([min, max])
                                        .range(d3.range(range));

                                    d3.select(svgId)
                                        .attr("class", colorScheme);

                                    d3.select(svgId).select(".nj-" + admLevel + "-container").selectAll("path")
                                        .attr("class", function (d) {
                                            return "nj-" + admLevel + " q" + quantitativeScale(values[d.id]) + "-" + range;
                                        });

                                    addChoroplethLegend(legendTitle, svgId, admLevel, width, height, quantitativeScale.quantiles(), quantitativeScale.range(), legendPosition);

                                    break;

                                default:
                                    console.log("Supported quantitative scale: quantile");
                                    break;
                            }

                            if (showTooltip) {
                                d3.select(svgId).select(".nj-" + admLevel + "-container").selectAll("path")
                                    .on("mouseover", function (d) {
                                        d3.select(this)
                                            .style("fill", "red");

                                        d3.select("body").append("div")
                                            .attr("class", "nj-tooltip")
                                            .style("left", (d3.event.pageX + 5) + "px")
                                            .style("top", (d3.event.pageY - 40) + "px")
                                            .html(d.properties.name + "<br //><b>" + values[d.id] + "<//b>");
                                    })
                                    .on("mouseout", function (d) {
                                        d3.select(this)
                                            .style("fill", null);

                                        d3.selectAll(".nj-tooltip")
                                            .remove();
                                    });
                            }

                            if (showToolbar) {
                                toolbar();
                            }

                            break;

                        case "bubble":
                            radius = d3.scale.sqrt()
                                .domain([min, max])
                                .range(range);

                            svg.append("g")
                                .attr("class", "nj-" + admLevel + "-bubble-container")
                                .selectAll("circle")
                                .data(admLevelFeature.features.sort(function (a, b) {
                                    return values[b.id] - values[a.id];
                                }))
                                .enter().append("circle")
                                .attr("class", "nj-" + admLevel + "-bubble")
                                .attr("cx", function (d) {
                                    return path.centroid(d)[0];
                                })
                                .attr("cy", function (d) {
                                    return path.centroid(d)[1];
                                })
                                .attr("r", function (d) {
                                    return radius(values[d.id]);
                                })
                                .attr("stroke-width", 0.5);

                            addBubbleLegend(legendTitle, svgId, admLevel, width, height, radius, legendPosition);

                            if (showTooltip) {
                                d3.select(svgId).select(".nj-" + admLevel + "-bubble-container").selectAll("circle")
                                    .on("mouseover", function (d) {
                                        d3.select("body").append("div")
                                            .attr("class", "nj-tooltip")
                                            .style("left", (d3.event.pageX + 5) + "px")
                                            .style("top", (d3.event.pageY - 40) + "px")
                                            .html(d.properties.name + "<br //><b>" + values[d.id] + "<//b>");
                                    })
                                    .on("mouseout", function (d) {
                                        d3.selectAll(".nj-tooltip")
                                            .remove();
                                    });
                            }

                            if (showToolbar) {
                                toolbar();
                            }

                            break;

                        default:
                            console.log("Supported Maps: Choropleth");
                            break;

                    }
                });

                $(window).on('resize', function () {
                    var width = $(svgId).parent().width();
                    var height = $(svgId).parent().height();

                    d3.select(svgId)
                        .attr("width", width)
                        .attr("height", height);
                });

                if (title) {
                    addTitle(title, svgId, admLevel, width, height);
                }

                function toolbar() {
                    svg.append("foreignObject")
                        .attr("width", 30)
                        .attr("height", 110)
                        .attr("class", "nj-foreign-object")
                        .append("xhtml:div")
                        .style("padding", "4px")
                        .html(
                            "<input type=\"button\"/ class=\"nj-nav-button\" id=\"nj-nav-button-plus\" value=\"+\" title=\"zoom in\"><br/>" +
                            "<input type=\"button\"/ class=\"nj-nav-button\" id=\"nj-nav-button-home\" value=\"&#8632\" title=\"reset\"><br/>" +
                            "<input type=\"button\"/ class=\"nj-nav-button\" id=\"nj-nav-button-minus\" value=\"-\" title=\"zoom out\"><br />" +
                            "<input type=\"button\"/ class=\"nj-nav-button\" id=\"nj-nav-button-download\" value=\"&#10515;\" title=\"download\">"
                    );

                    var toolbarContainer = d3.select(svgId).select(".nj-foreign-object").select("div");

                    var zoomScale = 1;

                    toolbarContainer.select("#nj-nav-button-plus").on("click", function () {
                        if (zoomScale <= 12) {
                            d3.select(svgId).select(".nj-" + admLevel + "-container").selectAll("path")
                                .transition()
                                .duration(500)
                                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + ++zoomScale + ")translate(" + -width / 2 + "," + -height / 2 + ")");

                            d3.select(svgId).select(".nj-" + admLevel + "-boundary").selectAll("path")
                                .transition()
                                .duration(500)
                                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomScale + ")translate(" + -width / 2 + "," + -height / 2 + ")");

                            d3.select(svgId).select(".nj-" + admLevel + "-bubble-container").selectAll("circle")
                                .transition()
                                .duration(500)
                                .attr("transform", function () {
                                    return "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomScale + ")translate(" + -width / 2 + "," + -height / 2 + ")";
                                })
                                .attr("r", function (d) {
                                    return radius(values[d.id]) / zoomScale;
                                })
                                .attr("stroke-width", 0.5 / zoomScale);
                        }
                    });

                    toolbarContainer.select("#nj-nav-button-minus").on("click", function () {
                        if (zoomScale > 1) {
                            d3.select(svgId).select(".nj-" + admLevel + "-container").selectAll("path")
                                .transition()
                                .duration(500)
                                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + --zoomScale + ")translate(" + -width / 2 + "," + -height / 2 + ")");

                            d3.select(svgId).select(".nj-" + admLevel + "-boundary").selectAll("path")
                                .transition()
                                .duration(500)
                                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomScale + ")translate(" + -width / 2 + "," + -height / 2 + ")");

                            d3.select(svgId).select(".nj-" + admLevel + "-bubble-container").selectAll("circle")
                                .transition()
                                .duration(500)
                                .attr("transform", function () {
                                    return "translate(" + width / 2 + "," + height / 2 + ")scale(" + zoomScale + ")translate(" + -width / 2 + "," + -height / 2 + ")";
                                })
                                .attr("r", function (d) {
                                    return radius(values[d.id]) / zoomScale;
                                })
                                .attr("stroke-width", 0.5 / zoomScale);
                        }
                    });

                    toolbarContainer.select("#nj-nav-button-home").on("click", function () {
                        zoomScale = 1;

                        d3.select(svgId).select(".nj-" + admLevel + "-container").selectAll("path")
                            .transition()
                            .duration(500)
                            .attr("transform", "translate(" + 0 + "," + 0 + ")scale(" + 1 + ")");

                        d3.select(svgId).select(".nj-" + admLevel + "-boundary").selectAll("path")
                            .transition()
                            .duration(500)
                            .attr("transform", "translate(" + 0 + "," + 0 + ")scale(" + 1 + ")");

                        d3.select(svgId).select(".nj-" + admLevel + "-container")
                            .transition()
                            .duration(500)
                            .attr("transform", "translate(" + 0 + "," + 0 + ")");

                        d3.select(svgId).select(".nj-" + admLevel + "-boundary")
                            .transition()
                            .duration(500)
                            .attr("transform", "translate(" + 0 + "," + 0 + ")");

                        d3.select(svgId).select(".nj-" + admLevel + "-bubble-container").selectAll("circle")
                            .transition()
                            .duration(500)
                            .attr("transform", "translate(" + 0 + "," + 0 + ")scale(" + 1 + ")")
                            .attr("r", function (d) {
                                return radius(values[d.id]);
                            })
                            .attr("stroke-width", 0.5);

                        d3.select(svgId).select(".nj-" + admLevel + "-bubble-container")
                            .transition()
                            .duration(500)
                            .attr("transform", "translate(" + 0 + "," + 0 + ")");
                    });

                    toolbarContainer.select("#nj-nav-button-download").on("click", function () {

                        $(".nj-download-option").remove();

                        d3.select("body").append("div")
                            .attr("class", "nj-download-option")
                            .style("top", height / 2 - 100 + "px")
                            .style("left", width / 2 - 100 + "px")
                            .html(
                                "<b>Name:</b> <input type=\"text\" size=\"10\" id=\"" + svgId.replace(/^#/, "") + "-name\" /><br />" +
                                "<b>Scale:</b> <input type=\"text\"size=\"10\" id=\"" + svgId.replace(/^#/, "") + "-scale\" /><br />" +
                                "<input type=\"button\" id=\"" + svgId.replace(/^#/, "") + "-download\" value=\"Download\" />" +
                                "<input type=\"button\" id=\"" + svgId.replace(/^#/, "") + "-close\" value=\"Close\" />"
                        );

                        $(svgId + "-download").click(function (e) {
                            e.preventDefault();

                            var name = $(svgId + "-name").val(),
                                scale = $(svgId + "-scale").val();

                            saveSvgAsPng(document.getElementById(svgId.replace(/^#/, "")), name.trim() + ".png", scale.trim());

                            $(".nj-download-option").remove();
                        });

                        $(svgId + "-close").click(function (e) {
                            e.preventDefault();
                            $(".nj-download-option").remove();
                        });
                    });
                }
            });
    };

    return {
        createMap: createMap
    };
}());
