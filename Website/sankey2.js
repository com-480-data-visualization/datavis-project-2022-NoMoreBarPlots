function SankeyChart__(countryName) {

  data_path1 = "data/0Sankey_New Zealand.csv"

  d3.csv(data_path1).then(function(data) {

    year = "2010";
    chart = SankeyChart({
    links: data.filter(d => d.year === year)
  }, {
    nodeGroup: d => d.id.split(/\W/)[0], // take first word for color
    format: (f => d => `${f(d)} kWh`)(d3.format(",~f")),
    width: 900,
    //height: 500,
    //margin: [50, 50, 50, 50]
    height: 850, //650
    margin: [120, 30, 0, 40]
  })
})
};

// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/sankey-diagram
function SankeyChart({
  nodes, // an iterable of node objects (typically [{id}, …]); implied by links if missing
  links // an iterable of link objects (typically [{source, target}, …])
}, {
  format = ",", // a function or format specifier for values in titles
  nodeId = d => d.id, // given d in nodes, returns a unique identifier (string)
  nodeGroup, // given d in nodes, returns an (ordinal) value for color
  nodeGroups, // an array of ordinal values representing the node groups
  nodeLabel, // given d in (computed) nodes, text to label the associated rect
  nodeTitle = d => `${d.id}\n${format(d.value)}`, // given d in (computed) nodes, hover text
  nodeWidth = 30, // width of node rects 15
  nodePadding = 20, // vertical separation between adjacent nodes 40
  nodeLabelPadding = 6, // horizontal separation between node and label 6
  nodeStroke = "currentColor", // stroke around node rects
  nodeStrokeWidth, // width of stroke around node rects, in pixels
  nodeStrokeOpacity, // opacity of stroke around node rects
  nodeStrokeLinejoin, // line join for stroke around node rects
  linkSource = ({source}) => source, // given d in links, returns a node identifier string
  linkTarget = ({target}) => target, // given d in links, returns a node identifier string
  linkValue = ({value}) => value, // given d in links, returns the quantitative value
  linkPath = d3.sankeyLinkHorizontal(), // given d in (computed) links, returns the SVG path
  linkTitle = d => `${d.source.id} → ${d.target.id}\n${format(d.value)}`, // given d in (computed) links
  linkColor = "source-target", // source, target, source-target, or static color
  linkStrokeOpacity = 0.5, // link opacity
  linkMixBlendMode = "normal", // link blending mode multiply
  colors = d3.scaleOrdinal(), // array of colors
  width = 640, // outer width, in pixels 200
  height = 400, // outer height, in pixels 100
  margin = [5, 1, 5, 1], // shorthand for margins, in pixels, clockwise from top [10, 1, 10, 1] [10, 100, 10, 100]
  marginTop = margin[0], // top margin, in pixels
  marginRight = margin[1], // right margin, in pixels
  marginBottom = margin[2], // bottom margin, in pixels
  marginLeft = margin[3], // left margin, in pixels
} = {}) {
  // Compute values.

  d3.csv(data_path1).then(function(data) {

  const LS = d3.map(links, linkSource).map(intern);
  const LT = d3.map(links, linkTarget).map(intern);
  const LV = d3.map(links, linkValue);
  if (nodes === undefined) nodes = Array.from(d3.union(LS, LT), id => ({id}));
  const N = d3.map(nodes, nodeId).map(intern);

  //let mouse = 'static' // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // Replace the input nodes and links with mutable objects for the simulation.
  nodes = d3.map(nodes, (_, i) => ({id: N[i]}));
  links = d3.map(links, (_, i) => ({source: LS[i], target: LT[i], value: LV[i]}));

  // Add estimation ratio to the links
  for (let i = 0; i < links.length; i++) {
  Object.assign(links[i], {estimation: data.filter(d => d.year === year)[i].estimation}); }

  // Compute the Sankey layout.
  d3.sankey()
      .nodeId(({index: i}) => N[i])
      .nodeAlign(d3.sankeyCenter)
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .linkSort(linkSorter)
      .extent([[marginLeft, marginTop], [width - marginRight, height - marginBottom]])
    ({nodes, links});


    // Categorize nodes as static or appearing node.
  const S = d3.map(nodes, d => {
    if (d.sourceLinks.length == 0 && d.targetLinks[0].source.id == "exports") {
      return "exports";
    } else if (d.sourceLinks.length == 0 && d.targetLinks[0].source.id == "final consumption") {
      return "final consumption";
    } else if (d.sourceLinks.length == 0 && d.targetLinks[0].source.id == "losses") {
      return "losses";
    } else if (d.targetLinks.length == 0 && d.sourceLinks[0].target.id == "imports") {
      return "imports";
    } else if (d.targetLinks.length == 0 && d.sourceLinks[0].target.id == "production") {
      return "production";
    } else return "static";
  })

  // Compute titles and labels using layout nodes, so as to access aggregate values.
  if (typeof format !== "function") format = d3.format(format);
  const Tl = nodeLabel === undefined ? N : nodeLabel == null ? null : d3.map(nodes, nodeLabel);
  const Tt = nodeTitle == null ? null : d3.map(nodes, nodeTitle);
  const Lt = linkTitle == null ? null : d3.map(links, linkTitle);

  // Categorize nodes as end (root/leaf) or middle node.
  const G = d3.map(nodes, d => {
    if (d.sourceLinks.length > 0 && d.targetLinks.length > 0) {
      return "midStatic";
    } else if (d.sourceLinks.length == 0 && d.targetLinks[0].source.id == "exports") {
      return "midExit";
    } else if (d.targetLinks.length == 0 && d.sourceLinks[0].target.id == "imports") {
      return "midEntry";
    } else if (Tl[d.index]=='exports') { // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      return "midExit";
    } else if (Tl[d.index]=='imports') {
      return "midEntry";
    } else return "end";
  })

   // Compute default domains.
  if (G && nodeGroups === undefined) nodeGroups = G;

  // Construct the scales.
  const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors).range(['#3182bd','#6baed6','#9ecae1','#c6dbef'].reverse());

  // A unique identifier for clip paths (to avoid conflicts).
  const uid = `O-${Math.random().toString(16).slice(2)}`;

  const svg = d3.select("#countryInfo").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  svg.append("defs")
    .append("pattern")
      .attr("id", "nodePattern").attr("patternUnits", "userSpaceOnUse")
      .attr("width", 5).attr("height", 5)
    .append("circle")
      .attr("cx", 2.5).attr("cy", 2.5).attr("r", 2)

  const chart = svg.append("g");

  // Modify node position.
  let nodeLogExit, nodeLogEntry;
  const k = 0.75;
  nodes.sort((a, b) => d3.ascending(a.layer, b.layer) || d3.descending(a.value, b.value));
  nodePadding /= 2;

  nodes.forEach(d => {
    if (G[d.index] == "midExit") {
      const dy = d.y1 - d.y0, source = d.targetLinks[0].source;
      d.y0 = marginTop * k;
      d.y1 = d.y0 + nodeWidth;
      d.x0 = source.x1 + (source.y0 - d.y1) * k;
      if (nodeLogExit != undefined && d.x0 < nodeLogExit.x1 + nodePadding) {
        d.x0 = nodeLogExit.x1 + nodePadding;
      }
      d.x1 = d.x0 + dy;
      nodeLogExit = {x1: d.x1};
    } else if (G[d.index] == "midEntry") {
      const dy = d.y1 - d.y0, target = d.sourceLinks[0].target;
      d.y1 = height  - marginBottom * k;
      d.y0 = d.y1 - nodeWidth;
      d.x1 = target.x0 - (d.y0 - target.y1) * k;
      if (nodeLogEntry != undefined && d.x0 < nodeLogEntry.x1 + nodePadding) {
        d.x1 = nodeLogEntry.x1 + nodePadding + d.sourceLinks[0].width ;
      }
      d.x0 = d.x1 - dy;
      nodeLogEntry = {x1: d.x1};
    }
  })

  const node = chart.append("g")
      .attr("stroke", nodeStroke)
      .attr("stroke-width", nodeStrokeWidth)
      .attr("stroke-opacity", nodeStrokeOpacity)
    .attr("stroke-linejoin", nodeStrokeLinejoin)
    .selectAll("rect")
    .data(nodes.filter(d => (S[d.index] == 'static')))
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0);

  if (G) node.attr("fill", ({index: i}) => color(G[i]));
  if (Tt) node.append("title").text(({index: i}) => Tt[i]);

  const link = chart.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", linkStrokeOpacity)
    .selectAll("g")
    .data(links.filter(d => (Tl[d.source.index] == 'Total amount of energy') || (Tl[d.target.index] == 'Total amount of energy')))
    .join("g")
      .style("mix-blend-mode", linkMixBlendMode);

  link.append("linearGradient")
      .attr("id", d => `${uid}-link-${d.index}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", d => G[d.source.index] == "midEntry" ? d.source.x0 : d.source.x1)
      .attr("x2", d => G[d.source.index] == "midEntry" ? d.target.x0 : d.target.x1)
      .attr("y1", d => {
        if (G[d.target.index] == "midExit") {return d.source.y1}
        else if (G[d.source.index] == "midEntry") {return d.source.y0}
      })
      .attr("y2", d => {
        if (G[d.target.index] == "midExit") {return d.target.y0}
        else if (G[d.source.index] == "midEntry") {return d.target.y1}
      })
      .call(gradient => gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", ({estimation: i}) => color(i, false)))
      .call(gradient => gradient.append("stop")
          .attr("offset", d => {
            if (G[d.target.index] == "midExit") {return "70%"}
            else if (G[d.source.index] == "midEntry") {return "20%"}
          })
          .attr("stop-color", ({estimation: i}) => color(i, false)))
      .call(gradient => gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", ({estimation: i}) => color(i, false)));

  link.append("path")
      .attr("d", d => {
        if (G[d.target.index] == "midExit") {return linkPathMidExit(d)}
        else if (G[d.source.index] == "midEntry") {return linkPathMidEntry(d)}
        else {return linkPath(d)}
      })
      .attr("stroke", ({index: i}) => `url(#${uid}-link-${i})`)
      .attr("stroke-width", ({width}) => Math.max(1, width))
      .call(Lt ? path => path.append("title").text(({index: i}) => Lt[i]) : () => {});

  // Calculate node labels position.
  nodes.forEach((d) => {
    d.labelX = (d.x0 + d.x1) / 2;
    if (G[d.index] == "midStatic" && d.height > 0) {
      d.labelY = (d.y0 + d.y1) / 2;
      d.labelAlign = "middle";
    } else if (G[d.index] == "midExit") {
      d.labelY = d.y0 + nodeWidth -40;
      d.labelAlign = "start";
    } else if (G[d.index] == "midEntry") {
      d.labelY = d.y0 - nodeWidth + 70;
      d.labelAlign = "end";
    } else {
      //d.labelX += d.layer == 0 ? - nodeWidth - 5 : 20; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      d.labelY = (d.y0 + d.y1) / 2;
      d.labelAlign = "middle";
    }
  })

  let labels;
  if (Tl) labels = chart.append("g")
      .attr("font-family", "system-ui")
      .attr("font-size", 10)
      .attr("pointer-events", "none") //"all"
    .selectAll("text")
    .data(nodes.filter(d => (S[d.index] == 'static')))
    .join("text")
      .attr("x", d => d.labelX)
      .attr("y", d => d.labelY)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.labelAlign)
      .text(({index: i}) => Tl[i])
    .each(wrap);

  svg.selectAll("rect")
    .attr('pointer-events', 'all')
    .on("mouseover", addlabels)
    .on("mouseout", removelabels);

  function addlabels(event, i) {
    if (['production','imports','final consumption','exports','losses'].includes(Tl[i.index])) {

    const node2 = chart.append("g")
      .attr("class", "node")
      .attr("stroke", nodeStroke)
      .attr("stroke-width", nodeStrokeWidth)
      .attr("stroke-opacity", nodeStrokeOpacity)
    .attr("stroke-linejoin", nodeStrokeLinejoin)
    .selectAll("rect")
    .data(nodes.filter(d => (S[d.index] == Tl[i.index])))
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", ({index: i}) => color(G[i]));

      const link = chart.append("g")
        .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke-opacity", linkStrokeOpacity)
    .selectAll("g")
    .data(links.filter(d => (S[d.source.index] == Tl[i.index]) || (S[d.target.index] == Tl[i.index])))
    .join("g")
      .style("mix-blend-mode", linkMixBlendMode);

  link.append("linearGradient")
      .attr("id", d => `${uid}-link-${d.index}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", d => G[d.source.index] == "midEntry" ? d.source.x0 : d.source.x1)
      .attr("x2", d => G[d.source.index] == "midEntry" ? d.target.x0 : d.target.x1)
      .attr("y1", d => {
        if (G[d.target.index] == "midExit") {return d.source.y1}
        else if (G[d.source.index] == "midEntry") {return d.source.y0}
      })
      .attr("y2", d => {
        if (G[d.target.index] == "midExit") {return d.target.y0}
        else if (G[d.source.index] == "midEntry") {return d.target.y1}
      })
      .call(gradient => gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", ({estimation: i}) => color(i, false)))
      .call(gradient => gradient.append("stop")
          .attr("offset", d => {
            if (G[d.target.index] == "midExit") {return "70%"}
            else if (G[d.source.index] == "midEntry") {return "20%"}
          })
          .attr("stop-color", ({estimation: i}) => color(i, false)))
      .call(gradient => gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", ({estimation: i}) => color(i, false)));

  link.append("path")
      .attr("d", d => {
        if (G[d.target.index] == "midExit") {return linkPathMidExit(d)}
        else if (G[d.source.index] == "midEntry") {return linkPathMidEntry(d)}
        else {return linkPath(d)}
      })
      .attr("stroke", ({index: i}) => `url(#${uid}-link-${i})`)
      .attr("stroke-width", ({width}) => Math.max(1, width))
      .call(Lt ? path => path.append("title").text(({index: i}) => Lt[i]) : () => {});

  const labels2 = chart.append("g")
      .attr("class", "label")
      .attr("font-family", "system-ui")
      .attr("font-size", 10)
    .selectAll("text")
    .data(nodes.filter(d => S[d.index] == Tl[i.index]))
    .join("text")
      .attr("x", d => d.labelX)
      .attr("y", d => d.labelY)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.labelAlign)
      .text(({index: i}) => Tl[i])
    .each(wrap);

      if (['imports','exports'].includes(Tl[i.index])) {
    labels2.attr("transform", d => `rotate(270, ${d.labelX}, ${d.labelY})`);
      }
  }}
      function removelabels() {
    d3.selectAll("g.label").remove();
    d3.selectAll("g.node").remove();
    d3.selectAll("g.link").remove();
  }

  // Rotate chart.
  svg.attr("height", width);
  labels.attr("transform", d => `rotate(270, ${d.labelX}, ${d.labelY})`);
  chart.attr("transform",
             `rotate(90, ${width/2}, ${height/2})`);

  function intern(value) {
    return value !== null && typeof value === "object" ? value.valueOf() : value;
  }
  return Object.assign(svg.node(), {scales: {color}});
});
};

