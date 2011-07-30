//  Copyright (C) 2011 by Enrico Franchi
//
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//
//  The above copyright notice and this permission notice shall be included in
//  all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
//  THE SOFTWARE.

Function.prototype.method = function(name, func) {
    this.prototype[name] = func;
    return this;
}

Object.method("forEach", function(callback) {
    var key;
    for (key in this) {
        if(this.hasOwnProperty(key)) {
            callback(key, this[key]);
        }
    }
})

Object.method("keys", function() {
    var keys = [];
    this.forEach(function(key, value) {
        keys.push(key);
    });
    return keys;
})

Array.method("remove", function(item) {
    var idx = this.indexOf(item);
    if (idx !== -1) {
        this.splice(idx, 1);
    }
});

var randomInteger = function(lower_bound, upper_bound) {
    if (upper_bound === undefined) {
        upper_bound = lower_bound;
        lower_bound = 0;
    }
    return Math.floor(Math.random() * upper_bound) + lower_bound;
}

var randomElement = function(from) {
    var max_length = from.length;
    var random_index, k, candidates;

    if (max_length === undefined) {
        candidates = from.keys();
        return randomElement(candidates);
    } else {
        if (max_length <= 0) {
            throw {type: "IndexError", message: "Empty sequence"};
        }

        random_index = randomInteger(0, max_length);
        return from[random_index];
    }
}


exports.graph = function() {
    var numberOfNodes = 0;
    var nodes = {}, edges = {};
    // var counter = 0;

    var create_node = function(name) {
        return {
            name: name
            //, index: counter++
        };
    };

    var create_edge = function(start, end) {
        return {
            source: start,
            target: end,
            value: 1
        };
    };

    var nodes_equal = function(node1, node2) {
        var node1_name, node2_name;
        if (node1 === node2) {
            return true;
        }
        node1_name = node1.name;
        node2_name = node2.name;

        if (node1_name !== undefined &&
            node2_name !== undefined &&
            node1_name === node2_name) {
            return true;
        }
        ;

        return false;
    };

    var index_of_node = function(aNode) {
        var index, counter = 0;
        nodes.forEach(function(item) {
            if (index === undefined && nodes_equal(item, aNode)) {
                index = counter;
            }
            counter += 1;
        });
        return (index === undefined) ? -1 : index;
    };

    var has_node = function(aNode) {
        return (nodes[aNode] === undefined) ? false : true;
    };

    var add_node = function(name) {
        var new_node = create_node(name);
        if (!has_node(new_node)) {
            numberOfNodes += 1;
            nodes[name] = new_node;
            edges[name] = {};
        }
    };

    var add_nodes = function(nodeNames) {
        nodeNames.forEach(add_node);
    };

    var add_egde = function(startingNodeName, endingNodeName) {
        var startingNode = nodes[startingNodeName];
        var endingNode = nodes[endingNodeName];

        if (startingNode === undefined || endingNode === undefined) {
            console.log("------");
            console.log(startingNode);
            console.log(endingNode);
            console.log(startingNodeName);
            console.log(endingNodeName);
            console.log("------");
            return;

            throw {
                name: 'EdgeError',
                startingNode: startingNode,
                endingNode: endingNode,
                startingNodeName: startingNodeName,
                endingNodeName: endingNodeName,
                message: ("Could not create edge " + startingNodeName
                    + " -> " + endingNodeName)
            };
        } else {
            edges[startingNodeName][endingNodeName] = create_edge(startingNode, endingNode);
            edges[endingNodeName][startingNodeName] = create_edge(endingNode, startingNode);
        }
    };

    var for_each_node = function(callback) {
        var nodeName;
        for (nodeName in nodes) {
            if (nodes.hasOwnProperty(nodeName)) {
                callback(nodeName);
            }
        }
    }

    var for_each_edge = function(callback) {
        var sourceNodeName, sourceDict, targetName, edge;

        for (sourceNodeName in edges) {
            if (edges.hasOwnProperty(sourceNodeName)) {
                sourceDict = edges[sourceNodeName];
                for (targetName in sourceDict) {
                    if (sourceDict.hasOwnProperty(targetName)) {
                        edge = sourceDict[targetName];
                        callback(edge.source.name, edge.target.name);
                    }
                }
            }
        }
    }

    var remove_node = function(nodeName) {
        var currentNodeEdgesDict, target;
        if (has_node(nodeName)) {
            currentNodeEdgesDict = edges[nodeName];
            for (target in currentNodeEdgesDict) {
                // remove reverse edge
                delete edges[target][nodeName];
                delete currentNodeEdgesDict[target];
            }
            numberOfNodes -= 1;
            delete nodes[nodeName];
        }
    }

    var random_node = function() {
        return randomElement(nodes);
    }

    var to_data = function() {
        var counter = 0;
        var nodes_array = [];
        var edges_array = [];

        for_each_node(function(nodeName) {
            var node = nodes[nodeName];
            node.index = counter;
            counter += 1;
            nodes_array.push(node);
        });

        for_each_edge(function(startName, endName) {
            var startNode = nodes[startName];
            var endNode = nodes[endName];

            edges_array.push(
                {
                    source: startNode.index,
                    target: endNode.index,
                    value: 1
                }
            );
        });

        return {
            nodes: nodes_array,
            edges: edges_array
        }
    };

    var to_json = function() {
        return JSON.stringify(to_data())
    }

    var to_string = function() {
        var util;
        if(require !== undefined &&
            (util = require('util')) !== undefined) {
            return util.inspect(to_data());
        } else {
            return to_json();
        }
    };

    var neighborhood = function(nodeName) {
        var node = nodes[nodeName];
        var currentNodeEdgesDict;

        if (node === undefined) {
            throw {name:'MissingNode', message:""};
        } else {
            currentNodeEdgesDict = edges[nodeName];
            return currentNodeEdgesDict.keys();
        }
    };

    var size = function() {
        return numberOfNodes;
    };
    var ret = {
        size: size,
        hasNode: has_node,
        addNode: add_node,
        addNodes: add_nodes,
        addEdge: add_egde,
        removeNode: remove_node,
        neighborhood: neighborhood,
        forEachNode: for_each_node,
        forEachEdge: for_each_edge,
        randomNode : random_node,
        toData: to_data,
        toJSON: to_json,
        toString: to_string
    };

    ret.toString = to_string;

    return ret;
};

