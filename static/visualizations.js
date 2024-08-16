/**
 * Creates a bar chart.
 * @param {*} xv Name of variable on x-axis.
 * @param {*} yv Name of variable on y-axis.
 * @param {*} m Map of category/number of occurrences pairs.
 * @param {*} id Id of div element in html file.
 * @param {*} height Height of bar chart.
 * @param {*} width Width of bar chart.
 */
function createBarChart(xv, yv, m, id, height=500, width=1200) {
    // define margins of bar chart
    const margin = {top: 25, bottom: 55, left: 55, right: 10}

    // create a svg element
    const svg = d3.select("#" + id)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

    // define x and y domains
    const xDomain = [...m.keys()]
    const yDomain = [0, d3.max(m.values())]
    
    // define x and y ranges
    const xRange = [margin.left, width - margin.right]
    const yRange = [height - margin.bottom, margin.top]

    // create band scale for x-axis and linear scale for y-axis
    const xScale = d3.scaleBand(xDomain, xRange).padding(0.1)
    const yScale = d3.scaleLinear(yDomain, yRange)

    // create x-axis and y-axis
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale)

    // display x-axis
    const xaxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(xAxis)

    // wrap labels on x-axis
    wrapLabels(xaxis.selectAll(".tick text"), xScale.step(), "x")

    // display y-axis
    const yaxis = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis)

    // wrap labels on y-axis
    wrapLabels(yaxis.selectAll(".tick text"), 90, "y")

    // create bars for each category
    const dataValue = d3.select("#datavalue")
    svg.append("g")
        .selectAll("rect")
        .data(xDomain)
        .join("rect")
        .attr("x", (d, i) => xScale(d))
        .attr("y", (d, i) => yScale(m.get(d)))
        .attr("width", xScale.bandwidth())
        .attr("height", (d, i) => yScale(0) - yScale(m.get(d)))
        .attr("fill", "silver")
        // add onmouseenter event listener to display the bar value
        .on("mouseenter", function(e, d) {
            d3.select(this)
                .transition()
                .duration(50)
                .style("opacity", 0.8)
            dataValue.html(m.get(d) + "")
                .transition()
                .duration(50)
                .style("opacity", 1)
        })
        // add onmouseleave event listener to hide the bar value
        .on("mouseleave", function(e, d) {
            d3.select(this)
                .transition()
                .duration(50)
                .style("opacity", 1)
            dataValue.transition()
                .duration(50)
                .style("opacity", 0)
        })
        // add onmousemove event listener to move the bar value
        .on("mousemove", function(e, d) {
            dataValue.style("left", e.pageX + 5 + "px")
                .style("top", e.pageY - 30 + "px")
        })

    // add x-axis label
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", height - margin.bottom + 50)
        .text(xv)

    // add y-axis label
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(270)")
        .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
        .attr("y", margin.left - 45)
        .text(yv)

    // add title
    svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", 10)
        .text(`Hate Crimes By ${xv} and ${yv}`)
}

/**
 * Creates a pie chart.
 * @param {*} v Name of variable.
 * @param {*} m Map of category/number of occurrences pairs.
 * @param {*} id Id of div element in html file.
 * @param {*} height Height of pie chart.
 * @param {*} width Width of pie chart.
 * @param {*} margin Margin around pie chart.
 * @param {*} addLegend Whether or not to add a legend.
 */
