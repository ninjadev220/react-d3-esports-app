import React, { useEffect, useContext } from 'react';
import * as d3 from 'd3';
import d3Tip from 'd3-tip';

import TranslationContext from '../contexts/TranslationContext';

function LeaderboardsTopGamesByTournaments() {
  const t = useContext(TranslationContext);
  const pageData = t.data;

  useEffect(() => {
    // SETUP
    let svg = d3.select('svg'),
      margin = {
        top: 20,
        right: 20,
        bottom: 60,
        left: 190
      },
      x = d3.scaleLinear(),
      y = d3.scaleBand().padding(0.5),
      data = undefined;

    const formatNumber = (d, prefix = '') => {
      if (d === 0) {
        return prefix + 0;
      } else if (d < 1000) {
        return prefix + d;
      } else if (d < 1e6) {
        return prefix + d3.formatPrefix(',.1', 1e3)(d);
      } else if (d >= 1e6) {
        return prefix + d3.formatPrefix(',.1', 1e6)(d);
      } else {
        return prefix + d;
      }
    };

    let g = svg
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    g.append('g').attr('class', 'axis axis--x');
    g.append('g').attr('class', 'axis axis--y');

    // DRAW CHART
    function draw() {
      let bounds = svg.node().getBoundingClientRect(),
        width = bounds.width - margin.left - margin.right,
        height = bounds.height - margin.top - margin.bottom;

      x.rangeRound([0, width]);
      y.rangeRound([height, 0]);

      g.select('.axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(
          d3
            .axisBottom(x)
            .tickFormat(d => formatNumber(d))
            .tickSizeInner([-height])
        )
        .selectAll('text')
        .attr('transform', 'translate(-10,10)rotate(-45)')
        .style('text-anchor', 'end');
      g.select('.axis--y')
        .call(d3.axisLeft(y))
        .selectAll('text')
        .attr('dx', '');

      // Y AXIS LABEL
      g.select('.y-axis-label').remove();
      g.append('text')
        .attr('y', 0 - 175)
        .attr('x', 0 - height / 2)
        .attr('class', 'y-axis-label')
        .text(pageData.cat2_sub3_txt1);

      // TOOLTIP
      let tip = d3Tip()
        .attr('class', 'd3-tip horizontal')
        .offset([-10, 0])
        .html(
          d =>
            `<div class='title'>${d.game}</div><div>${d3.format(',')(
              d.value
            )}</div>`
        );
      g.call(tip);

      // GRADIENT
      const gradient = svg
        .append('svg:defs')
        .append('svg:linearGradient')
        .attr('id', 'gradient');
      gradient
        .append('stop')
        .attr('stop-color', '#00ffcc')
        .attr('offset', '0%');
      gradient
        .append('stop')
        .attr('stop-color', '#12a085')
        .attr('offset', '100%');

      let bars = g.selectAll('.bar').data(data);

      // ENTER
      bars
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 1)
        .attr('y', d => y(d.game))
        .attr('width', d => x(d.value))
        .attr('height', y.bandwidth())
        .style('fill', 'url(#gradient)')
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

      // UPDATE
      bars
        .attr('x', 1)
        .attr('y', d => y(d.game))
        .attr('width', d => x(d.value))
        .attr('height', y.bandwidth());

      // EXIT
      bars.exit().remove();
    }

    // LOADING DATA
    function loadData() {
      const csvFilePath = 'data/leaderboards_top-games-by-tournaments.csv';

      d3.csv(csvFilePath).then(result => {
        result.forEach(d => {
          d.value = +d.value;
        });

        data = result.sort((a, b) => d3.ascending(a.value, b.value));

        x.domain([0, d3.max(data, d => d.value)]);
        y.domain(data.map(d => d.game));

        draw();
      });
    }

    // START!
    loadData();
    window.addEventListener('resize', draw);
  }, [pageData]);

  return (
    <article className='screen screen--sub'>
      <h1 className='screen__heading'>{pageData.cat2_sub3_title}</h1>

      <ul className='screen__desc'>
        <li className='screen__desc__i'>{pageData.cat2_sub3_desc1}</li>
      </ul>

      <div className='screen__data-vis-wrap'>
        <div className='screen__data-vis-inner'>
          <svg id='chart'></svg>
        </div>

        <div className='chart-bottom-note'>{pageData.cat2_sub3_txt2}</div>
      </div>
    </article>
  );
}

export default LeaderboardsTopGamesByTournaments;
