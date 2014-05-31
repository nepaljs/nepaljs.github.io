/*global d3, topojson, console*/
var nepal = (function () {
    'use strict';

    function addTitle(title, svgId, admLevelType, svgWidth, svgHeight) {
        var svg,
            titleContainer;

        svg = d3.select("#" + svgId);

        titleContainer = svg.append("g")
            .attr("class", admLevelType + "-title");

        titleContainer.append("text")
            .attr("class", "svg-title")
            .attr("x", svgWidth - 10)
            .attr("y", 20)
            .text(title);
    }

    function addLegend(legendTitle, svgId, admLevelType, svgWidth, svgHeight, quantiles, range) {
        var svg,
            legendContainer,
            maxRange;

        svg = d3.select("#" + svgId);

        maxRange = d3.max(d3.values(range));

        legendContainer = svg.append("g")
            .attr("class", admLevelType + "-legend");

        legendContainer.selectAll("g")
            .data(range)
            .enter().append("g")
            .each(function (d, i) {
                var g = d3.select(this);

                g.append("rect")
                    .attr("class", "legend-rect q" + d + "-" + (maxRange + 1))
                    .attr("x", 15)
                    .attr("y", svgHeight - ((i + 1) * 20) - 10)
                    .attr("width", 15)
                    .attr("height", 15);

                g.append("text")
                    .attr("class", "legend-text")
                    .attr("x", 40)
                    .attr("y", svgHeight - ((i + 1) * 20))
                    .attr("height", 15)
                    .attr("width", 100)
                    .text(i === 0 ? "< " + Math.round(quantiles[i]) : ((i === maxRange) ? Math.round(quantiles[i - 1]) + " + " : Math.round(quantiles[i - 1]) + " - " + Math.round(quantiles[i])));

                if (i === maxRange) {
                    g.append("text")
                        .attr("class", "legend-title")
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
            .attr("preserveAspectRatio", preserveAspectRatio)
            .style("border", "1px solid black");

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
                admLevel = topojson.feature(npl, npl.objects.zones);
                break;

            case "district":
                admLevel = topojson.feature(npl, npl.objects.districts);
                break;

            case "vdc":
                admLevel = topojson.feature(npl, npl.objects.vdcs);
                break;

            default:
                console.log("Valid Administrative Level Types: devregion, zone, district, and vdc.");
                break;
            }

            projection
                .scale(1)
                .translate([0, 0]);

            bounds = path.bounds(admLevel);
            scale = 0.98 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height);
            translation = [(width - scale * (bounds[1][0] + bounds[0][0])) / 2, (height - scale * (bounds[1][1] + bounds[0][1])) / 2];

            container = svg.append("g")
                .attr("class", admLevelType + "-container");

            projection
                .scale(scale)
                .translate(translation);

            d3.json(dataJsonPath, function (jsonData) {

                var data = {},
                    min,
                    max;

                jsonData.forEach(function (d) {
                    data[d.id] = +d.value;
                });

                max = d3.max(d3.values(data));
                min = d3.min(d3.values(data));

                quantile = d3.scale.quantile()
                    .domain([min, max])
                    .range(d3.range(range));

                container.selectAll("." + admLevelType)
                    .data(admLevel.features)
                    .enter().append("path")
                    .attr("class", function (d) {
                        return admLevelType + " q" + quantile(data[d.id]) + "-" + range;
                    })
                    .attr("id", function (d) {
                        return admLevelType + "-" + d.id;
                    })
                    .attr("d", path);

                addTitle(title, svgId, admLevelType, width, height);
                addLegend(legendTitle, svgId, admLevelType, width, height, quantile.quantiles(), quantile.range());
            });
        });
    };

    return {
        choroplethMap: choroplethMap
    };
}());
