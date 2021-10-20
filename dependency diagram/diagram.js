var data = {
    "nodes": [
      {"name": "main", expanded: true, fixed: true, type: 'job', childNodes: [
        {"name": "Job 1", type: 'job'},
        {"name": "Job 2.1", type: 'job'},
        {"name": "Job 2.2", type: 'job'},
        {"name": "Job 3", type: 'job'},
      ], childLinks: [
        {"source": 0, "target": 1, type: 'step'},
        {"source": 0, "target": 2, type: 'step'},
        {"source": 1, "target": 3, type: 'step'},
        {"source": 2, "target": 3, type: 'step'},
      ]},
      {"name": "Job 4", type: 'job'},
      {"name": "Job 5", type: 'job'},
      {"name": "Job 6", type: 'job'},
      {"name": "Job 7", type: 'job'},
      {"name": "Job 8", type: 'job'},
      {"name": "Job 9", type: 'job'},
      {"name": "Job 10", type: 'job'},
      {"name": "Job 11", type: 'job'},
      {"name": "Resource", type: 'resource'},
      {"name": "Variable", type: 'variable'},
      {"name": "File", type: 'file'},
    ],
    "links": [
      {"source": 0, "target": 1, type: 'dependency', reverseArrow: true},
      {"source": 0, "target": 2, type: 'precheck', reverseArrow: true},
      {"source": 0, "target": 3, type: 'notify'},
      {"source": 0, "target": 4, type: 'recover'},
      {"source": 0, "target": 5, type: 'notify', reverseDirection: true},
      {"source": 0, "target": 6, type: 'recover', reverseDirection: true},
      {"source": 0, "target": 7, type: 'precheck', reverseArrow: true, reverseDirection: true},
      {"source": 0, "target": 8, type: 'dependency', reverseArrow: true, reverseDirection: true},
      {"source": 0, "target": 9, type: 'dependency', reverseArrow: true, reverseDirection: true},
      {"source": 0, "target": 10, type: 'dependency', reverseArrow: true, reverseDirection: true},
      {"source": 0, "target": 11, type: 'dependency', reverseArrow: true, reverseDirection: true},
    ]
  }
  
  var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return `<strong>Name:</strong> <span style='color:red'>${d.name}</span><br><br>
              <button>Details</button> <button>Diagram</button>`;
    });
  var lineTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
      return `<strong>Type:</strong> <span style='color:red'>${d.type}</span>`;
    });
  
  var width = 1000,
      height = 1000,
      padding = 50,
      off = 20,
      nodeHeight = 20,
      expand = {}, // expanded clusters
      net, hullg, hull, linkg, link, nodeg, node;
  
  function initializeNodeData(d, isChild) {
    d.x = (isChild ? 0 : width/2) + Math.random();
    d.y = (isChild ? 0 : height/2) + Math.random();
    d.width = d.name.length;
    if (d.childNodes) {
      d.childNodes.forEach(function(child) {initializeNodeData(child, true)});
      if (d.childLinks) {
        initializeDepth(d.childLinks, d.childNodes);
      }
    }
  }
  data.nodes.forEach(initializeNodeData);
  
  function initializeDepth(links, nodes) {
    while (assignDepths(links, nodes)) {}
    var minDepth, maxDepth;
    nodes.forEach(function(node) {
      if (node.depth !== undefined &&
          (minDepth === undefined || node.depth < minDepth)) {
        minDepth = node.depth;
      }
      if (node.depth !== undefined &&
          (maxDepth === undefined || node.depth > maxDepth)) {
        maxDepth = node.depth;
      }
    });
    var averageDepth = Math.floor((minDepth + maxDepth)/2);
    nodes.forEach(function(node) {
      node.depth -= averageDepth;
      node.depth = Math.abs(node.depth);
    });
  }
  function assignDepths(links, nodes) {
    var updated = [];
    links.forEach(function(link) {
      var source = nodes[link.source],
          target = nodes[link.target],
          dir = link.reverseDirection ? -1 : 1;
      if (source.depth === undefined) {
        source.depth = (target.depth === undefined) ? 0 : target.depth + dir;
        updated.push(link.source);
      }
      if (target.depth === undefined) {
        target.depth = source.depth + dir;
        updated.push(link.target);
      }
      if (target.depth !== source.depth + dir) {
        if (updated.indexOf(link.target) === -1) {
          target.depth = source.depth + dir;
          updated.push(link.target);
        } else if (updated.indexOf(link.source) === -1) {
          source.depth = target.depth - dir;
          updated.push(link.source);
        }
      }
    });
    return updated.length > 0;
  }
  initializeDepth(data.links, data.nodes);
  
  var fill = d3.scale.category20(); // d3.scaleOrdinal(d3.schemeCategory20); 
  var force = d3.layout.force()
    .charge(-400)
    .friction(0.1)
    .size([width, height]);
  var curve = d3.svg.line()
    .interpolate("cardinal-closed")
    .tension(.85);
  var svg = d3.select("#chart")
    .attr("width", width)
    .attr("height", height)
    .call(lineTip)
    .call(tip);
  var link = svg.selectAll("line")
    .data(data.links)
    .enter().append("g");
  link.append('line')
    .style('stroke', 'black')
    .attr('class', function(d) { return d.type + (d.reverseArrow ? ' reverse' : '') })
  link.append('line')
    .style('stroke-width', 10)
    .style('stroke', 'transparent')
    .on('click', function(d) {
      if (d3.event.defaultPrevented) return; // click suppressed
      tip.hide();
      lineTip.show(d);
      event.stopPropagation();
    })
    // .on('mouseout', lineTip.hide)
    ;
  
  var node = svg.selectAll("g.node")
    .data(data.nodes)
    .enter().append("g")
    .style("fill", function(d) { return fill(d.type); })
    .style("stroke", function(d) { return d3.rgb(fill(d.type)).darker(); });
  
  node.filter(function(d){ return d.childNodes !== undefined})
      .on('click', function(d) { if (d3.event.defaultPrevented) return; d.expanded = !d.expanded; update() });
    node.filter(function(d) { return !d.childNodes})
      .on('click', function(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
        lineTip.hide();
        tip.show(d);
        event.stopPropagation();
      })
      .call(force.drag);
  
  svg.on('click', function() {
    lineTip.hide();
    tip.hide();
  });
  
  function update() {
    node.attr('class', function(d) { return d.childNodes && d.expanded ? 'node hull' : 'node single' });
    node
      .selectAll('.hull > rect')
      .attr('x', function(d) { return -d.width/2 })
      .attr("width", function(d) { return d.width })
    ;
    force.start();
  }
  
  var hull = node.filter(function(d){ return d.childNodes !== undefined;});
  hull.append('path')
      .style("fill", function(d) { return d3.rgb(fill(d.type)).brighter(0.8); });
  hull.forEach(function(el) {
    if (!el[0])
      return;
    var d = el[0].__data__,
        subForce = d3.layout.force().charge(-200);
    var subLink = d3.select(el[0]).selectAll("line")
      .data(d.childLinks)
      .enter().append("g");
    subLink.append('line')
      .style('stroke', 'black')
      .attr('class', function(d) { return d.type + (d.reverseArrow ? ' reverse' : '') });
    subLink.append('line')
      .style('stroke-width', 10)
      .style('stroke', 'transparent')
      .on('click', function(d) {
        tip.hide();
        lineTip.show(d);
        event.stopPropagation();
      })
      // .on('mouseout', lineTip.hide)
    var subNode = d3.select(el[0]).selectAll('g.node.'+d.name)
      .data(d.childNodes)
      .enter().append("g")
      .attr('class', 'node single '+d.name)
      .style("fill", function(d) { return fill(d.type); })
      .style("stroke", function(d) { return d3.rgb(fill(d.type)).darker(); })
      .call(subForce.drag)
      .on('click', function(d) {
        lineTip.hide();
        tip.show(d);
        event.stopPropagation();
      });
    subNode.append('rect')
      .attr('y', '-0.4em')
      .attr("height", '1em');
    subNode.append('text')
      .text(function(d) { return d.name })
      .attr('dy', '0.5em')
      .attr('dx', function(d) { d.width = this.clientWidth + padding; d.height = 16; return this.clientWidth/2 })
      .style("stroke", function(d) { return d3.rgb(fill(d.type)).darker(3); })
    ;
    subNode.select('rect')
      .attr('x', function(d) { return -d.width/2 })
      .attr("width", function(d) { return d.width })
    ;
  
    subForce
      .nodes(d.childNodes)
      .links(d.childLinks)
      .on("tick", function(e) {
        tick(e, d.childNodes, subForce, subNode, subLink, undefined, d);
        force.start();
        force.alpha(e.alpha);
      })
      .start();
    });/**/
    node
      .append('rect')
      .attr('y', '-0.4em')
      .attr("height", '1em')
    ;
    node.append('text')
      .text(function(d) { return d.name })
      .attr('dy', '0.5em')
      .attr('dx', function(d) { d.width = this.clientWidth + padding; d.height = nodeHeight + padding; return this.clientWidth/2 })
      .style("stroke", function(d) { return d3.rgb(fill(d.type)).darker(3); })
    ;
    node
      .select('rect')
      .attr('x', function(d) { return -d.width/2 })
      .attr("width", function(d) { return d.width })
    ;
    force
      .nodes(data.nodes)
      .links(data.links)
      .on("tick", function(e) {
        tick(e, data.nodes, force, node, link, {
          xmax: width,
          xmin: 0,
          ymax: height,
          ymin: 0,
        })
      });
  update();
  
  function linkLength(link) {
    return link.source.width/2 + link.target.width/2 + 20;
  }
  function linkStart(link) {
    return link.reverseDirection ? rectIntersection(link.target, link.source) : rectIntersection(link.source, link.target);
  }
  function linkEnd(link) {
    return link.reverseDirection ? rectIntersection(link.source, link.target) : rectIntersection(link.target, link.source);
  }
  function rectIntersection(rect, point) {
    var halfWidth = rect.width/2, halfHeight = rect.height/2;
    return pointOnRect(point.x, point.y, rect.x - halfWidth, rect.y - halfHeight, rect.x + halfWidth, rect.y + halfHeight);
  }
  function rectRight(rect) {
    return {
      x: rect.x + rect.width/2,
      y: rect.y,
    };
  }
  function rectLeft(rect) {
    return {
      x: rect.x - rect.width/2,
      y: rect.y,
    };
  }
  /**
   * Finds the intersection point between
   *     * the rectangle
   *       with parallel sides to the x and y axes 
   *     * the half-line pointing towards (x,y)
   *       originating from the middle of the rectangle
   *
   * Note: the function works given min[XY] <= max[XY],
   *       even though minY may not be the "top" of the rectangle
   *       because the coordinate system is flipped.
   *
   * @param (x,y):Number point to build the line segment from
   * @param minX:Number the "left" side of the rectangle
   * @param minY:Number the "top" side of the rectangle
   * @param maxX:Number the "right" side of the rectangle
   * @param maxY:Number the "bottom" side of the rectangle
   * @param check:boolean (optional) whether to treat point inside the rect as error
   * @return an object with x and y members for the intersection
   * @throws if check == true and (x,y) is inside the rectangle
   * @author TWiStErRob
   * @see <a href="http://stackoverflow.com/a/31254199/253468">source</a>
   * @see <a href="http://stackoverflow.com/a/18292964/253468">based on</a>
   */
  function pointOnRect(x, y, minX, minY, maxX, maxY, check) {
      //assert minX <= maxX;
      //assert minY <= maxY;
      if (check && (minX <= x && x <= maxX) && (minY <= y && y <= maxY))
          throw "Point " + [x,y] + "cannot be inside "
              + "the rectangle: " + [minX, minY] + " - " + [maxX, maxY] + ".";
      var midX = (minX + maxX) / 2;
      var midY = (minY + maxY) / 2;
      // if (midX - x == 0) -> m == ±Inf -> minYx/maxYx == x (because value / ±Inf = ±0)
      var m = (midY - y) / (midX - x);
  
      if (x <= midX) { // check "left" side
          var minXy = m * (minX - x) + y;
          if (minY < minXy && minXy < maxY)
              return {x: minX, y: minXy};
      }
  
      if (x >= midX) { // check "right" side
          var maxXy = m * (maxX - x) + y;
          if (minY < maxXy && maxXy < maxY)
              return {x: maxX, y: maxXy};
      }
  
      if (y <= midY) { // check "top" side
          var minYx = (minY - y) / m + x;
          if (minX < minYx && minYx < maxX)
              return {x: minYx, y: minY};
      }
  
      if (y >= midY) { // check "bottom" side
          var maxYx = (maxY - y) / m + x;
          if (minX < maxYx && maxYx < maxX)
              return {x: maxYx, y: maxY};
      }
  
      // Should never happen :) If it does, please tell me!
      throw "Cannot find intersection for " + [x,y]
          + " inside rectangle " + [minX, minY] + " - " + [maxX, maxY] + ".";
  }
  
  function getGroup(n) {
    return n.group;
  }
  function convexHulls(nodes, index, offset) {
    var hulls = {};
  
    // create point sets
    for (var k=0; k<nodes.length; ++k) {
      var n = nodes[k];
      var i = index(n);
      if (i === undefined) continue;
      var l = hulls[i] || (hulls[i] = []);
      l.push([n.x - (n.width/2 + offset), n.y - (nodeHeight/2 + offset)]);
      l.push([n.x - (n.width/2 + offset), n.y + (nodeHeight/2 + offset)]);
      l.push([n.x + (n.width/2 + offset), n.y - (nodeHeight/2 + offset)]);
      l.push([n.x + (n.width/2 + offset), n.y + (nodeHeight/2 + offset)]);
    }
  
    // create convex hulls
    var hullset = [];
    for (i in hulls) {
      hullset.push({group: i, path: d3.geom.hull(hulls[i])});
    }
  
    return hullset;
  }
  function drawCluster(d) {
    var hulls = convexHulls(d.childNodes, function(){return 'group'}, off);
    if (hulls.length === 0)
      return;
    return curve(hulls[0].path); // 0.8
  }
  function collide(node) {
    return function(quad, x1, y1, x2, y2) {
      var updated = false;
      if (quad.point && (quad.point !== node) && node.group === quad.point.group) {
  
        var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          xSpacing = (quad.point.width + node.width) / 2,
          ySpacing = (quad.point.height + node.height) / 2,
          absX = Math.abs(x),
          absY = Math.abs(y),
          l,
          lx,
          ly;
  
        if (absX < xSpacing && absY < ySpacing) {
          l = Math.sqrt(x * x + y * y);
  
          lx = (absX - xSpacing) / l;
          ly = (absY - ySpacing) / l;
  
          // the one that's barely within the bounds probably triggered the collision
          if (Math.abs(lx) > Math.abs(ly)) {
            lx = 0;
          } else {
            ly = 0;
          }
  
          node.x -= x *= lx;
          node.y -= y *= ly;
          quad.point.x += x;
          quad.point.y += y;
  
          updated = true;
        }
      }
      return updated;
    };
  }
  
  function tick(e, nodes, force, node, link, bounds, parent) {
    var k = 10 * e.alpha;
    var q = d3.geom.quadtree(nodes),
        i = 0,
        nodesCount = nodes.length;
  
    //    if (!hull.empty()) {
    //      hull.data(convexHulls(force.nodes(), getGroup, off))
    //          .attr("d", drawCluster);
    //    }
  
    while (++i < nodesCount) q.visit(collide(nodes[i]));
    force.links().forEach(function(link) {
      var r = (1-link.source.depth)*linkLength(link), dx, dy, lx = linkLength(link),
          dir = link.reverseDirection ? -1 : 1;
  
      // #1: constraint all nodes to the visible screen:
      //d.x = Math.min(width - r, Math.max(r, d.x));
      //d.y = Math.min(height - r, Math.max(r, d.y));
  
      // Attempt at weak left and right alignment
      // link.target.px -= dir * (link.source.depth * lx + r) * k / 4;
  
      // #1.0: hierarchy: same level nodes have to remain with a 1 LX band vertically:
      var px = link.source.x;
      link.target.px = link.target.x = px + dir * (link.source.depth * lx + r);
  
      // #2: hierarchy means targets must be to the right of sources in X direction:
      if (link.reverseDirection) {
        link.target.x = Math.min(link.target.x, link.source.x - lx);
        link.target.px = Math.min(link.target.px, link.source.px - lx)/2;
      } else {
        link.target.x = Math.max(link.target.x, link.source.x + lx);
        link.target.px = Math.max(link.target.px, link.source.px + lx)/2;
      }
    });
    if (bounds) {
      force.nodes().forEach(function(d) {
        var lx = 30;
        // #1a: constraint all nodes to the visible screen: links
        dx = Math.min(0, bounds.xmax - d.width/2 - d.x) + Math.max(0, d.width/2 - d.x - bounds.xmin);
        dy = Math.min(0, bounds.ymax - nodeHeight - d.y) + Math.max(0, nodeHeight - d.y - bounds.ymin);
        d.x += 2 * Math.max(-lx, Math.min(lx, dx));
        d.y += 2 * Math.max(-lx, Math.min(lx, dy));
        // #1b: constraint all nodes to the visible screen: charges ('repulse')
        dx = Math.min(0, bounds.xmax - d.width/2 - d.px) + Math.max(0, d.width/2 - d.px - bounds.xmin);
        dy = Math.min(0, bounds.ymax - nodeHeight - d.py) + Math.max(0, nodeHeight - d.py - bounds.ymin);
        d.px += 2 * Math.max(-lx, Math.min(lx, dx));
        d.py += 2 * Math.max(-lx, Math.min(lx, dy));
      });
    }
  
    link
      .selectAll('line')
      .attr("x1", function(d) { return linkStart(d).x; })
      .attr("y1", function(d) { return linkStart(d).y; })
      .attr("x2", function(d) { return linkEnd(d).x; })
      .attr("y2", function(d) { return linkEnd(d).y; });
  
    node
      .filter(function(d){
        if(d.childNodes !== undefined && d.childNodes.length > 0) {
          // Move cluster based on average of child nodes
          var xsum = 0, ysum = 0;
          d.childNodes.forEach(function(child) {
            xsum += child.x;
            ysum += child.y;
          });
          var xave = xsum/d.childNodes.length,
              yave = ysum/d.childNodes.length;
          // d.x += xave;
          d.y += yave;
          // d.px += xave;
          d.py += yave * k / 500;
          d.childNodes.forEach(function(child) {
            child.x -= xave;
            child.y -= yave;
            child.px -= xave * k / 500;
            child.py -= yave * k / 500;
          });
          d.width = this.getBBox().width;
          d.height = this.getBBox().height;
          return true;
        }
        return false;
      })
      .select('path')
      .attr('d', drawCluster)
    ;
    node
    //      .filter(function(d){ return d.groupNode === undefined;})
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    ;
  }