function renderZipRedliningChart(zipCode) {
    d3.csv("data/worcester_zip_redlining_breakdown.csv").then(data => {

        const row = data.find(d => d.zip === zipCode);
        if (!row) return;

        const chartData = [
            { grade: "Red", value: +row.Red },
            { grade: "Yellow", value: +row.Yellow },
            { grade: "Green", value: +row.Green },
            { grade: "Blue", value: +row.Blue },
            { grade: "Gray", value: +row.Gray },
            { grade: "No category", value: (100 - row.Red - row.Yellow - row.Green - row.Blue - row.Gray) }
        ];

        

        const container = d3.select("#zip-redlining-chart-container");
        container.html(""); // clear old chart

        const width = container.node().clientWidth; // makt the width the size of the side panel
        const height = 220;
        const margin = { top: 20, right: 20, bottom: 20, left: 80 }; // leave space for labels

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // x = value scale (horizontal)
        const x = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.value)])
            .range([0, chartWidth])
            .nice();

        // y = grade scale (vertical)
        const y = d3.scaleBand()
            .domain(chartData.map(d => d.grade))
            .range([0, chartHeight])
            .padding(0.2);

        // color mapping
        const colorMap = {
            "Red": "#e74c3c",
            "Yellow": "#f1c40f",
            "Green": "#2ecc71",
            "Blue": "#3498db",
            "Gray": "#95a5a6",
            "Unknown": "#7f8c8d"
        };

        g.selectAll("rect")
            .data(chartData)
            .enter()
            .append("rect")
            .attr("y", d => y(d.grade))
            .attr("x", 0)
            .attr("height", y.bandwidth())
            .attr("width", d => x(d.value))
            .attr("fill", d => colorMap[d.grade]);

        // left axis = labels
        g.append("g")
            .call(d3.axisLeft(y));

        // bottom axis = values
        g.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(d3.axisBottom(x).ticks(5));
    });
}