const jsonURL = 'https://raw.githubusercontent.com/reteuber/visualizaciones_capstone/refs/heads/main/venta_por_turno.json';

document.addEventListener('DOMContentLoaded', function() {
    function createPieChart(day) {
        d3.json(jsonURL).then(data => {
            const filteredData = data.filter(d => d.Día === day);
            const totalVentas = d3.sum(filteredData, d => parseFloat(d.Venta.replace('.', '').replace(',', '.')));

            const pieData = filteredData.map(d => ({
                turno: d.Turno,
                venta: parseFloat(d.Venta.replace('.', '').replace(',', '.')),
                porcentaje: (parseFloat(d.Venta.replace('.', '').replace(',', '.')) / totalVentas) * 100
            }));

            d3.select("#vis-5").select("svg").remove();
            d3.select("#legend").html("");

            const width = 300;
            const height = 300;
            const radius = Math.min(width, height) / 2;

            const svg = d3.select("#vis-5")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);

            const color = d3.scaleOrdinal()
                .domain(pieData.map(d => d.turno))
                .range(["#8297FF", "#F6BA2C"]);

            const pie = d3.pie().value(d => d.porcentaje);
            const arc = d3.arc().innerRadius(0).outerRadius(radius);

            svg.selectAll("path")
                .data(pie(pieData))
                .join("path")
                .attr("d", arc)
                .attr("fill", d => color(d.data.turno))
                .attr("stroke", "white")
                .style("stroke-width", "2px");

            const legend = d3.select("#legend").append("table").attr("class", "table-auto text-left");

            legend.append("thead").append("tr")
                .selectAll("th")
                .data(["", "Turno", "Porcentaje", "Proyección de ventas"])
                .enter()
                .append("th")
                .attr("class", "px-2 py-1 font-semibold")
                .text(d => d);

            const tbody = legend.append("tbody");

            pieData.forEach(d => {
                const row = tbody.append("tr");

                row.append("td")
                    .attr("class", "px-2 py-1")
                    .append("div")
                    .style("width", "12px")
                    .style("height", "12px")
                    .style("border-radius", "50%")
                    .style("background-color", color(d.turno))
                    .style("display", "inline-block")
                    .style("margin-right", "8px");

                row.append("td").attr("class", "px-2 py-1").text(d.turno);
                row.append("td").attr("class", "px-2 py-1").text(`${d.porcentaje.toFixed(2)}%`);
                row.append("td").attr("class", "px-2 py-1").text(`$${d.venta.toLocaleString()}`);
            });
        });
    }

    const initialDay = document.getElementById("dayFilter").value;
    createPieChart(initialDay);

    document.getElementById('dayFilter').addEventListener('change', function() {
        const selectedDay = this.value;
        createPieChart(selectedDay);
    });
});