exports.random_network = function(network_size, p) {
    var i, j;
    var network = exports.graph();

    for (i = 0; i < network_size; ++i) {
        network.addNode(i);
    }

    for (i = 0; i < network_size; ++i) {
        for (j = 0; j < i; ++j) {
            if (Math.random() < p) {
                network.addEdge(i, j);
            }
        }
    }

    return network;
}


exports.transitive_linking = function(network_size, p, steps) {
    var transitiveLinkingPhase = function(network) {
        var firstNeighbor;
        var secondNeighbor;
        var chosen;
        var neighborhood;

        chosen = network.randomNode();
        neighborhood = network.neighborhood(chosen);
        if (neighborhood.length >= 2) {
            firstNeighbor = randomElement(neighborhood);
            neighborhood.remove(firstNeighbor);
            secondNeighbor = randomElement(neighborhood);
        } else {
            do {
                firstNeighbor = chosen;
                secondNeighbor = network.randomNode();
            } while (firstNeighbor === secondNeighbor);
        }
        network.addEdge(firstNeighbor, secondNeighbor);
    }

    var nodeSubstitution = function(network, step) {
        var chosen, otherNode, newNode;

        chosen = network.randomNode();
        network.removeNode(chosen);

        otherNode = network.randomNode();
        newNode = network_size + step;
        network.addNode(newNode);
        network.addEdge(newNode, otherNode);
    }

    var i;
    // this p is different from the parameter
    var network = exports.random_network(network_size, 0.01);

    if (steps === undefined) {
        steps = 3 * network_size;
    }

    for (i = 0; i < steps; ++i) {
        transitiveLinkingPhase(network);
        if(Math.random() < p) {
            nodeSubstitution(network, i);
        }
    }
    
    return network;
};

var main = function() {
    // var interpreter_name = process.argv[0];
    // var program_name = process.argv[1];
    var network_size;
    var renewal_probability;
    var steps;

    if(process.argv[2] !== undefined) {
        network_size = parseInt(process.argv[2]);
    } else {
        network_size = 100;
    }
    if (process.argv[3] !== undefined) {
        renewal_probability = parseFloat(process.argv[3]);
    } else {
        renewal_probability = 0.01;
    }
    if (process.argv[4] !== undefined) {
        steps = parseInt(process.argv[4]);
    } else {
        steps = undefined;
    }

    var network = exports.transitive_linking(network_size, renewal_probability, steps);
    console.log(network.toString());
}

if(require.main === module) {
    main();
}