function createPieChart(v, m, id, height=440, width=400, margin=40, addLegend=true) {
    // calculate radius of the pie
    const radius = (height - margin)/2

    // create a svg element
    const svg = d3.select("#" + id)
                    .append("svg")
                        .attr("width", width)
                        .attr("height", height)
    
    // define colors to be used
    const colors = ["#a6cee3","#1f78b4","#b2df8a","#33a02c","#fb9a99","#e31a1c","#fdbf6f"]
    
    // define values to be used later
    const keys = [...m.keys()]
    const values = [...m.values()]
    const total = values.reduce((s, v) => s += v)
    const f = d3.format(".1f");
    
    // calculate values for the pie
    const pie = d3.pie()
    const slices = pie(values)
    const arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius)
    
    // create a pie slice for each category
    const dataValue = d3.select("#datavalue")
    svg.append("g")
        .attr("transform", `translate(${width/2}, ${height - (height - margin)/2})`)
        .selectAll("path")
        .data(slices)
        .join("path")
            .attr("d", arc)
            .attr("fill", (d, i) => colors[i])
            .each(function(d, i) {
                const slice = d3.select(this)
                // add onmouseenter event listener to display the pie slice category and percentage
                slice.on("mouseenter", function(e, d) {
                    slice.transition()
                        .duration(50)
                        .style("opacity", 0.8)
                    dataValue.html((addLegend ? "" : keys[i] + "<br>") + f(d.data * 100 / total) + "%")
                            .transition()
                            .duration(50)
                            .style("opacity", 1)
                    })
                    // add onmouseleave event listener to hide the pie slice category and percentage
                    .on("mouseleave", function(e, d) {
                        slice.transition()
                            .duration(50)
                            .style("opacity", 1)
                        dataValue.transition()
                                .duration(50)
                                .style("opacity", 0)
                    })
                    // add onmousemove event listener to move the pie slice category and percentage
                    .on("mousemove", function(e, d) {
                        dataValue.style("left", e.pageX + 5 + "px")
                                .style("top", e.pageY - 30 + "px")
                    })
            })

    // add title
    svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", width/2)
        .attr("y", 10)
        .text("Number of Hate Crimes By " + v)

    // add legend if addLegend is true
    if(addLegend) {
        svg.append("g")
            .attr("class", "legend")
            .selectAll("circle")
            .data(slices)
            .join("circle")
                .attr("cx", width)
                .attr("cy", (d, i) => (i + 3) * 20)
                .attr("r", 5)
                .attr("fill", (d, i) => colors[i])

        svg.select(".legend")
            .selectAll("text")
            .data(slices)
            .join("text")
                .attr("x", width + 10)
                .attr("y", (d, i) => (i + 3) * 20 + 5)
                .text((d, i) => keys[i])
        
        // resize svg element to fit pie chart
        const newWidth = width + svg.select("g.legend").node().getBoundingClientRect().width
        svg.attr("width", newWidth)
        svg.select(".title").attr("x", newWidth/2)
    }
}

/**
 * Creates a scatter plot.
 * @param {*} xv Name of variable on x-axis.
 * @param {*} yv Name of variable on y-axis.
 * @param {*} histoX Whether or not the x variable is numerical.
 * @param {*} histoY Whether or not the y variable is numerical.
 * @param {*} data Data to be plotted.
 * @param {*} id Id of div element in html file.
 * @param {*} height Height of scatter plot.
 * @param {*} width Width of scatter plot.
 * @param {*} jitter Amount of physical jitter to add to plotted data points.
 * @param {*} isPcaPlot Whether or not this function is being used to create a PCA plot.
 * @returns Scales of the axes of created scatter plot.
 */
