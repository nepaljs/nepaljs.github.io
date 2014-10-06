/*global d3, topojson, console*/
var nepal = (function () {
    'use strict';

    function addTitle(title, svgId, admLevelType, svgWidth, svgHeight) {
        var svg,
            titleContainer;

        svg = d3.select("#" + svgId);

        titleContainer = svg.append("g")
            .attr("class", "nj-" + admLevelType + "-title");

        titleContainer.append("text")
            .attr("class", "nj-svg-title")
            .attr("x", svgWidth / 2)
            .attr("y", 15)
            .text(title);
    }

    function addLegend(legendTitle, svgId, admLevelType, svgWidth, svgHeight, quantiles, range) {
        var svg,
            legendContainer,
            maxRange;

        svg = d3.select("#" + svgId);

        maxRange = d3.max(d3.values(range));

        legendContainer = svg.append("g")
            .attr("class", "nj-" + admLevelType + "-legend");

        legendContainer.selectAll("g")
            .data(range)
            .enter().append("g")
            .each(function (d, i) {
                var g = d3.select(this);

                g.append("rect")
                    .attr("class", "nj-legend-rect q" + d + "-" + (maxRange + 1))
                    .attr("x", 15)
                    .attr("y", svgHeight - ((i + 1) * 20) - 10)
                    .attr("width", 15)
                    .attr("height", 15);

                g.append("text")
                    .attr("class", "nj-legend-text")
                    .attr("x", 40)
                    .attr("y", svgHeight - ((i + 1) * 20))
                    .attr("height", 15)
                    .attr("width", 100)
                    .text(i === 0 ? "< " + Math.round(quantiles[i]) : ((i === maxRange) ? Math.round(quantiles[i - 1]) + " + " : Math.round(quantiles[i - 1]) + " - " + Math.round(quantiles[i])));

                if (i === maxRange) {
                    g.append("text")
                        .attr("class", "nj-legend-title")
                        .attr("x", 15)
                        .attr("y", svgHeight - ((maxRange + 2) * 20))
                        .attr("height", 15)
                        .attr("width", 100)
                        .text(legendTitle);

                }
            });
    }

    var choroplethMap = function (options) {

        var svgId = options.svgId,
            width = options.width,
            height = options.height,
            viewBox = options.viewBox,
            preserveAspectRatio = options.preserveAspectRatio,
            subdivisionIds = options.subdivisionIds,
            admLevelType = options.admLevelType,
            nepalJsonPath = options.nepalJsonPath,
            dataJsonPath = options.dataJsonPath,
            range = options.range,
            quantitativeScale = options.quantitativeScale,
            colorScheme = options.colorScheme,
            title = options.title,
            legendTitle = options.legendTitle,
            svg,
            projection,
            path;

        console.log("options =", options);

        svg = d3.select("body").append("svg")
            .attr("id", svgId)
            .attr("class", colorScheme)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", viewBox)
            .attr("preserveAspectRatio", preserveAspectRatio);

        projection = d3.geo.mercator();

        path = d3.geo.path()
            .projection(projection);

        d3.json(nepalJsonPath, function (error, npl) {
            if (error) {
                return console.error(error);
            }

            var admLevel,
                bounds,
                scale,
                translation,
                container,
                quantile;

            switch (admLevelType) {
                case "devregion":
                    admLevel = topojson.feature(npl, npl.objects.regions);
                    break;

                case "zone":
                    if (!subdivisionIds) {
                        admLevel = topojson.feature(npl, npl.objects.zones);
                    } else {
                        admLevel = topojson.feature(npl, {
                            type: "GeometryCollection",
                            geometries: npl.objects.zones.geometries.filter(function (d) {
                                return subdivisionIds.indexOf(d.id.substring(0, 1)) > -1;
                            })
                        });
                    }
                    break;

                case "district":
                    if (!subdivisionIds) {
                        admLevel = topojson.feature(npl, npl.objects.districts);
                    } else {
                        admLevel = topojson.feature(npl, {
                            type: "GeometryCollection",
                            geometries: npl.objects.districts.geometries.filter(function (d) {
                                return subdivisionIds.indexOf(d.id.substring(0, 3)) > -1;
                            })
                        });
                    }
                    break;

                case "vdc":
                    if (!subdivisionIds) {
                        admLevel = topojson.feature(npl, npl.objects.vdcs);
                    } else {
                        admLevel = topojson.feature(npl, {
                            type: "GeometryCollection",
                            geometries: npl.objects.vdcs.geometries.filter(function (d) {
                                return subdivisionIds.indexOf(d.id.substring(0, 5)) > -1;
                            })
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

            projection
                .scale(1)
                .translate([0, 0]);

            bounds = path.bounds(admLevel);
            scale = 0.95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
            translation = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

            container = svg.append("g")
                .attr("class", "nj-" + admLevelType + "-container");

            projection
                .scale(scale)
                .translate(translation);

            d3.json(dataJsonPath, function (jsonData) {

                var data = {},
                    min,
                    max,
                    zoom;

                jsonData.forEach(function (d) {
                    data[d.id] = +d.value;
                });

                max = d3.max(d3.values(data));
                min = d3.min(d3.values(data));

                quantile = d3.scale.quantile()
                    .domain([min, max])
                    .range(d3.range(range));

                container.selectAll(".nj-" + admLevelType)
                    .data(admLevel.features)
                    .enter().append("path")
                    .attr("class", function (d) {
                        return "nj-" + admLevelType + " q" + quantile(data[d.id]) + "-" + range;
                    })
                    .attr("id", function (d) {
                        return admLevelType + "-" + d.id;
                    })
                    .attr("d", path)
                    .on("mouseover", function (d) {
                        d3.select(this)
                            .classed("nj-active", true);

                        d3.select("body").append("div")
                            .attr("class", "nj-tooltip")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY) + "px")
                            .html(d.properties.name + "<br //><b>" + data[d.id] + "<//b>")
                            .transition()
                            .duration(100);
                    })
                    .on("mouseout", function (d) {
                        d3.select(this)
                            .style("fill", null)
                            .classed("nj-active", false);

                        d3.selectAll(".nj-tooltip")
                            .remove();
                    });

                addTitle(title, svgId, admLevelType, width, height);
                addLegend(legendTitle, svgId, admLevelType, width, height, quantile.quantiles(), quantile.range());
            });
        });
    };

    return {
        choroplethMap: choroplethMap
    };
}());
