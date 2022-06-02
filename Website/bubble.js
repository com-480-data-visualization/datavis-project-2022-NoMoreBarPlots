
function bubblesChart(energy, transaction, selectedContinents) {

  data_path1 = "../Data_clean/" + energy + ".csv"

  d3.selectAll("svg").remove();

  let width = $(window).width();

  let height = $(window).height();

  let max_rank = 31 // Nombre de pays affichés

  dataKey = "Quantity"

  k = 11;


  colours = ({ // FAUSSES VALEURS DES COULEURS #
    pink: '#D8352A',
    red: '#D8352A',
    blue: '#48509E',
    green: '#02A371',
    yellow: '#F5A623',
    hyperGreen: '#19C992',
    purple: '#B1B4DA',
    orange: '#F6E7AD',
    charcoal: '#383838'
  })

    continents = [
    {
      id: 'AF',
      name: 'Africa',
      fill: colours.purple,
      colour: colours.charcoal
    },
    {
      id: 'AS',
      name: 'Asia',
      fill: colours.yellow,
      colour: colours.charcoal
    },
    {
      id: 'EU',
      name: 'Europe',
      fill: colours.blue
      // colour: colours.charcoal
    },
    {
      id: 'NA',
      name: 'N. America',
      fill: colours.pink
    },
    {
      id: 'OC',
      name: 'Oceania',
      fill: colours.orange,
      colour: colours.charcoal
    },
    {
      id: 'SA',
      name: 'S. America',
      fill: colours.green
      // colour: colours.charcoal
      // fill: colours.blue
    }
  ]

  Promise.all([
    d3.csv(data_path1),
    d3.csv("data/countries_name_.csv"),
    ]).then(function(files) {
    // files[0] will contain file1.csv
    // files[1] will contain file2.csv
    data_ = files[0];
    countries = files[1];

    normalization_quantity = Math.max(...data_.map(d => d.Quantity))/100

    data__ = data_.filter(d => d.Transaction === transaction
                 ).filter(d => {
                    const country = countries.find(c => c.name === d.Country_or_Area);
                    const continent = continents.find((c, i) => {
                      if (!country) {
                        return false;
                      }

            return c.id === country.continentCode;
          });

          if (!continent) {
            return false;
          }
          return selectedContinents.includes(continent.id);
        })

        data__ = data__.map(d => {
                        d.continentCode = countries.find(el => el.name == d.Country_or_Area).continentCode
                        return d
                     }).map(d => {
                        d.iso2 = countries.find(el => el.name == d.Country_or_Area).iso2
                        return d
                     }).map(d => {
                        d.iso3 = countries.find(el => el.name == d.Country_or_Area).iso3
                        return d
                     }).map(d => {
                        d.name = d.Country_or_Area
                        return d
                     }).map(d => {
                        d.color= continents.find(dd => dd.id == d.continentCode).fill
                        return d
                     }).map(d => {
                        d.id= 'node-'+d.name
                        return d
                     }).map(d => {
                        d.r =  Math.abs(d.Quantity/normalization_quantity)
                        return d
                     }).map(d => {
                        d.date = getIsoDate(new Date(d.Year,0,1,1))
                        return d
                    })

    datevalues = Array.from(d3.rollup(data__, ([d]) => d.Quantity, d => +d.Year, d => d.Country_or_Area))
      .map(([Year, data__]) => [new Date(Year,0,1,1), data__])
      .sort(([a], [b]) => d3.ascending(a, b))

    names = new Set(data__.map(d => d.Country_or_Area));

    n = Math.max(...Array.from(datevalues.map(d => d[1].size)));

    function rank(value) {
    const data = Array.from(names, Country_or_Area => ({Country_or_Area, r: value(Country_or_Area)}));
    data.sort((a, b) => d3.descending(a.r, b.r));
    for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
    return data;
  }

    keyframes_ = function () {
      const keyframes = [];
      let ka, a, kb, b;
      for ([[ka, a], [kb, b]] of d3.pairs(datevalues)) {
        for (let i = 0; i < k; ++i) {
          const t = i / k;
          keyframes.push([
            new Date(ka * (1 - t) + kb * t),
            rank(name => (a.get(name) || 0) * (1 - t) + (b.get(name) || 0) * t)
          ]);
        }
      }
      keyframes.push([new Date(kb), rank(name => b.get(name) || 0)]);
      return keyframes;
    }
    keyframes = keyframes_();

    get_rad = function (data_) {
    if (data_[0] === undefined){
    return 0.
    } else {
      return data_[0].r
    }
  }

    dates = data_.map(d => d.Year).filter((v, i, a) => a.indexOf(v) === i).sort().map(d => getIsoDate(new Date(d,0,1,1)));


    data_state = function(name){
      const grp = [];
      const data = data__.filter(d => d.name == name)
      let date;
      for (date of dates){
        const sub_data = data.filter(d => d.date == date);
        grp.push({
          date:date,
          r: get_rad(sub_data),
          Quantity: get_rad(sub_data)*normalization_quantity,
          estimation: Boolean(sub_data.Quantity_Footnotes || 0)
        })
      }
      return grp
    }

    keyframes_country_ = function() {
      const keyframes = [];
      let name;
      for (name of names){
        keyframes.push([name,
                      {
                        x:width/2+Math.random(),
                        y:width/2+Math.random(),
                        name:name,
                        color: data__.find(d => d.name == name).color,
                        data_state: data_state(name),
                        isoCode: data__.find(d => d.name == name).iso3
                      }
                     ])
                   }
        return keyframes
    }
    keyframes_country = keyframes_country_();

    pack = d3.pack().size([width, height]).padding(0);

    chart_ = function () {
      // D3 CIRCLE PACK FORCE COLLIDE
      var state = 0;
      var time_transition = 1000;
      var subscription = null;
      var pack = d3.pack().size([width, height]).padding(0);

      const svg = d3.select("#bubbleChart")
        .append("svg")
          .attr("width", width)
          .attr("height", height)

     const updateTicker = ticker(svg,width,height,0);

          tooltip = d3
            .select("body")
            .append("div") // the tooltip always "exists" as its own html div, even when not visible
            .style("position", "absolute") // the absolute position is necessary so that we can manually define its position later
            .style("opacity", "0") // hide it from default at the start so it only appears on hover
            .style("background-color", "white")
            .attr("class", "tooltip")

            //name a tooltip_in function to call when the mouse hovers a node
            tooltip_in = function(event, d) { // pass event and d to this function so that it can access d for our data
              return tooltip
              .html("<h4>" + d.name + d.Quantity + "</h4>") // add an html element with a header tag containing the name of the node.  This line is where you would add additional information like: "<h4>" + d.name + "</h4></br><p>" + d.type + "</p>"  Note the quote marks, pluses and </br>--these are necessary for javascript to put all the data and strings within quotes together properly.  Any text needs to be all one line in .html() here
              .style("opacity", "1") // make the tooltip visible on hover
              .style("top", event.pageY + "px") // position the tooltip with its top at the same pixel location as the mouse on the screen
              .style("left", event.pageX + "px"); // position the tooltip just to the right of the mouse location
            }

            // name a tooltip_out function to call when the mouse stops hovering
            tooltip_out = function() {
              return tooltip
              .transition()
              .duration(500) // give the hide behavior a 50 milisecond delay so that it doesn't jump around as the network moves
              .style("opacity", "0"); // hide the tooltip when the mouse stops hovering
            }


      var node = svg.selectAll("g.node");
      var root;
      var nodes = [];
      var first = true;
      var scaleFactor = 1.4;
      var forceCollide = d3.forceCollide()
         .strength(.8)
         .radius(function(d)
         {
            return d.r;
         }).iterations(50);
      var simulationStart = d3.forceSimulation()
         .force("forceX", d3.forceX(width/2).strength(.04))
         .force("forceY", d3.forceY(height/2).strength(.04))
         .force('collide', forceCollide)
         .on('tick', ticked);
      var simulation = d3.forceSimulation()
         .force("forceX", d3.forceX(width/2).strength(.0005))
         .force("forceY", d3.forceY(height/2).strength(.0005))
         .force('collide', forceCollide)
         .on('tick', ticked);
      function ticked()
      {
         if (node)
         {
            node.attr('transform', function(d)
            {
               return "translate(" + d.x + "," + d.y + ")";
            }).select('circle').attr('r', function(d)
            {
               return d.r;
            });
         }
      }
      function rand(min, max)
      {
         return Math.random() * (max - min) + min;
      };
      setInterval(function()
      {
        updateTicker(state);
         var hosts = [];
        for (var i = 0; i < keyframes_country.length; i++)
        {
           hosts.push({index: i,name:keyframes_country[i][1].name, isoCode: keyframes_country[i][1].isoCode,
             cpu: keyframes_country[i][1].data_state[state].r,color: keyframes_country[i][1].color,
           Quantity: keyframes_country[i][1].data_state[state].Quantity});
        }
         root = d3.hierarchy({children: hosts})
            .sum(function(d)
            {
               return d.cpu ? d.cpu : 0;
            });
         var leaves = pack(root).leaves().map(function(item)
         {
            return {
               id: 'node-'+item.data.index,
               name: item.data.name,
               r: item.r ,//* scaleFactor,
               x: width/2,
               y: height/2,
               cpu: item.data.cpu,
               color: item.data.color,
               isoCode: item.data.isoCode,
               Quantity: item.data.Quantity
            };
         });
         for (var i = 0; i < leaves.length; i++)
         {
            if (nodes[i] && nodes[i].id == leaves[i].id)
            {
               var oldR = nodes[i].newR;
               nodes[i].oldR = oldR;
               nodes[i].newR = leaves[i].r;
               nodes[i].cpu = leaves[i].cpu;
               nodes[i].color = leaves[i].color;
               nodes[i].Quantity = leaves[i].Quantity;
            }
            else
            {
               nodes[i] = leaves[i];
               //nodes[i].r = 1;
               nodes[i].oldR = 1;//nodes[i].r;
               nodes[i].newR = leaves[i].r;
            }
         }

         if (first)
         {

            first = false;
            node = node.data(nodes, function(d) { return d.id; });
            node = node.enter()
               .append('g')
               .attr('class', 'node');
            node.append("circle")
               .style("fill", 'transparent');
            node.append("text")
               .attr("dy", d => {
                 //const shouldShowValue = d.r > 18;
                 if (d.r > 18){
                   return '-0.2em'
                 }else{
                   return '0.3em'
                 }
               })
               .style('fill', 'black')
               .style("fontsize", d => {
                  let nameFontSize;
                  if (d.r > 18) {
                    nameFontSize = (d.name.length * 10 > d.newR * 2) ? '8px' : '10px';
                  } else {
                    nameFontSize = '6px';
                  }
                 return nameFontSize
               })
               .style("text-anchor", "middle")
               .text(function(d)
               {
                if (d.r < 12) {
                    return [];
                  }
                return d.isoCode
               });
           node.append("text").append("tspan")
               .attr("dy", d => {
                 //const shouldShowValue = d.r > 18;
                 if (d.name.length * 10 > d.r * 2){
                   return '0.9em'
                 }else{
                   return '1.0em'
                 }
               })
               .style('fill', 'black')
               .style("text-anchor", "middle")
               .style("fillOpacity",0.7)
               .style("fontsize","10px")
               .text(function(d)
               {
                if (d.r > 18){
                   return format(d.Quantity)
                 }
                return []
               });
            // transition in size
            node.transition()
               .ease(d3.easePolyInOut)
               .duration(time_transition)
               .tween('radius', function(d)
               {
                  var that = d3.select(this);
                  var i = d3.interpolate(1, d.newR);
                  return function(t)
                  {
                     d.r = i(t);
                     that.attr('r', function(d)
                     {
                        return d.r;
                     });
                     simulationStart.nodes(nodes).alpha(1);
                  }
               });
            // fade in text color
            node.select('text')
               .transition()
               .ease(d3.easePolyInOut)
               .duration(600)
               .style('fill', 'black');
            // fade in circle size
            node.select('circle')
               .transition()
               .ease(d3.easePolyInOut)
               .duration(600)
               .style('fill',d => d.color);
         }
         else
         {
            // transition to new size
            node.transition()
               .ease(d3.easeLinear)
               .duration(time_transition)
               .tween('radius', function(d)
               {
                  var that = d3.select(this);
                  var i = d3.interpolate(d.oldR, d.newR);
                  return function(t)
                  {
                     d.r = i(t);
                     that.attr('r', function(d)
                     {
                        return d.r;
                     });
                     simulation.nodes(nodes).alpha(1);
                  }
               });
            // transition to new color
            node.select('circle')
               .transition()
               .ease(d3.easeLinear)
               .duration(time_transition)// divide by 2 ??
               .style('fill', d => d.color);

           node.select("text")
               .transition()
               .ease(d3.easeLinear)
               .duration(time_transition/2)
               .attr("dy", d => {
                 if (d.r > 25){
                   return '-0.2em'
                 }else{
                   return '0.3em'
                 }
               })
               .style('fill', 'black')
               .style("fontsize", d => {
                  let nameFontSize;
                  if (d.r > 18) {
                    nameFontSize = (d.name.length * 10 > d.r * 2) ? '8px' : '10px';
                  } else {
                    nameFontSize = '6px';
                  }
                 return nameFontSize
               })
               .style("text-anchor", "middle")
               .text(d =>
               {
                if (d.newR < 14) {
                    return [];
                  }
                return d.isoCode
               });
           node.select("tspan")
               .transition()
               .ease(d3.easeLinear)
               .duration(time_transition/2)
               .attr("dy", d => {
                 //const shouldShowValue = d.r > 18;
                 if (d.name.length * 10 > d.r * 2){
                   return '0.9em'
                 }else{
                   return '1.0em'
                 }
               })
               .style('fill', 'black')
               .style("text-anchor", "middle")
               .style("fillOpacity",0.7)
               .style("fontsize","10px")
               .text(d => {
                if (d.newR > 25){
                   return format(d.Quantity)
                 }
                return []
              });
              d3.selectAll("svg > *")
                .on("mouseenter", tooltip_in) // when the mouse hovers a node, call the tooltip_in function to create the tooltip
                .on("mouseleave", tooltip_out) // when the mouse stops hovering a node, call the tooltip_out function to get rid of the tooltip
         }
         state += 1;
      }, time_transition)
      return svg.node()
    }
    chart = chart_();

  }).catch(function(err) {
    throw err;
  })

  // The Conversation Colours

textComponent = ({
  key,
  text,
  x = 0,
  y = 0,
  fontWeight = 'bold',
  fontSize = '12px',
  textAnchor = 'middle',
  fillOpacity = 1,
  colour,
  r,
  duration = 1000
}) => {
  return {
    append: 'text',
    key,
    text,
    x,
    y,
    textAnchor,
    fontFamily: 'sans-serif',
    fontWeight,
    fontSize,
    fillOpacity: { enter: fillOpacity, exit: 0 },
    fill: colour,
    duration,
    style: {
      pointerEvents: 'none'
    }
  };
}

labelComponent = ({ isoCode, countryName, Quantity, r, colour }) => {
  // Don't show any text for radius under 12px
  if (r < 12) {
    return [];
  }

  const circleWidth = r * 2;
  const nameWidth = countryName.length * 10;
  const shouldShowIso = nameWidth > circleWidth;
  const newCountryName = shouldShowIso ? isoCode : countryName;
  const shouldShowValue = r > 18;

  let nameFontSize;

  if (shouldShowValue) {
    nameFontSize = shouldShowIso ? '10px' : '12px';
  } else {
    nameFontSize = '8px';
  }

  return [
    textComponent({
      key: isoCode,
      text: newCountryName,
      fontSize: nameFontSize,
      y: shouldShowValue ? '-0.2em' : '0.3em',
      fillOpacity: 1,
      colour
    }),
    ...(shouldShowValue
      ? [
          textComponent({
            key: isoCode,
            text: format(Quantity),
            fontSize: '10px',
            y: shouldShowIso ? '0.9em' : '1.0em',
            fillOpacity: 0.7,
            colour
          })
        ]
      : [])
  ];
}

format = value => {
  const newValue = d3.format("0.2s")(value);

  if (newValue.indexOf('m') > -1) {
    return parseInt(newValue.replace('m', '')) / 1000;
  }

  return newValue;
}

function getDataBy({
  date,
  selectedContinents
}) {
  return (
    data__
      .filter(d => d)
      .filter(d => {
        return d.date === getIsoDate(date);
      })
      .filter(d => {
        const country = countries.find(c => c.name === d.name);
        const continent = continents.find((c, i) => {
          if (!country) {
            return false;
          }

          return c.id === country.continentCode;
        });

        if (!continent) {
          return false;
        }

        return selectedContinents.includes(continent.id);
      })
      .map(d => {
        const country = countries.find(c => c.name === d.name);
        const continent = continents.find(c => c.id === country.continentCode);

        const name = country.shortName || country.name;

        return {
          name,
          id: country.iso3,
          r: d.r,
          fill: continent.fill,
          color: continent.color || 'black'
        };
      })
      .filter(d => d.value !== "0.0")
  );
}
  
  function ticker(svg,width,height,state) {
  const now = svg.append("text")
      .style("font", `bold ${0.1*(width+height)/2}px var(--sans-serif)`)
      .style("font-variant-numeric", "tabular-nums")
      .style('fill', 'white')
      .attr("text-anchor", "end")
      .attr("x", width - 48*1.1)
      .attr("y",  {0.1*(width+height)/2 * (1.5 - 0.45))
      .attr("dy", "0.32em")
      .text((keyframes_country[0][1].data_state[state].date).substr(0,4));

  return (state_) => {
    svg.transition()
        .duration(1000)
        .ease(d3.easeLinear).end().then(() => now.text((keyframes_country[0][1].data_state[state_].date).substr(0,4)));
  };
}

getIsoDate = date => {
  return date.toISOString().split('T')[0];
}

}
