/*! JointJS v0.9.6 - JavaScript diagramming library  2015-12-19 


This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
if ("object" == typeof exports) var graphlib = require("graphlib"),
    dagre = require("dagre");
graphlib = graphlib || "undefined" != typeof window && window.graphlib, dagre = dagre || "undefined" != typeof window && window.dagre, joint.dia.Graph.prototype.toGraphLib = function (a) {
    a = a || {};
    var b = _.pick(a, "directed", "compound", "multigraph"),
        c = new graphlib.Graph(b),
        d = a.setNodeLabel || _.noop,
        e = a.setEdgeLabel || _.noop,
        f = a.setEdgeName || _.noop;
    return this.get("cells").each(function (a) {
        if (a.isLink()) {
            var b = a.get("source"),
                g = a.get("target");
            if (!b.id || !g.id) return;
            c.setEdge(b.id, g.id, e(a), f(a))
        } else c.setNode(a.id, d(a)), c.isCompound() && a.has("parent") && c.setParent(a.id, a.get("parent"))
    }), c
}, joint.dia.Graph.prototype.fromGraphLib = function (a, b) {
    b = b || {};
    var c = b.importNode || _.noop,
        d = b.importEdge || _.noop;
    a.nodes().forEach(function (d) {
        c.call(this, d, a, this, b)
    }, this), a.edges().forEach(function (c) {
        d.call(this, c, a, this, b)
    }, this)
}, joint.layout.DirectedGraph = {
    layout: function (a, b) {
        b = _.defaults(b || {}, {
            resizeClusters: !0,
            clusterPadding: 10
        });
        var c = a.toGraphLib({
                directed: !0,
                multigraph: !0,
                compound: !0,
                setNodeLabel: function (a) {
                    return {
                        width: a.get("size").width,
                        height: a.get("size").height,
                        rank: a.get("rank")
                    }
                },
                setEdgeLabel: function (a) {
                    return {
                        minLen: a.get("minLen") || 1
                    }
                },
                setEdgeName: function (a) {
                    return a.id
                }
            }),
            d = {};
        return b.rankDir && (d.rankdir = b.rankDir), 
        b.nodeSep && (d.nodesep = b.nodeSep), 
        b.edgeSep && (d.edgesep = b.edgeSep), 
        b.rankSep && (d.ranksep = b.rankSep), 
        b.marginX && (d.marginx = b.marginX), 
        b.marginY && (d.marginy = b.marginY), 
        c.setGraph(d), dagre.layout(c, {
            debugTiming: !!b.debugTiming
        }), 
        a.fromGraphLib(c, {
            importNode: function (a, c) {
                var d = this.getCell(a),
                    e = c.node(a);
                b.setPosition ? b.setPosition(d, e) : d.set("position", {
                    x: e.x - e.width / 2,
                    y: e.y - e.height / 2
                })
            },
            importEdge: function (a, c) {
                var d = this.getCell(a.name),
                    e = c.edge(a);
                b.setLinkVertices && (b.setVertices ? b.setVertices(d, e.points) : d.set("vertices", e.points))
            }
        }), b.resizeClusters && _.chain(c.nodes()).filter(function (a) {
            return c.children(a).length > 0
        }).map(a.getCell, a).sortBy(function (a) {
            return -a.getAncestors().length
        }).invoke("fitEmbeds", {
            padding: b.clusterPadding
        }).value(), c.graph()
    }
};