function createScatterPlot(xv, yv, histoX, histoY, data, id, height=500, width=1200, jitter=0, isPcaPlot=false) {
    // define margins of scatter plot
    const margin = {top: 25, bottom: 55, left: 140, right: 10}
    if(histoX)
        margin.bottom = 45
    if(histoY)
        margin.left = 55

    // create a svg element
    const svg = d3.select("#" + id)
        .append("svg")
        .attr("width", width)
        .attr("height", height)

    // create x-axis
    const xDomain = histoX ? d3.extent(data, d => d[xv]) : d3.map(data, d => d[xv])
    const xRange = [margin.left, width - margin.right]
    const xScale = histoX ? d3.scaleLinear(xDomain, xRange) : d3.scalePoint(xDomain, xRange).padding(0.5)
    const xAxis = d3.axisBottom(xScale)

    // display x-axis
    const xaxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(xAxis)

    // wrap labels on x-axis
    const ticks = xAxis.ticks()
    wrapLabels(xaxis.selectAll(".tick text"), (histoX ? xScale(ticks[1]) - xScale(ticks[0]) : xScale.step()), "x")

    // add x-axis label
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("text-anchor", "middle")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", height - margin.bottom + (histoX ? 40 : 50))
        .text(xv)

    // create y-axis
    const yDomain = histoY ? d3.extent(data, d => d[yv]) : d3.map(data, d => d[yv])
    const yRange = [height - margin.bottom, margin.top]
    const yScale = histoY ? d3.scaleLinear(yDomain, yRange) : d3.scalePoint(yDomain, yRange).padding(0.5)
    const yAxis = d3.axisLeft(yScale)

    // display y-axis
    const yaxis = svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(yAxis)

    // wrap labels on y-axis
    wrapLabels(yaxis.selectAll(".tick text"), 90, false)

    // add y-axis label
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(270)")
        .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
        .attr("y", margin.left - (histoY ? 45 : 60))
        .text(yv)

    // add title
    svg.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
        .attr("y", 10)
        .text(`Hate Crimes Plotted By ${xv} and ${yv}`)

    // plot data points on scatter plot
    const dataValue = d3.select("#datavalue")
    const shown = svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", id)
        .attr("cx", (d, i) => xScale(d[xv]))
        .attr("cy", (d, i) => yScale(d[yv]))
        .attr("r", 1)
        .attr("fill", "silver")
    
    // if not being used to create a PCA plot
    if(!isPcaPlot) {
        // add onmouseenter event listener to display the data point's x and y values
        shown.on("mouseenter", function(e, d) {
            dataValue.html(`(${d[xv]}, ${d[yv]})`)
                .transition()
                .duration(50)
                .style("opacity", 1)
            })
            // add onmouseleave event listener to hide the data point's x and y values
            .on("mouseleave", function(e, d) {
                dataValue.transition()
                    .duration(50)
                    .style("opacity", 0)
            })
            // add onmousemove event listener to move the data point's x and y values
            .on("mousemove", function(e, d) {
                dataValue.style("left", e.pageX + 5 + "px")
                    .style("top", e.pageY - 30 + "px")
            })
    }

    // create a function to calculate a random amount of jitter
    const randomJitter = () => {
        const radius = jitter
        const r = radius * Math.sqrt(Math.random())
        const theta = Math.random() * 2 * Math.PI
        const x = r * Math.cos(theta)
        const y = r * Math.sin(theta)
        return [x, y]
    }

    // add jitter to data points if greater than zero
    if(jitter > 0)
        shown.attr("transform", (d, i) => `translate(${randomJitter()})`)

    // return scales of x-axis and y-axis
    return [xScale, yScale]
}

/**
 * Creates a PCA plot.
 * @param {*} data Data to be plotted.
 * @param {*} variance_ratio Variance percentages of principal components.
 * @param {*} id Id of div element in html file.
 * @param {*} pc1 Name of first principal component in data.
 * @param {*} pc2 Name of second principal component in data.
 * @param {*} height Height of PCA plot.
 * @param {*} width Width of PCA plot.
 * @param {*} jitter Amount of physical jitter to add to plotted data points.
 * @param {*} isBiplot Whether or not this function is being used to create a biplot.
 * @returns Scales of the axes of created PCA plot.
 */
