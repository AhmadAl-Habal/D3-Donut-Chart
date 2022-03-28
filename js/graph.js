// const colors = ["yellow", "green"];

// window.addEventListener("load", () => {
//   const dims = { height: 300, width: 300, radius: 150 };
//   const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };
//   const svg = d3
//     .select(".canvas")
//     .append("svg")
//     .attr("width", dims.width + 150)
//     .attr("height", dims.height + 150);

//   const graph = svg
//     .append("g")
//     .attr("transform", `translate(${cent.x},${cent.y})`);

//   const pie = d3
//     .pie()
//     .sort(null)
//     .value((d) => d.cost);

//   const arcPath = d3
//     .arc()
//     .outerRadius(dims.radius)
//     .innerRadius(dims.radius / 2);

//   const color = d3.scaleOrdinal(d3["schemeSet3"]);

//   const legendGroup = svg.append("g");
//   attr("transform", `translate(${dims.width + 40}, 10)`);

//   const legend = d3.legendColor().shape("circle").scale(color);

//   //update function
//   const update = (data) => {
//     color.domain(data.map((d) => d.name));
//     const paths = graph.selectAll("path").data(pie(data));

//     legendGroup.call(legend);

//     paths
//       .exit()
//       .transition()
//       .duration(750)
//       .attrTween("d", arcTweenExit)
//       .remove();

//     paths.transition().duration(750).attrTween("d", arcTweenUpdate);

//     paths
//       .enter()
//       .append("path")
//       .attr("class", "arc")
//       .attr("stroke", "#fff")
//       .attr("stroke-width", 3)
//       .attr("fill", (d) => color(d.data.name))
//       .each(function (d) {
//         this._current = d;
//       })
//       .transition()
//       .duration(750)
//       .attrTween("d", arcTweenEnter);
//   };

//   function arcTweenUpdate(d) {
//     var i = d3.interpolate(this._current, d);
//     this._current = i(1);
//     return function (t) {
//       return arcPath(i(t));
//     };
//   }

//   const arcTweenEnter = (d) => {
//     var i = d3.interpolate(d.endAngle, d.startAngle);
//     return function (t) {
//       d.startAngle = i(t);
//       return arcPath(d);
//     };
//   };

//   const arcTweenExit = (d) => {
//     var i = d3.interpolate(d.startAngle, d.endAngle);
//     return function (t) {
//       d.startAngle = i(t);
//       return arcPath(d);
//     };
//   };

//   var data = [];

//   db.collection("expenses").onSnapshot((res) => {
//     res.docChanges().forEach((change) => {
//       const doc = { ...change.doc.data(), id: change.doc.id };

//       switch (change.type) {
//         case "added":
//           data.push(doc);
//           break;
//         case "modified":
//           const index = data.findIndex((item) => item.id == doc.id);
//           data[index] = doc;
//           break;
//         case "removed":
//           data = data.filter((item) => item.id !== doc.id);
//           break;
//         default:
//           break;
//       }
//     });
//     update(data);
//   });
// });

const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

// create svg container
const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 150)
  .attr("height", dims.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${cent.x}, ${cent.y})`);
// translates the graph group to the middle of the svg container

const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);
// the value we are evaluating to create the pie angles

const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

// ordinal colour scale
const colour = d3.scaleOrdinal(d3["schemeSet2"]);

// legend setup
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${dims.width + 40}, 10)`);

const legend = d3
  .legendColor()
  .shape("path", d3.symbol().type(d3.symbolCircle)())
  .shapePadding(10)
  .scale(colour);

// const tip = d3
//   .tip()
//   .attr("class", "tip card")
//   .html((d) => {
//     return `<p>Hello there</p>`;
//   });
// graph.call(tip);
// update function
const update = (data) => {
  // update colour scale domain
  colour.domain(data.map((d) => d.name));

  // update legend
  legendGroup.call(legend);
  legendGroup.selectAll("text").attr("fill", "white");

  // join enhanced (pie) data to path elements
  const paths = graph.selectAll("path").data(pie(data));

  // event handlers
  const handleMouseOver = (event) => {
    d3.select(event.target)
      .transition("Fill")
      .duration(300)
      .attr("fill", "#fff");
  };

  const handleMouseOut = (event, i) => {
    d3.select(event.target)
      .transition("Fill")
      .duration(300)
      .attr("fill", colour(i.data.name));
  };

  const handleClick = (event, i) => {
    db.collection("expenses").doc(i.data.id).delete();
  };

  // handle the exit selection
  paths
    .exit()
    .transition("c")
    .duration(750)
    .attrTween("d", arcTweenExit)
    .remove();

  // handle the current DOM path updates
  paths.transition("d").duration(750).attrTween("d", arcTweenUpdate);

  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 3)
    .attr("d", arcPath)
    .attr("fill", (d) => colour(d.data.name))
    .each(function (d) {
      this._current = d;
    })
    .transition("e")
    .duration(750)
    .attrTween("d", arcTweenEnter);

  // add events
  graph
    .selectAll("path")
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);
};

// data array and firestore
var data = [];

db.collection("expenses")
  .orderBy("cost")
  .onSnapshot((res) => {
    res.docChanges().forEach((change) => {
      const doc = { ...change.doc.data(), id: change.doc.id };

      switch (change.type) {
        case "added":
          data.push(doc);
          break;
        case "modified":
          const index = data.findIndex((item) => item.id == doc.id);
          data[index] = doc;
          break;
        case "removed":
          data = data.filter((item) => item.id !== doc.id);
          break;
        default:
          break;
      }
    });

    // call the update function
    update(data);
  });

const arcTweenEnter = (d) => {
  var i = d3.interpolate(d.endAngle - 0.1, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  var i = d3.interpolate(d.startAngle, d.endAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

// use function keyword to allow use of 'this'
function arcTweenUpdate(d) {
  // interpolate between the two objects
  var i = d3.interpolate(this._current, d);
  // update the current prop with new updated data
  this._current = i(1);

  return function (t) {
    // i(t) returns a value of d (data object) which we pass to arcPath
    return arcPath(i(t));
  };
}
