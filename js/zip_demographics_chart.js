// js/zip_demographics_chart.js
// ============================
// Renders a race/ethnicity bar chart in the zipcode side panel when a zip is clicked.
//
// Expected CSV format (like your 01602.csv):
//   Column 1: "Label (Grouping)"
//   Column 2: "ZCTA5 01602" (varies by zip)
//
// You should store files at: data/demographics/01602.csv ... 01610.csv
// (Adjust DEMO_DIR below if you put them elsewhere.)

(function () {
  const DEMO_DIR = "data/demographics"; // <-- change if needed

  // Public function: call this on zipcode click
  window.renderZipDemographicsChart = async function renderZipDemographicsChart(zipCode, opts = {}) {
    const containerSelector = opts.containerSelector || "#zipcode-demographics-chart";
    const container = d3.select(containerSelector);

    // Clear previous
    container.selectAll("*").remove();

    if (!zipCode) {
      container.append("div").text("No ZIP selected.");
      return;
    }

    const zip5 = String(zipCode).padStart(5, "0");
    const url = `${DEMO_DIR}/${zip5}.csv`;

    // Loading message
    container.append("div")
      .attr("class", "chart-loading")
      .style("font-size", "13px")
      .style("color", "#666")
      .text(`Loading demographics for ${zip5}...`);

    let rows;
    try {
      rows = await d3.csv(url);
    } catch (err) {
      container.selectAll("*").remove();
      container.append("div")
        .style("font-size", "13px")
        .style("color", "#b00020")
        .text(`Could not load demographics file for ${zip5}. Expected: ${url}`);
      console.error("[zip_demographics_chart] load failed:", err);
      return;
    }

    container.selectAll("*").remove();

    if (!rows || rows.length === 0) {
      container.append("div").text(`No demographics data found for ${zip5}.`);
      return;
    }

    // Identify the value column (2nd column, like "ZCTA5 01602")
    const cols = Object.keys(rows[0]);
    const labelCol = cols[0];
    const valueCol = cols[1];

    // Helper: normalize labels (strip weird indentation / NBSP)
    const cleanLabel = (s) =>
      String(s || "")
        .replace(/\u00a0/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    // Helper: parse numbers like "25,382"
    const parseNum = (v) => {
      const n = Number(String(v || "").replace(/,/g, "").trim());
      return Number.isFinite(n) ? n : 0;
    };

    // Build a lookup map label -> value
    const valueByLabel = new Map();
    for (const r of rows) {
      const k = cleanLabel(r[labelCol]);
      valueByLabel.set(k, parseNum(r[valueCol]));
    }

    // Pull totals + categories we care about
    const total = valueByLabel.get("Total:") || 0;

    const hispanic =
      valueByLabel.get("Hispanic or Latino") || 0;

    const white =
      valueByLabel.get("White alone") || 0;

    const black =
      valueByLabel.get("Black or African American alone") || 0;

    const asian =
      valueByLabel.get("Asian alone") || 0;

    const aian =
      valueByLabel.get("American Indian and Alaska Native alone") || 0;

    const nhpi =
      valueByLabel.get("Native Hawaiian and Other Pacific Islander alone") || 0;

    const other =
      valueByLabel.get("Some Other Race alone") || 0;

    // Remaining bucket: mostly "Not Hispanic multi-race" in this table structure
    const remaining = Math.max(0, total - (hispanic + white + black + asian + aian + nhpi + other));

    const data = [
      { group: "Hispanic/Latino", value: hispanic },
      { group: "White", value: white },
      { group: "Black", value: black },
      { group: "Asian", value: asian },
      { group: "AIAN", value: aian },
      { group: "NHPI", value: nhpi },
      { group: "Other", value: other },
      { group: "Two+ / Remaining", value: remaining },
    ].map(d => ({
      ...d,
      pct: total > 0 ? (d.value / total) * 100 : 0
    }));

    // Sort bars (optional). Comment out if you want fixed order.
    // data.sort((a, b) => b.pct - a.pct);

    // --- Chart sizing ---
    const width = opts.width || 310;     // fits your side panel nicely
    const height = opts.height || 220;
    const margin = { top: 10, right: 10, bottom: 55, left: 45 };

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);

    // Title
    svg.append("text")
      .attr("x", margin.left)
      .attr("y", 9)
      .attr("font-size", 11)
      .attr("font-weight", 700)
      .text(`Race/Ethnicity (% of total) — ${zip5}`);

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top + 10})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.group))
      .range([0, innerW])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.pct) || 1])
      .nice()
      .range([innerH, 0]);

    // Bars
    g.selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.group))
      .attr("y", d => y(d.pct))
      .attr("width", x.bandwidth())
      .attr("height", d => innerH - y(d.pct))
      .attr("fill", "#444"); // keep neutral; you can style later

    // Value labels on top of bars
    g.selectAll("text.bar-label")
      .data(data)
      .join("text")
      .attr("class", "bar-label")
      .attr("x", d => x(d.group) + x.bandwidth() / 2)
      .attr("y", d => y(d.pct) - 4)
      .attr("text-anchor", "middle")
      .attr("font-size", 10)
      .attr("fill", "#111")
      .text(d => `${d.pct.toFixed(1)}%`);

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`))
      .selectAll("text")
      .attr("font-size", 10);

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-35)")
      .attr("dx", "-0.4em")
      .attr("dy", "0.25em");

    // Footer note
    container.append("div")
      .style("font-size", "12px")
      .style("color", "#666")
      .style("margin-top", "6px")
      .text(total ? `Total population: ${total.toLocaleString()}` : "Total population unavailable.");
  };
})();