/**
 * Displays the dashboard using data from the server.
 */
function dashboard() {
    // request json file containing everything needed for the dashboard
    d3.json("static/dashboard.json").then(json => {

        // store data from the response in variables
        const labels1 = json.labels1
        const labels2 = json.labels2
        const precinct_labels = json.precinct_labels
        const data = json.data
        const precincts1 = json.precincts1
        const precincts2 = json.precincts2
        const variance_ratio1 = json.variance_ratio1
        const variance_ratio2 = json.variance_ratio2
        const bi1 = json.components1
        const bi2 = json.components2
        
        // build the dashboard using the variables
        createMap(precinct_labels, [precincts1, precincts2], ["map", "pie1", "pie2"], 425, 425)
        visualize("Complaint Year Number", data)
        createBiplot(data, labels1, bi1, variance_ratio1, "pcaplot1", pc1="PC1a", pc2="PC2a", 300, 350, 5, "Hate Crimes (Race Only)")
        createBiplot(data, labels2, bi2, variance_ratio2, "pcaplot2", pc1="PC1b", pc2="PC2b", 300, 350, 5, "Hate Crimes (Race and Ethnicity)")
        addPiePlaceholder()
        
        // add onchange event listener to update dashboard based on value of dropdown
        const dropdown = document.getElementById("dropdown")
        dropdown.addEventListener("change", () => visualize(dropdown.value, data))
    })
}

/**
 * Updates bar chart based on value of dropdown.
 * @param {*} v Value of dropdown.
 * @param {*} data Data from server.
 */
function visualize(v, data) {
    // resize the dropdown to fit new value of dropdown
    resizeSelect()

    // remove old bar chart or histogram
    d3.select("#barhisto svg").remove()

    // extract data corresponding to value of dropdown
    let a = d3.map(data, d => d[v])

    // count number of hate crimes in each category
    const m = new Map()
    a.forEach(d => {
        let f = m.get(d)
        if(f)
            m.set(d, f + 1)
        else
            m.set(d, 1)
    })
    
    // convert the Map to a list and count number of hate crimes
    const lst = []
    let t = 0
    for(const [k, v] of m) {
        lst.push([k, v])
        t += v
    }

    // sort the list by number of hate crimes in each category in descending order
    lst.sort((a, b) => b[1] - a[1])
    
    // if there is more than 6 categories
    let bar = lst
    let barSum = 0
    if(lst.length > 6) {
        // keep the first five categories
        bar = lst.slice(0, 5)
        
        // keep any other categories that make up at least 1% of the hate crimes and combine the rest into an "other" category
        const lstSlice = lst.slice(5)
        lstSlice.forEach(a => {
            if(a[1] < 0.01 * t)
                barSum += a[1]
            else
                bar.push(a)
        })
    }

    // sort the categories in alphabetical/numerical order
    bar.sort((a, b) => a[0].toString().localeCompare(b[0].toString(), undefined, {numeric: true}))

    // if "other" category contains hate crimes, add it and its number of hate crimes to the list
    if(barSum > 0)
        bar.push(["Other", barSum])

    // create bar chart using the list
    createBarChart(v, "Number of Hate Crimes", new Map(bar), "barhisto", height=275, width=750)

    // correct title of bar chart
    const barhisto = d3.select("#barhisto")
    barhisto.select(".title").text("Number of Hate Crimes By " + barhisto.select(".x-axis-label").text())

    // reset coloring and bar event listeners
    changeColoring(v, data)
}

/**
 * Resets coloring and adds new onclick event listeners to bars.
 * @param {*} v Value of dropdown.
 * @param {*} data Data from server.
 */
