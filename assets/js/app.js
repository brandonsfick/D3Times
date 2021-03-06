// healthcare vs obesity & age vs healthcare
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
var circlesGroupLabel = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "healthcare";


// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  // function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]));
  
    return circlesGroup;
  }
  function renderLabels(cirlabl, newXScale, chosenXAxis) {

    cirlabl.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
  
    return cirlabl;
  }
// function used for updating circles group with new tooltip
function updateToolTip( chosenXAxis, circlesGroup) {

    if (chosenXAxis === "age") {
      var label = "Age";
    }
    else {
      var label = "Obesity";
    }
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        // return ("<strong>Frequency:</strong>" )
        return (`State: ${d.state}<br>${label}: ${d[chosenXAxis]}<br> Healthcare: ${d.healthcare}`);
      // REFERENCE:   return "<strong>Frequency:</strong> <span style='color:red'>" + d.frequency + "</span>";
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data, this);
      });
  
    return circlesGroup;
  };
// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(cenData) {
  console.log(cenData);
    // parse data
    cenData.forEach(function(data) {
      // data.state = +data.state;
      // data.abbr = +data.abbr;
      data.age = +data.age;
      data.obesity = +data.obesity;
      data.healthcare = +data.healthcare;
     
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(cenData, chosenXAxis);
 
    // Create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([0, d3.max(cenData, d => d.healthcare)])
      .range([height, 0]);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    chartGroup.append("g")
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(cenData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", 20)
      .attr("fill", "blue")
      .attr("opacity", ".5")
      
var cirlabl = chartGroup.selectAll(".t")
      
      .data(cenData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.healthcare))
      .style("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", "10px")
      .attr("font-color", "black")
      .text(function(d) {
        console.log(d.abbr)
       return `${d.abbr}`;
     })
      // .attr("fill", "white")
      
  
    // Create group for  2 x- axis labels
    var labelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var age = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "age") // value to grab for event listener
      .classed("active", true)
      .text("Age");
  
    var obesity = labelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obesity");
  
    // append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .classed("axis-text", true)
      .text("Healthcare");
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
  
    // x axis labels event listener
    labelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(cenData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderAxes(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
          cirlabl = renderLabels(cirlabl, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
          
          // changes classes to change bold text
          if (chosenXAxis === "age") {
            age
              .classed("active", true)
              .classed("inactive", false);
            obesity
              .classed("active", false)
              .classed("inactive", true);
              chosenXAxis = 'age';
          }
          else {
            age
              .classed("active", false)
              .classed("inactive", true);
            obesity
              .classed("active", true)
              .classed("inactive", false);
              chosenXAxis = "Obesity";
          }
        }
      });
  });
  