function createPCAPlot(data, variance_ratio, id, pc1="PC1", pc2="PC2", height=500, width=500, jitter=0, isBiplot=false) {
    // define values to be used later
    const f = d3.format(".2%")

    // create a scatter plot that is scaled down if it is being used to create a biplot and one that is not scaled down if not
    let axes
    if(isBiplot) {
        const x = d3.extent(data, d => d[pc1])
        const y = d3.extent(data, d => d[pc2])
        const scale = [1 / (x[1] - x[0]) * 1.5, 1 / (y[1] - y[0]) * 1.5]
        axes = createScatterPlot(pc1, pc2, true, true, d3.map(data, d => Object.assign({}, d, {[pc1]: d[pc1] * scale[0], [pc2]: d[pc2] * scale[1]})), id, height=height, width=width, jitter=jitter, isPcaPlot=true)
    }
    else
        axes = createScatterPlot(pc1, pc2, true, true, data, id, height=height, width=width, jitter=jitter, isPcaPlot=true)

    // correct x-axis label, y-axis label, and title
    const pcaplot = d3.select("#" + id)
    pcaplot.select(".x-axis-label").text(`PC1 (${f(variance_ratio[0])})`)
    pcaplot.select(".y-axis-label").text(`PC2 (${f(variance_ratio[1])})`)
    pcaplot.select(".title").text("PCA Plot")

    // return scales of x-axis and y-axis
    return axes
}

/**
 * Creates a biplot.
 * @param {*} data Data to be plotted.
 * @param {*} labels Labels for vectors on biplot.
 * @param {*} bi Values for vectors on biplot.
 * @param {*} variance_ratio Variance percentages of principal components.
 * @param {*} id Id of div element in html file.
 * @param {*} pc1 Name of first principal component in data.
 * @param {*} pc2 Name of second principal component in data.
 * @param {*} height Height of biplot.
 * @param {*} width Width of biplot.
 * @param {*} jitter Amount of physical jitter to add to plotted data points.
 * @param {*} title Title of biplot.
 */
function createBiplot(data, labels, bi, variance_ratio, id, pc1="PC1", pc2="PC2", height=500, width=500, jitter=0, title="Biplot") {
    // create a PCA plot
    const axes = createPCAPlot(data, variance_ratio, id, pc1=pc1, pc2=pc2, height=height, width=width, jitter=jitter, isBiplot=true)

    // calculate positions of the origin and vectors
    const origin = [axes[0](0), axes[1](0)]
    const dimensions = d3.map(bi, b => [axes[0](b[0]), axes[1](b[1])])

    // correct title
    const biplot = d3.select("#" + id + " svg")
    biplot.select(".title").text(title)

    // create arrowhead of vector
    biplot.append("defs")
        .append("marker")
        .attr("id", "arrow")
        .attr("refX", 3)
        .attr("refY", 3)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", d3.line()([[0, 0], [0, 6], [6, 3]]))

    // create line of vector
    biplot.append("g")
        .selectAll("path")
        .data(labels)
        .join("path")
        .attr("d", (d, i) => d3.line()([origin, dimensions[i]]))
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("marker-end", "url(#arrow)")
        .style("pointer-events", "none")

    // add labels to vectors
    const biplotLabels = biplot.append("g")
        .selectAll("text")
        .data(labels)
        .join("text")
        .attr("text-anchor", "middle")
        .attr("transform", (d, i) => `translate(${dimensions[i]})`)
        .attr("x", 0)
        .attr("y", 0)
        .attr("font-size", "10px")
        .attr("dy", ".71em")
        .style("pointer-events", "none")
        .text((d, i) => d)

    // wrap vector labels
    wrapLabels(biplotLabels, 135)

    // make changes to specific labels for visibility purposes
    biplotLabels.each(function(d, i) {
        const label = d3.select(this)
        const height = label.node().getBoundingClientRect().height
        if(d === "American Indian and Alaska Native alone")
            label.attr("text-anchor", "start").attr("x", 10)
        else if(d === "Native Hawaiian and Other Pacific Islander alone" || d === "Some Other Race alone" || d === "Not Hispanic or Latino: American Indian and Alaska Native alone" || d === "Not Hispanic or Latino: Some Other Race alone") {
            label.attr("text-anchor", "start").attr("x", 10)
            label.selectAll("tspan").attr("y", -height)
        }
        else if(bi[i][1] < 0)
            label.selectAll("tspan").attr("y", 5)
        else
            label.selectAll("tspan").attr("y", -height)
    })
}