function changeColoring(v, data) {
    // remove legend and reset coloring of map and biplots
    d3.select("#map .legend").style("display", "none")
    d3.selectAll(".map").attr("fill", "silver")
    d3.selectAll(".pcaplot1").attr("fill", "silver")
    d3.selectAll(".pcaplot2").attr("fill", "silver")

    // define values to be used later
    const colors = ["#6a51a3"]
    const used = [false]
    const rect = d3.selectAll("#barhisto rect")

    // create a filter function to select data points to be colored
    const set = new Set(rect.data())
    let filter
    // for histograms, create a filter function that checks if the data value is in a range
    if(v.includes(":")) {
        const last = rect.data().length - 1
        filter = (d, i, x) => i === last ? d[v] >= x.x0 && d[v] <= x.x1 : d[v] >= x.x0 && d[v] < x.x1
    }
    // for bar charts, create a filter function that checks if the data value matches a category
    else
        filter = (d, i, x) => x === "Other" ? !set.has(d[v]) : d[v] === x

    // for each bar/category of the bar chart or histogram
    rect.each(function(x, bin) {
        // count the number of hate crimes in each precinct
        const m = new Map()
        data.forEach(d => {
            if((x === "Other" && !set.has(d[v])) || d[v] === x) {
                let f = m.get(d["Precinct"])
                if(f)
                    m.set(d["Precinct"], f + 1)
                else
                    m.set(d["Precinct"], 1)
            }
        })

        // calculate the max number of hate crimes in any precinct and create a color scale with it for the map
        const max = d3.max([...m.values()])
        const colorScale = d3.scaleLinear().domain([0, max]).range(["#f2f0f7","#54278f"])
        
        // add onclick event listener to bar
        const bar = d3.select(this)
        bar.on("click", function(e, x) {
            const fill = bar.attr("fill")
            // if clicked on bar has not been clicked on previously, color the bar, map, and biplots based on selected bar and add legend to map
            if(fill === "silver") {
                const ind = used.findIndex(u => !u)
                if(ind != -1) {
                    bar.attr("fill", colors[ind])
                    d3.selectAll("#map .tick text").text((d, i) => i === 0 ? d : max)
                    d3.select("#map .legend").style("display", "block")
                    d3.selectAll(".map").attr("fill", (d, i) => colorScale(m.get(+d.properties.precinct) || 0))
                    d3.selectAll(".pcaplot1").filter((d, i) => filter(d, bin, x)).attr("fill", colors[ind]).raise()
                    d3.selectAll(".pcaplot2").filter((d, i) => filter(d, bin, x)).attr("fill", colors[ind]).raise()
                    used[ind] = true
                }
            }
            // if clicked on bar has been clicked on previously, remove coloring from the bar, map, and biplots and remove the map legend
            else {
                bar.attr("fill", "silver")
                d3.select("#map .legend").style("display", "none")
                d3.selectAll(".map").attr("fill", "silver")
                d3.selectAll(".pcaplot1").filter((d, i) => filter(d, bin, x)).attr("fill", "silver").lower()
                d3.selectAll(".pcaplot2").filter((d, i) => filter(d, bin, x)).attr("fill", "silver").lower()
                used[colors.findIndex(c => c === fill)] = false
            }
        })
    })
}

/**
 * Wraps labels so that they are on multiple lines instead of a single line.
 * @param {*} labels Labels to be wrapped.
 * @param {*} width Maximum width of each line.
 * @param {*} t Type of label wrapping to perform.
 */
function wrapLabels(labels, width, t=null) {
    // for each label
    labels.each(function(label) {
        // remove text
        const text = d3.select(this)
        text.text("")

        // add a tspan element for each line of the wrapped label
        let prev = null
        let i = 1
        for(const word of label.toString().replaceAll(/([,-])/g, "$1 ").split(/\s+/)) {
            const str = prev ? prev.text() + (prev.text()[prev.text().length - 1] === "-" ? "" : " ") : ""
            let line = text.append("tspan").text(str + word)
            if(line.node().getBoundingClientRect().width > width) {
                line.remove()
                line = text.append("tspan").text(word)
                i += 1
            }
            else if(prev)
                prev.remove()
            prev = line
        }

        // arrange the tspan elements based on whether the label is from the x-axis, y-axis, or not from an axis
        if(t === "x") {
            text.selectAll("tspan").attr("x", 0).attr("dy", "1em")
            text.select("tspan").attr("dy", labels.attr("dy"))
        }
        else if(t === "y") {
            text.selectAll("tspan").attr("x", labels.attr("x")).attr("y", 0)
            let dy = -(i - 1) / 2 + parseFloat(labels.attr("dy"))
            text.selectAll("tspan").each(function(label) {
                d3.select(this).attr("dy", dy + "em")
                dy += 1
            })
        }
        else {
            text.selectAll("tspan").attr("x", labels.attr("x")).attr("y", labels.attr("y"))
            let dy = parseFloat(labels.attr("dy"))
            text.selectAll("tspan").each(function(label) {
                d3.select(this).attr("dy", dy + "em")
                dy += 1
            })
        }
    })
}

/**
 * Resizes the dropdown to fit the value of the dropdown.
 */
function resizeSelect() {
    const title = document.getElementById("title")
    const dropdown = document.getElementById("dropdown")
    const select = title.appendChild(document.createElement("select"))
    select.style.fontSize = 18 + "px"
    const option = select.appendChild(document.createElement("option"))
    option.innerHTML = dropdown.value
    dropdown.style.width = select.offsetWidth + "px"
    title.removeChild(select)
}

/**
 * Adds text to serve as a placeholder for the pie charts until a precinct is clicked on.
 */
function addPiePlaceholder() {
    // define dimensions of placeholder
    const height = 150
    const width = 190

    // add text to serve as one of the placeholders
    const pie1 = d3.select("#pie1")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("text")
                    .data(["Click a precinct above to show demographics by race only."])
                    .attr("text-anchor", "middle")
                    .attr("transform", (d, i) => `translate(${width/2}, ${height/2})`)
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("dy", "-0.29em")
                    .text((d, i) => d)
    
    // add text to serve as the other placeholder
    const pie2 = d3.select("#pie2")
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .append("text")
                    .data(["Click a precinct above to show demographics by race and ethnicity."])
                    .attr("text-anchor", "middle")
                    .attr("transform", (d, i) => `translate(${width/2}, ${height/2})`)
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("dy", "-0.29em")
                    .text((d, i) => d)

    // wrap both texts
    wrapLabels(pie1, width/2)
    wrapLabels(pie2, width/2)
}