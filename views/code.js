var nodes_data, links_data;

$.ajax({url: "names.json", async: false, success: function(data){
    //Create links data 
    links_data = data.links;

    //Getting a nodes arrayset
    
    const nodes_data_pre = new Array();
    links_data.forEach(retrieveNodes);

    function retrieveNodes(value, index, array) {
        nodes_data_pre.push({"id": value.source});
        nodes_data_pre.push({"id": value.target});
    }

    //make the arrow not hold any duplicates
    nodes_data = Array.from(new Set(nodes_data_pre.map(a => a.id)))
        .map(id => {
            return nodes_data_pre.find(a => a.id === id)
        })
}});

var svg = d3.select('svg');
const width = svg.attr('width')
    ,height = svg.attr('height')
    ,radius = 20;               

var simulation = d3.forceSimulation().nodes(nodes_data);	

//add forces
simulation
    .force("charge_force", d3.forceManyBody().strength(-100))
    .force("center_force", d3.forceCenter(width / 2, height / 2))
    .force("box_force", box_force)
    .force("collision_force",  d3.forceCollide(15).strength(1));

//draw lines for the links first because we want them under the nodes
var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links_data)
    .enter().append("line")
    .attr("stroke-width", 2);   

//A number of groups as nodes
var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes_data)
    .enter().append("g");

//give the groups white circles
var circles = node.append("circle")
    .attr("r", determineRadius)
    .attr("fill", "white");  

//give the groups names
var lables = node.append("text")
    .text(function(d) {return d.id;})
    .style("font-size", determineSize)
    .style("background-color", "yellow")
    .attr('text-anchor', 'middle')
    .attr("dy", ".35em");
        
//add tick instructions: 
simulation.on("tick", tickActions);

//Create the link force 
//We need the id accessor to use named sources and targets 

var link_force =  d3.forceLink(links_data)
                        .id(function(d) { return d.id; })
                        .distance(50)
                        .strength(0.7);

//Add a links force to the simulation
//Specify links  in d3.forceLink argument   

simulation.force("links",link_force)

function tickActions() {
    //update group positions, and because the attributes of a group
    //flow down to its components, so will the names and the circles
    node
        .attr("transform", function(d) {
        return "translate(" + d.x + "," + d.y + ")";
        })
        
    //update link positions 
    //simply tells one end of the line to follow one node around
    //and the other end of the line to follow the other node around
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
}

//Add a drag handler and its drag methods

var drag_handler = d3.drag()
    .on("start", drag_start)
    .on("drag", drag_drag)
    .on("end", drag_end);

function drag_start(d) {
    if(!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
};

function drag_drag(d) {
    d.fx = Math.max(radius, Math.min(width - radius, d3.event.x));
    d.fy = Math.max(radius, Math.min(height - radius, d3.event.y));
};

function drag_end(d) {
    if(!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
};

node.call(drag_handler);

//Makes sure the nodes stay in the svg box

function box_force() {
    for (var i = 0, n = nodes_data.length; i < n; ++i) {
        curr_node = nodes_data[i];
        curr_node.x = Math.max(radius, Math.min(width - radius, curr_node.x));
        curr_node.y = Math.max(radius, Math.min(height - radius, curr_node.y));
    }
}


//TODO a button to click and the svg gets saved to pdf/png

d3.select('#saveState').on("click", function() {
    
    var data = {'svg': svgstring};
    var xhttp = new XMLHttpRequest();
    xhttp.responseType = "arraybuffer";
    xhttp.open('POST', '/pdf', true);
    xhttp.setRequestHeader('Content-type','application/json;charset=UTF-8');
    xhttp.setRequestHeader('Accept', 'application/json, text/plain, */*');
    xhttp.send(data);
    xhttp.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            let pdfBlob = new Blob([xhttp.response],{type:'application/pdf'}); 
            const url = window.URL.createObjectURL(pdfBlob);
            console.log(url);
        }
    }
});

//function to determine the size of the text and size of the circles

function determineSize(d) {
    let initialSize = 14;
    for (let i = 0, n = links_data.length; i < n; ++i) {
        if (links_data[i].target === d.id || links_data[i].source === d.id){
            initialSize++;
        }
    }
    return initialSize.toString();
}

function determineRadius(d) {
    return determineSize(d);
}


//function to change the method for when drag ended
//to allow the client to permanently place a node 
//in a certain place

function dragEndedToggle(){
    if (drag_handler.on("end") !== undefined) {
        drag_handler.on("end", null);
        node.call(drag_handler);
    } else {
        drag_handler.on("end", drag_end);
        node.call(drag_handler);
        node.each(function(d) {
            d.fx = null;
            d.fy = null;
        })
    }
}

//function to change the font-family
function changeFont(font){
    lables.style("font-family", font.value);
}