/**
 * Creates a NYC precinct map.
 * @param {*} labels Labels for precincts on map.
 * @param {*} data List of race only and race with ethnicity precinct population data.
 * @param {*} id List containing ids of map and pie div elements in html file.
 * @param {*} height Height of map.
 * @param {*} width Width of map.
 */
function createMap(labels, data, id, height=500, width=500) {
    // create a svg element
    const svg = d3.select("#" + id[0])
                .append("svg")
                .attr("height", height)
                .attr("width", width)

    // define values to be used for the legend
    const legendWidth = 15
    const legendHeight = 100
    const max = 1
    const legendScale = d3.scalePoint().domain([0, max]).range([legendHeight, 0])

    // create legend
    const legend = svg.append("g")
                        .attr("class", "legend")
                        .attr("transform", `translate(${70 + legendWidth + 0.5}, ${50})`)
                        .style("display", "none")
                        .call(d3.axisRight(legendScale).tickValues([0, max]))

    // create gradient for legend
    const gradient = svg.append("defs")
                        .append("linearGradient")
                        .attr("id", "mapGradient")
                        .attr("x1", "0%")
                        .attr("y1", "100%")
                        .attr("x2", "0%")
                        .attr("y2", "0%")
    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#f2f0f7")
    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#54278f")
    
    // create color scale for legend
    legend.append("rect")
        .attr("x", -(legendWidth + 0.5))
        .attr("y", legendScale(max))
        .attr("width", legendWidth)
        .attr("height", legendScale(0) - legendScale(max))
        .attr("fill", "url(#mapGradient)")

    // add legend title
    legend.append("text")
        .attr("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", -10)
        .attr("fill", "black")
        .text("Number of Hate Crimes")
    
    // request geojson file containing precinct map data
    d3.json("static/PolicePrecincts.geojson").then(geojson => {
        // display the map using the geojson data
        const projection = d3.geoMercator().fitSize([width, height], geojson)
        const dataValue = d3.select("#datavalue")
        svg.append("g")
            .selectAll("path")
            .data(geojson.features)
            .join("path")
                .attr("class", "map")
                .attr("d", d3.geoPath().projection(projection))
                .attr("fill", "silver")
                .attr("stroke", "black")
                .each(function(d, i) {
                    // convert precinct population data to a Map
                    const m1 = new Map(Object.entries(data[0][i]))
                    const m2 = new Map(Object.entries(data[1][i]))
                    
                    // add onmouseenter event listener to display the precinct name
                    const path = d3.select(this)
                    path.on("mouseenter", function(e, d) {
                            path.transition()
                                .duration(50)
                                .style("opacity", 0.8)
                            dataValue.html(labels[i])
                                .transition()
                                .duration(50)
                                .style("opacity", 1)
                        })
                        // add onmouseleave event listener to hide the precinct name
                        .on("mouseleave", function(e, d) {
                            path.transition()
                                .duration(50)
                                .style("opacity", 1)
                            dataValue.transition()
                                .duration(50)
                                .style("opacity", 0)
                        })
                        // add onmousemove event listener to move the precinct name
                        .on("mousemove", function(e, d) {
                            dataValue.style("left", e.pageX + 5 + "px")
                                    .style("top", e.pageY - 30 + "px")
                        })
                        // add onclick event listener to display the pie charts corresponding to the precinct
                        .on("click", function(e, d) {
                            // select pie div elements
                            const pie1 = d3.select("#" + id[1])
                            const pie2 = d3.select("#" + id[2])

                            // remove old pie charts
                            pie1.select("svg").remove()
                            pie2.select("svg").remove()

                            // create new pie charts
                            createPieChart("", m1, id[1], height=150, width=190, margin=20, addLegend=false)
                            createPieChart("", m2, id[2], height=150, width=190, margin=20, addLegend=false)

                            // correct title
                            pie1.select(".title").text(labels[i] + " (Race Only)")
                            pie2.select(".title").text(labels[i] + " (Race and Ethnicity)")
                        })
                })
    })
}