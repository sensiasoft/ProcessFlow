var Tree = function (port_pos) {
    var height = port_pos.top * 2;
    var width = window.innerWidth * 2;
    miserables.nodes[0].x = port_pos.left;
    miserables.nodes[0].y = port_pos.top;
    var svg = d3.select("#tree").append("svg")
        .attr("width", width)
        .attr("height", height);

    //var svg = d3.select("#paper-create").select('svg');

    var force = d3.layout.force()
        .gravity(0.03)
        .distance(50)
        .charge(-200)
        .size([width, height]);

    //    d3.json("graph.json", function (error, json) {
    //        if (error) throw error;
    var json = miserables;
    force
        .nodes(json.nodes)
        .links(json.links)
        .start();

    var link = svg.selectAll(".link")
        .data(json.links)
        .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(json.nodes)
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    node //.append("image")
    .append("circle")
        .attr("r", 5)
    //.attr("xlink:href", "https://github.com/favicon.ico")
    .attr("x", -8)
        .attr("y", -8)
        .attr("width", 16)
        .attr("height", 16);

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function (d) {
            return d.name
        });

    force.on("tick", function () {
        link.attr("x1", function (d) {
            return d.source.x;
        })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
    //    });
}


function drawIndentedTree(root, wherein) {

    var width = 300,
        minHeight = 800;
    var barHeight = 20,
        barWidth = 50;

    var margin = {
        top: -10,
        bottom: 10,
        left: 0,
        right: 10
    }

    var i = 0,
        duration = 200;

    var tree = d3.layout.tree()
        .nodeSize([0, 20]);

    var diagonal = d3.svg.diagonal()
        .projection(function (d) {
            return [d.y, d.x];
        });

    var svg = d3.select("#" + wherein).append("svg")
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // set initial coordinates
    root.x0 = 0;
    root.y0 = 0;

    // collapse all nodes recusively, hence initiate the tree
    function collapse(d) {
        d.Selected = false;
        if (d.children) {
            d.numOfChildren = d.children.length;
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        } else {
            d.numOfChildren = 0;
        }
    }
    root.children.forEach(collapse);

    update(root);

    function update(source) {

        // Compute the flattened node list. TODO use d3.layout.hierarchy.
        var nodes = tree.nodes(root);

        height = Math.max(minHeight, nodes.length * barHeight + margin.top + margin.bottom);

        d3.select("svg").transition()
            .duration(duration)
            .attr("height", height);

        // Compute the "layout".
        nodes.forEach(function (n, i) {
            n.x = i * barHeight;
        });

        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function (d) {
                return d.index || (d.index = ++i);
            });

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .style("opacity", 0.001)
            .attr("transform", function (d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            });

        // Enter any new nodes at the parent's previous position.
        nodeEnter.append("path").filter(function (d) {
            return d.numOfChildren > 0 && d.id != root.id
        })
            .attr("width", 9)
            .attr("height", 9)
            .attr("d", "M -3,-4, L -3,4, L 4,0 Z")
            .attr("class", function (d) {
                return "node " + d.type;
            })
            .attr("transform", "translate(-14, 0)")
            .on("click", click);

        node.select("path").attr("transform", function (d) {
            if (d.children) {
                return "translate(-14, 0)rotate(90)";
            } else {
                return "translate(-14, 0)rotate(0)";
            }
        });

        // Enter any new nodes at the parent's previous position.
        nodeEnter.append("rect").filter(function (d) {
            return d.id != root.id
        })
            .attr("width", 11)
            .attr("height", 11)
            .attr("y", -5)
            .attr("class", function (d) {
                return "node " + d.type;
            });

        nodeEnter.append("path").filter(function (d) {
            return d.parent
        })
            .attr("width", 9)
            .attr("height", 9)
            .attr("d", "M -5,-5, L -5,6, L 6,6, L 6,-5 Z M -5,-5, L 6,6, M -5,6 L 6,-5")
            .attr("class", function (d) {
                return "node " + d.type;
            })
            .attr("style", function (d) {
                return "opacity: " + boxStyle(d)
            })
            .attr("transform", "translate(5, 0)")
            .on("click", check);

        nodeEnter.append("text")
            .attr("dy", 5)
            .attr("dx", 14)
            .attr("class", function (d) {
                return "node " + d.type + " text";
            })
            .text(function (d) {
                return d.Name;
            });

        // Transition nodes to their new position.
        nodeEnter.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .style("opacity", 1);

        node.transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + d.y + "," + d.x + ")";
            })
            .style("opacity", 1)
            .select("rect");

        // Transition exiting nodes to the parent's new position.
        node.exit().transition()
            .duration(duration)
            .attr("transform", function (d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .style("opacity", 1e-6)
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d3.select(this).attr("translate(-14, 0)rotate(90)");
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }

    // Toggle check box on click.
    function check(d) {
        d.Selected = !d.Selected;
        d3.select(this).style("opacity", boxStyle(d));
    }

    function boxStyle(d) {
        return d.Selected ? 1 : 0;
    }
}
var root = {
    "name": "AUT-1",
    "children": [
        {
            "name": "PUB-1",
            "children": [
                {
                    "name": "AUT-11",
                    "children": [
                        {
                            "name": "AFF-111"
                        },
                        {
                            "name": "AFF-112"
                        }
            ]
                },
                {
                    "name": "AUT-12",
                    "children": [
                        {
                            "name": "AFF-121"
                        }
            ]
                },
                {
                    "name": "AUT-13",
                    "children": [
                        {
                            "name": "AFF-131"
                        },
                        {
                            "name": "AFF-132"
                        }
            ]
                },
                {
                    "name": "AUT-14",
                    "children": [
                        {
                            "name": "AFF-141"
                        }
            ]
                }
        ]
    },
        {
            "name": "PUB-2",
            "children": [
                {
                    "name": "AUT-21"
                },
                {
                    "name": "AUT-22"
                },
                {
                    "name": "AUT-23"
                },
                {
                    "name": "AUT-24"
                },
                {
                    "name": "AUT-25"
                },
                {
                    "name": "AUT-26"
                },
                {
                    "name": "AUT-27"
                },
                {
                    "name": "AUT-28",
                    "children": [
                        {
                            "name": "AFF-281"
                        },
                        {
                            "name": "AFF-282"
                        },
                        {
                            "name": "AFF-283"
                        },
                        {
                            "name": "AFF-284"
                        },
                        {
                            "name": "AFF-285"
                        },
                        {
                            "name": "AFF-286"
                        }
            ]
                }
        ]
    },
        {
            "name": "PUB-3"
        },
        {
            "name": "PUB-4",
            "children": [
                {
                    "name": "AUT-41"
                },
                {
                    "name": "AUT-42"
                },
                {
                    "name": "AUT-43",
                    "children": [
                        {
                            "name": "AFF-431"
                        },
                        {
                            "name": "AFF-432"
                        },
                        {
                            "name": "AFF-433"
                        },
                        {
                            "name": "AFF-434",
                            "children": [
                                {
                                    "name": "ADD-4341"
                                },
                                {
                                    "name": "ADD-4342"
                                },
                ]
                        }
            ]
                },
                {
                    "name": "AUT-44"
                }
        ]
    }
]
};