function linkSorter(a, b) { // returns -1 if a before b and 1 if b before a.
  if (a.source.targetLinks.length == 0 && b.source.targetLinks.length > 0) { return 1 }
  else if (a.source.targetLinks.length > 0 && b.source.targetLinks.length == 0) { return -1 }
  else if (a.target.sourceLinks.length > 0 && b.target.sourceLinks.length == 0) { return 1 }
  else if (a.target.sourceLinks.length == 0 && b.target.sourceLinks.length > 0) { return -1 }
  else { if (a.source.id == "production" && b.source.id == "imports") { return -1 }
          else if (a.source.id == "imports" && b.source.id == "production") { return 1 }
            else if (a.target.id == "exports" && b.target.id == "final consumption") { return -1 }
              else if (a.target.id == "final consumption" && b.target.id == "exports") { return 1 }
                else if (a.target.id == "final consumption" && b.target.id == "losses") { return 1 }
              else if (a.target.id == "losses" && b.target.id == "final consumption") { return -1 }
                else if (a.target.id == "exports" && b.target.id == "losses") { return -1 }
              else if (a.target.id == "losses" && b.target.id == "exports") { return 1 }
    else { return b.value - a.value } }
}

function linkPathMidExit(link) {
  const x1 = link.target.x0 + link.width/2;
  let path = d3.path();
  path.moveTo(link.source.x1, link.y0);
  path.lineTo(link.source.x1 + (link.target.x0 - link.source.x1) / 5, link.y0)
  path.quadraticCurveTo(x1, link.y0, x1, link.target.y1);
  return path;
};

function linkPathMidEntry(link) {
  const x1 = link.source.x1 - link.width/2;
  let path = d3.path();
  path.moveTo(link.target.x0, link.y1);
  path.lineTo(link.target.x0 - (link.target.x0 - link.source.x1) / 5, link.y1)
  path.quadraticCurveTo(x1, link.y1, x1, link.source.y0);
  return path;
};

function wrap(d) {
  if (d.layer > 0) return;
  var text = d3.select(this),
    words = text.text().split(/\s+/),
    word,
    line = [],
    lineNumber = 0,
    lineHeight = 1.1, // ems
    x = text.attr("x"),
    y = text.attr("y"),
    dy = parseFloat(text.attr("dy")),
    tspan = text.text(null)
    .append("tspan")
    .attr("x", x)
    .attr("y", y)
    .attr("dy", dy + "em");
  while (word = words.shift()) {
    line.push(word);
    tspan.text(line.join(" "));
    if (tspan.text().length > 10) {
      line.pop();
      tspan.text(line.join(" "));
      line = [word];
      tspan = text.append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", ++lineNumber * lineHeight + dy + "em")
        .text(word);
    }
  };
}
