// MainWindow
const { ipcRenderer } = require("electron");
const d3 = require("d3");

const zoom = d3.zoom().scaleExtent([1, 40]).on("zoom", zoomed);

cols = d3.schemeCategory10;

var links, nodes, scale, simulation;

var select = false;

const header = d3.select("#titlename");
const svg = d3.select("#graph");
const width = window.innerWidth;
const height = window.innerHeight * 0.8;

svg.attr("viewBox", [0, 0, width * 2, height * 2]);
svg.call(zoom);
var g = svg.append("g");

var node;
var link;

async function draw() {
    g.remove();
    g = svg.append("g");

    data = await d3.json(__dirname.split('UKCAexplorer')[0]+"/fgraph.json");
    nodes = Object.values(JSON.parse(data["nodes"]));
    links = Object.values(JSON.parse(data["links"]));

    scale = {};

    links = [...links];
    nodes = [
        ...nodes.map((d, i) => {
            d.id = d.routine;
            d.index = i;
            d.r = d.code ? d.code.match(/\n/gi).length : 1;
            // d.x = Math.random()*100;
            // d.y = Math.random()*100;
            return d;
        })
    ];

    const max = d3.max(nodes.map(d => d.r));

    nodes = nodes.map(d => {
        d.r = 3 + 11 * Math.sqrt(d.r / max);
        return d;
    });

    console.log(nodes, links, scale);

    link = g
        .append("g")
        .attr("class", "links")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("id", d => "l" + d.source + d.target)
        .each(d => {
            d3
                .select("#l" + d.source + d.target)
                .classed("links_" + d.source, true)
                .classed("linkt_" + d.target, true);
        })
        .attr("stroke-width", d => Math.sqrt(2));

    node = g
        .append("g")
        .attr("class", "nodes")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("g")
        .attr("id", d => d.id)
        .each(d => {
            d3
                .select("#" + d.id)
                .classed("source_" + d.source, true)
                .classed("target_" + d.target, true);
        })
        .on("mouseover", (e, d) => {
            header.text(d.id);
            // console.log(d,
            // d.module+':'+d.source)
            if (select) {
                ipcRenderer.send("highlightcode", d.id);
                console.log("highlight", d.id);
            }
        })
        .on("click", (e, d) => {
            select = !select;
            console.log(select);

            header.text(d.id);
            console.log(d, d.module + ":" + d.source);
            if (select) {
                ipcRenderer.send("newcode", { code: d.code, id: d.id });

                sources = links.filter(t => t.target.id == d.id);
                targets = links.filter(t => t.source.id == d.id);

                node.style("opacity", 0.3);
                link.attr("opacity", 0.2);
                d3.select("#" + d.id).style("opacity", 1);

                d3
                    .selectAll(".links_" + d.id)
                    .attr("opacity", 1)
                    .attr("stroke", "red")
                    .attr("stroke-width", 3);
                d3
                    .selectAll(".linkt_" + d.id)
                    .attr("opacity", 1)
                    .attr("stroke", "blue")
                    .attr("stroke-width", 3);

                sources.forEach(n => {
                    d3
                        .select("#" + n.source.id)
                        .style("opacity", 1)
                        .style("fill", "red!important");
                });
                targets.forEach(n => {
                    d3
                        .select("#" + n.target.id)
                        .style("opacity", 1)
                        .style("fill", "blue!important");
                });

                console.log(targets);

                //
            } else {
                node.style("opacity", 0.7);
                link
                    .attr("opacity", 0.6)
                    .attr("stroke", "gray")
                    .attr("stroke-width", 2);
            }
        })
        .call(d3.drag(simulation))


    node
        .append("circle")
        .attr("r", d => d.r + 1)
        .attr("stroke", d => {
            if (+d.loop) {
                return ncolour(d);
            } else {
                return "none";
            }
        })
        .attr("stroke-width", 2);

    node
        .append("circle")
        .style("fill", ncolour)
        // parseInt(d.UKCA) >0?cols[1]:cols[0])
        .attr("r", d => d.r)
        .attr("stroke", "white")
        .attr("stroke-width", 2);

    function ncolour(d) {
        if (d.parent.includes("UKCA")) {
            return cols[0];
        } else if (d.parent.includes("ASAD")) {
            return cols[1];
        } else if (d.parent.includes("FASTJ")) {
            return "purple";
        } else {
            return "gray";
        }
    }

    d3
        .selectAll(".target_undefined")
        .attr("fill", "gray")
        .attr("opacity", ".6");

    node.append("title").text(d => d.id);

    simulation = d3
        .forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-20))
        .force("center", d3.forceCenter(width, height).strength(1))
        .force(
            "collision",
            d3.forceCollide().radius(function(d) {
                return d.r + 4.5;
            })
        )
        .force("link", d3.forceLink(links).id(d => d.id))
        .on("tick", ticked);
    // simulation.alpha(1.1)
    simulation.alphaDecay(.009)
    simulation.stop()
    
    var radius = 16;
    var w2 = width * 2 - radius;
    var h2 = height * 2 - radius;
    function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        // node
        //     .attr("cx", d => d.x)
        //     .attr("cy", d => d.y);
        //

        nodes = nodes.map(d => {
            if (d.x < w2) {
                if (radius > d.x) {
                    d.x = radius * 2 - d.x;
                    d.vx *= -20;
                }
            } else {
                d.x = w2 - (d.x - w2);
                d.vx *= -20;
            }

            if (d.y < h2) {
                if (radius > d.y) {
                    d.y = radius * 2 - d.y;
                    d.vy *= -20;
                }
            } else {
                d.y = h2 - (d.y - h2);
                d.vy *= -20;
            }

            return d;
        });
        node.attr("transform", function(d) {
            // d.x = Math.max(radius, Math.min(width*2 - radius, d.x))
            // d.y = Math.max(radius, Math.min(height*2 - radius, d.y))
            return `translate(${d.x},${d.y})`;
        });

        if (simulation.alpha() < 0.1) {
            simulation.stop();
        }
        //
    }
}

draw().then(d=>d)
ipcRenderer.on('start', (event, arg) => {simulation.restart()})
    
    
    
function zoomed({ transform }) {
    g.attr("transform", transform);
}

function resetzoom() {
    svg
        .transition()
        .duration(750)
        .call(
            zoom.transform,
            d3.zoomIdentity,
            d3.zoomTransform(svg.node()).invert([width / 2, height / 2])
        );
}
